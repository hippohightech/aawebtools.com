/**
 * assembler.js — Rebuild translated HTML from source + translated zones
 * Takes an English source HTML and translated segments, produces target language HTML.
 */

import * as cheerio from 'cheerio';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pageMap = JSON.parse(readFileSync(join(__dirname, '..', 'locales', 'page-map.json'), 'utf8'));
const languages = JSON.parse(readFileSync(join(__dirname, '..', 'locales', 'languages.json'), 'utf8'));

const SITE_URL = 'https://aawebtools.com';

/**
 * Generate hreflang link tags for a given page across all available languages
 */
function generateHreflangTags(pageKey) {
  const urls = pageMap.pages[pageKey];
  if (!urls) return '';

  let tags = '';
  for (const [lang, path] of Object.entries(urls)) {
    tags += `  <link rel="alternate" hreflang="${lang}" href="${SITE_URL}${path}">\n`;
  }
  // x-default points to English (or first available)
  const defaultUrl = urls.en || Object.values(urls)[0];
  tags += `  <link rel="alternate" hreflang="x-default" href="${SITE_URL}${defaultUrl}">\n`;
  return tags;
}

/**
 * Generate og:locale and og:locale:alternate tags
 */
function generateOgLocaleTags(pageKey, targetLang) {
  const langConfig = languages.languages.find(l => l.code === targetLang);
  if (!langConfig) return '';

  let tags = `  <meta property="og:locale" content="${langConfig.locale}">\n`;

  const urls = pageMap.pages[pageKey];
  if (urls) {
    for (const [lang] of Object.entries(urls)) {
      if (lang === targetLang) continue;
      const altConfig = languages.languages.find(l => l.code === lang);
      if (altConfig) {
        tags += `  <meta property="og:locale:alternate" content="${altConfig.locale}">\n`;
      }
    }
  }
  return tags;
}

/**
 * Rewrite internal links to target language equivalents
 */
function rewriteInternalLinks($, targetLang) {
  if (targetLang === 'en') return; // EN links stay as-is

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#') || href.startsWith('mailto:')) return;

    // Find matching page in page-map
    for (const [, urls] of Object.entries(pageMap.pages)) {
      if (urls.en === href && urls[targetLang]) {
        $(el).attr('href', urls[targetLang]);
        return;
      }
    }
  });
}

/**
 * Remove data-en/data-fr attributes (cleanup for build system output)
 */
function removeDataLangAttributes($) {
  $('[data-en]').each((_, el) => {
    $(el).removeAttr('data-en');
    $(el).removeAttr('data-fr');
    $(el).removeAttr('data-href');
  });
}

/**
 * Assemble a translated HTML page
 * @param {string} sourceHtml - English source HTML
 * @param {object} translated - Translated content segments
 * @param {string} targetLang - Target language code (e.g., 'es')
 * @param {string} pageKey - Page key from page-map.json
 * @returns {string} Complete translated HTML
 */
