/**
 * seo.js — Sitemap generation with hreflang, robots.txt update
 * Generates per-language sitemaps and a sitemap index.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pageMap = JSON.parse(readFileSync(join(__dirname, '..', 'locales', 'page-map.json'), 'utf8'));
const languages = JSON.parse(readFileSync(join(__dirname, '..', 'locales', 'languages.json'), 'utf8'));

const SITE_URL = 'https://aawebtools.com';
const FRONTEND_DIR = resolve(__dirname, '..', '..', '..', 'frontend');

// Regex for detecting <meta name="robots" content="noindex..."> in HTML.
// Pages with noindex MUST NOT be in the sitemap — Google treats that as
// a conflicting signal ("you told us to index via sitemap but not via meta")
// and degrades trust in both signals. See
// https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
const NOINDEX_REGEX = /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i;

function urlToIndexPath(urlPath) {
  const clean = (urlPath || '').replace(/^\//, '').replace(/\/$/, '');
  return clean ? join(FRONTEND_DIR, clean, 'index.html') : join(FRONTEND_DIR, 'index.html');
}

/**
 * Returns true if the HTML file for a given URL has a noindex meta tag,
 * OR if the file does not exist. In either case we omit it from sitemaps.
 */
function isIndexable(urlPath) {
  const filePath = urlToIndexPath(urlPath);
  if (!existsSync(filePath)) return false;
  const html = readFileSync(filePath, 'utf8');
  return !NOINDEX_REGEX.test(html);
}

/**
 * Generate a sitemap index that references per-language sitemaps
 */
export function generateSitemapIndex() {
  const today = new Date().toISOString().split('T')[0];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  for (const lang of languages.languages) {
    xml += `  <sitemap>\n`;
    xml += `    <loc>${SITE_URL}/sitemap-${lang.code}.xml</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `  </sitemap>\n`;
  }

  xml += `</sitemapindex>\n`;
  return xml;
}

/**
 * Generate a per-language sitemap with full hreflang annotations
 */
export function generateLanguageSitemap(langCode) {
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  for (const [pageKey, urls] of Object.entries(pageMap.pages)) {
    // Skip pages that don't exist in this language
    if (!urls[langCode]) continue;

    const url = urls[langCode];

    // Skip pages that are noindex'd or missing on disk. Keeping them in
    // the sitemap while they're noindex'd sends Google conflicting
    // signals and wastes crawl budget.
    if (!isIndexable(url)) continue;

    const priority = getPriority(pageKey);
    const changefreq = getChangefreq(pageKey);

    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}${url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${changefreq}</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;

    // Add hreflang for ALL available indexable languages of this page.
    // Google treats noindex'd hreflang targets as valid cluster members
    // short-term, but listing only indexable alternates is cleaner and
    // avoids crawl budget waste on URLs the sitemap itself excludes.
    for (const [altLang, altUrl] of Object.entries(urls)) {
      if (!isIndexable(altUrl)) continue;
      xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${SITE_URL}${altUrl}"/>\n`;
    }
    // x-default — default to EN if available and indexable, otherwise skip
    const defaultUrl = urls.en && isIndexable(urls.en) ? urls.en : null;
    if (defaultUrl) {
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${defaultUrl}"/>\n`;
    }

    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;
  return xml;
}

/**
 * Generate all sitemaps and write to frontend/
 */
export function generateAllSitemaps(frontendDir) {
  // Sitemap index
  writeFileSync(join(frontendDir, 'sitemap.xml'), generateSitemapIndex());

  // Per-language sitemaps
  for (const lang of languages.languages) {
    const sitemap = generateLanguageSitemap(lang.code);
    writeFileSync(join(frontendDir, `sitemap-${lang.code}.xml`), sitemap);
  }

  // Update robots.txt to point to sitemap index
  const robotsPath = join(frontendDir, 'robots.txt');
  if (existsSync(robotsPath)) {
    let robots = readFileSync(robotsPath, 'utf8');
    robots = robots.replace(
      /Sitemap: .+/,
      `Sitemap: ${SITE_URL}/sitemap.xml`
    );
    writeFileSync(robotsPath, robots);
  }

  return languages.languages.map(l => `sitemap-${l.code}.xml`);
}

function getPriority(pageKey) {
  // Tuned per technical-seo-engineer panel audit 2026-04-17: a flat 0.9
  // across all tools is a wasted signal — Google ignores identical
  // priorities. Differentiate to convey relative importance.
  if (pageKey === 'homepage') return '1.0';
  if (pageKey === 'blog-index') return '0.6';
  if (pageKey.startsWith('blog/')) return '0.7';
  if (['about', 'contact'].includes(pageKey)) return '0.4';
  if (['privacy', 'terms'].includes(pageKey)) return '0.3';
  return '0.8'; // Tool pages (down from flat 0.9 — homepage stays authoritative)
}

function getChangefreq(pageKey) {
  if (pageKey === 'homepage' || pageKey === 'blog-index') return 'weekly';
  if (pageKey.startsWith('blog/')) return 'monthly';
  if (['privacy', 'terms'].includes(pageKey)) return 'yearly';
  return 'monthly';
}
