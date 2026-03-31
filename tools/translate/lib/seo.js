/**
 * seo.js — Sitemap generation with hreflang, robots.txt update
 * Generates per-language sitemaps and a sitemap index.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pageMap = JSON.parse(readFileSync(join(__dirname, '..', 'locales', 'page-map.json'), 'utf8'));
const languages = JSON.parse(readFileSync(join(__dirname, '..', 'locales', 'languages.json'), 'utf8'));

const SITE_URL = 'https://aawebtools.com';

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
    const priority = getPriority(pageKey);
    const changefreq = getChangefreq(pageKey);

    xml += `  <url>\n`;
    xml += `    <loc>${SITE_URL}${url}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${changefreq}</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;

    // Add hreflang for ALL available languages of this page
    for (const [altLang, altUrl] of Object.entries(urls)) {
      xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${SITE_URL}${altUrl}"/>\n`;
    }
    // x-default
    const defaultUrl = urls.en || Object.values(urls)[0];
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${defaultUrl}"/>\n`;

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
  if (pageKey === 'homepage') return '1.0';
  if (pageKey.startsWith('blog/') || pageKey === 'blog-index') return '0.7';
  if (pageKey.startsWith('pay-stub-generator/')) return '0.7';
  if (['about', 'contact', 'privacy', 'terms'].includes(pageKey)) return '0.4';
  return '0.9'; // Tool pages
}

function getChangefreq(pageKey) {
  if (pageKey === 'homepage' || pageKey === 'blog-index') return 'weekly';
  if (pageKey.startsWith('blog/')) return 'monthly';
  if (['privacy', 'terms'].includes(pageKey)) return 'yearly';
  return 'monthly';
}