export function assembleTranslatedPage(sourceHtml, translated, targetLang, pageKey) {
  const $ = cheerio.load(sourceHtml, { decodeEntities: false });
  const langConfig = languages.languages.find(l => l.code === targetLang);

  if (!langConfig) throw new Error(`Unknown language: ${targetLang}`);

  // 1. Set <html lang="xx"> and dir
  $('html').attr('lang', targetLang);
  if (langConfig.dir === 'rtl') {
    $('html').attr('dir', 'rtl');
  } else {
    $('html').removeAttr('dir');
  }

  // 2. Replace meta tags
  if (translated.meta) {
    if (translated.meta.title) $('title').text(translated.meta.title);
    if (translated.meta.description) $('meta[name="description"]').attr('content', translated.meta.description);
    if (translated.meta.keywords) $('meta[name="keywords"]').attr('content', translated.meta.keywords);
  }

  // 3. Remove deprecated content-language meta tag.
  // It has been deprecated since 2010, Google ignores it, Bing partially
  // honors it but the canonical/hreflang/html-lang chain is sufficient.
  // Keeping it caused noise in validators and false-positive lints.
  $('meta[http-equiv="content-language"]').remove();

  // 4. Update canonical URL
  const targetUrl = pageMap.pages[pageKey]?.[targetLang];
  if (targetUrl) {
    $('link[rel="canonical"]').attr('href', `${SITE_URL}${targetUrl}`);
  }

  // 5. Replace all existing hreflang tags with regenerated ones
  $('link[rel="alternate"][hreflang]').remove();
  const hreflangTags = generateHreflangTags(pageKey);
  if (hreflangTags) {
    $('link[rel="canonical"]').after('\n' + hreflangTags);
  }

  // 6. Update OG tags
  if (translated.og) {
    if (translated.og.title) $('meta[property="og:title"]').attr('content', translated.og.title);
    if (translated.og.description) $('meta[property="og:description"]').attr('content', translated.og.description);
    if (targetUrl) $('meta[property="og:url"]').attr('content', `${SITE_URL}${targetUrl}`);
  }

  // 7. Replace og:locale and add og:locale:alternate
  $('meta[property="og:locale"]').remove();
  $('meta[property="og:locale:alternate"]').remove();
  const ogLocaleTags = generateOgLocaleTags(pageKey, targetLang);
  const ogSiteName = $('meta[property="og:site_name"]');
  if (ogSiteName.length) {
    ogSiteName.after('\n' + ogLocaleTags);
  }

  // 8. Update Twitter card tags
  if (translated.twitter) {
    if (translated.twitter.title) $('meta[name="twitter:title"]').attr('content', translated.twitter.title);
    if (translated.twitter.description) $('meta[name="twitter:description"]').attr('content', translated.twitter.description);
  }

  // 9. Replace JSON-LD blocks
  if (translated.jsonld && translated.jsonld.length > 0) {
    $('script[type="application/ld+json"]').each((i, el) => {
      if (translated.jsonld[i]) {
        $(el).html(translated.jsonld[i]);
      }
    });
  }

  // 10. Replace body sections
  //
  // INVARIANT: the number of translated sections MUST equal the number
  // of source sections. The previous implementation used positional
  // matching with `if (translated.bodySections[i])` which silently
  // skipped any unmatched section, producing pages with half the
  // expected content. We now throw to make the bug loud.
  if (translated.bodySections && translated.bodySections.length > 0) {
    let sourceScope = $('main');
    if (sourceScope.length === 0) sourceScope = $('body');
    const sections = sourceScope.find('> section, > .section');

    if (sections.length !== translated.bodySections.length) {
      throw new Error(
        `assembler: section count mismatch for ${pageKey}/${targetLang} — ` +
        `source has ${sections.length} sections, translated provides ${translated.bodySections.length}. ` +
        `Refusing to assemble a page that would silently drop content.`
      );
    }

    sections.each((i, el) => {
      $(el).replaceWith(translated.bodySections[i]);
    });
  }

  // 11. Update image alt texts
  if (translated.imageAlts && translated.imageAlts.length > 0) {
    let altIndex = 0;
    $('img[alt]').each((_, el) => {
      const alt = $(el).attr('alt');
      if (alt && alt.length > 2 && translated.imageAlts[altIndex]) {
        $(el).attr('alt', translated.imageAlts[altIndex]);
        altIndex++;
      }
    });
  }

  // 12. Rewrite internal links to target language
  rewriteInternalLinks($, targetLang);

  // 13. Remove data-en/data-fr attributes (not needed in build output)
  removeDataLangAttributes($);

  // 14. Add RTL stylesheet for Arabic
  if (langConfig.dir === 'rtl') {
    const mainCss = $('link[href*="main.css"]');
    if (mainCss.length && $('link[href*="rtl.css"]').length === 0) {
      mainCss.after('\n  <link rel="stylesheet" href="/assets/css/rtl.css">');
    }
  }

  // 15. Inject UI strings for JavaScript
  if (translated.uiStrings) {
    const scriptTag = `\n  <script>window.__UI_STRINGS__ = ${JSON.stringify(translated.uiStrings)};</script>`;
    $('script[src*="core.js"]').before(scriptTag);
  }

  return $.html();
}

export { generateHreflangTags, generateOgLocaleTags, rewriteInternalLinks, SITE_URL };
