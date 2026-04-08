#!/usr/bin/env node
// fix-lang-selector.js — Fix language selector URLs on all translated pages
// Uses page-map.json to replace homepage URLs with page-specific URLs

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..', 'frontend');
const pageMap = JSON.parse(fs.readFileSync(path.join(__dirname, 'locales', 'page-map.json'), 'utf8'));

const LANG_NAMES = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  pt: 'Português',
  ar: 'العربية',
  id: 'Bahasa Indonesia',
  hi: 'हिन्दी'
};

// Order for display in selector
const LANG_ORDER = ['en', 'fr', 'es', 'de', 'pt', 'ar', 'id', 'hi'];

// For each page in page-map, find the file for each language and fix the lang selector
let totalFixed = 0;
let totalSkipped = 0;

for (const [pageKey, urls] of Object.entries(pageMap.pages)) {
  // Skip blog articles and country-specific pages (they only exist in EN/FR)
  const availableLangs = Object.keys(urls);
  if (availableLangs.length < 3) continue;

  for (const [lang, urlPath] of Object.entries(urls)) {
    const filePath = path.join(ROOT, urlPath, 'index.html');
    if (!fs.existsSync(filePath)) {
      // Try without trailing slash
      const altPath = path.join(ROOT, urlPath.replace(/\/$/, '') + '.html');
      if (!fs.existsSync(altPath)) continue;
    }

    let html = fs.readFileSync(filePath, 'utf8');

    // Build the correct lang selector menu
    const menuLinks = LANG_ORDER.map(l => {
      const targetUrl = urls[l];
      if (!targetUrl) {
        // Fallback to homepage if this page doesn't exist in that language
        const homepageUrl = pageMap.pages.homepage[l];
        return `            <a href="${homepageUrl}">${LANG_NAMES[l]}</a>`;
      }
      const activeClass = l === lang ? ' class="active"' : '';
      return `            <a href="${targetUrl}"${activeClass}>${LANG_NAMES[l]}</a>`;
    }).join('\n');

    const newMenu = `<div class="lang-selector__menu" id="langMenu">\n${menuLinks}\n          </div>`;

    // Replace the existing lang-selector__menu
    const menuRegex = /<div class="lang-selector__menu" id="langMenu">[\s\S]*?<\/div>/;
    if (!menuRegex.test(html)) {
      continue;
    }

    const oldMenu = html.match(menuRegex)[0];
    if (oldMenu === newMenu) {
      totalSkipped++;
      continue;
    }

    html = html.replace(menuRegex, newMenu);
    fs.writeFileSync(filePath, html, 'utf8');
    totalFixed++;
    console.log(`FIXED: ${filePath}`);
  }
}

console.log(`\nDone: ${totalFixed} files fixed, ${totalSkipped} already correct.`);
