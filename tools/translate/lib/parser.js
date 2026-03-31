/**
 * parser.js — Extract translatable zones from HTML pages
 * Uses cheerio for server-side DOM parsing.
 * Splits pages into zones: meta, og, jsonld, body sections, nav, footer
 */

import * as cheerio from 'cheerio';
import crypto from 'crypto';

// Brand names and terms that must NEVER be translated
const DO_NOT_TRANSLATE = [
  'AAWebTools', 'ScopeCove', 'TikTok', 'Twitter', 'Instagram',
  'Facebook', 'WhatsApp', 'iPhone', 'Android', 'Google', 'Chrome',
  'Safari', 'Firefox', 'ChatGPT', 'Claude', 'Gemini', 'GPTZero',
  'QuillBot', 'Copyleaks', 'ZeroGPT', 'Turnitin', 'USDS',
  'jsPDF', 'PDF', 'PNG', 'JPG', 'JPEG', 'WebP', 'AVIF', 'SVG',
  'HD', 'API', 'URL', 'CSS', 'HTML', 'SEO',
];

/**
 * Hash text content for cache comparison
 */
export function hashText(text) {
  return crypto.createHash('sha256').update(text.trim()).digest('hex').slice(0, 16);
}

/**
 * Extract all translatable zones from an HTML file
 * @param {string} html - Raw HTML string
 * @returns {object} Extracted zones with content and hashes
 */
export function extractZones(html) {
  const $ = cheerio.load(html, { decodeEntities: false });

  const zones = {
    // Page-level metadata
    htmlLang: $('html').attr('lang') || 'en',
    htmlDir: $('html').attr('dir') || 'ltr',

    // SEO meta
    meta: {
      title: $('title').text() || '',
      description: $('meta[name="description"]').attr('content') || '',
      keywords: $('meta[name="keywords"]').attr('content') || '',
    },

    // Open Graph
    og: {
      title: $('meta[property="og:title"]').attr('content') || '',
      description: $('meta[property="og:description"]').attr('content') || '',
      locale: $('meta[property="og:locale"]').attr('content') || '',
      url: $('meta[property="og:url"]').attr('content') || '',
      image: $('meta[property="og:image"]').attr('content') || '',
    },

    // Twitter cards
    twitter: {
      title: $('meta[name="twitter:title"]').attr('content') || '',
      description: $('meta[name="twitter:description"]').attr('content') || '',
    },

    // Canonical and hreflang (will be regenerated, not translated)
    canonical: $('link[rel="canonical"]').attr('href') || '',

    // JSON-LD structured data blocks
    jsonld: [],

    // Body sections (main content)
    bodySections: [],

    // Elements with data-en attributes (nav, footer text)
    dataAttributes: [],

    // Image alt texts
    imageAlts: [],
  };

  // Extract JSON-LD blocks
  $('script[type="application/ld+json"]').each((i, el) => {
    const raw = $(el).html();
    if (raw) {
      zones.jsonld.push({
        index: i,
        content: raw.trim(),
        hash: hashText(raw),
      });
    }
  });

  // Extract each <section> inside <main> or top-level sections
  const mainSections = $('main > section, main > .section, body > main > section');
  if (mainSections.length === 0) {
    // Fallback: get all sections
    $('section').each((i, el) => {
      const html = $.html(el);
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text.length > 10) {
        zones.bodySections.push({
          index: i,
          html: html,
          textContent: text,
          hash: hashText(text),
        });
      }
    });
  } else {
    mainSections.each((i, el) => {
      const html = $.html(el);
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text.length > 10) {
        zones.bodySections.push({
          index: i,
          html: html,
          textContent: text,
          hash: hashText(text),
        });
      }
    });
  }

  // Extract data-en/data-fr attributes (for migration tracking)
  $('[data-en]').each((i, el) => {
    zones.dataAttributes.push({
      index: i,
      tag: el.tagName,
      enValue: $(el).attr('data-en'),
      frValue: $(el).attr('data-fr') || '',
      href: $(el).attr('href') || '',
      dataHref: $(el).attr('data-href') || '',
    });
  });

  // Extract image alt text for translation
  $('img[alt]').each((i, el) => {
    const alt = $(el).attr('alt');
    if (alt && alt.length > 2 && !DO_NOT_TRANSLATE.includes(alt)) {
      zones.imageAlts.push({
        index: i,
        alt: alt,
        src: $(el).attr('src') || '',
        hash: hashText(alt),
      });
    }
  });

  return zones;
}

/**
 * Get a summary of what needs translation in a page
 */
export function getTranslationSummary(zones) {
  return {
    metaFields: Object.keys(zones.meta).filter(k => zones.meta[k].length > 0).length,
    ogFields: Object.keys(zones.og).filter(k => zones.og[k].length > 0).length,
    jsonldBlocks: zones.jsonld.length,
    bodySections: zones.bodySections.length,
    dataAttributes: zones.dataAttributes.length,
    imageAlts: zones.imageAlts.length,
    totalSegments:
      Object.keys(zones.meta).filter(k => zones.meta[k].length > 0).length +
      Object.keys(zones.og).filter(k => zones.og[k].length > 0).length +
      zones.jsonld.length +
      zones.bodySections.length +
      zones.imageAlts.length,
  };
}

export { DO_NOT_TRANSLATE };
