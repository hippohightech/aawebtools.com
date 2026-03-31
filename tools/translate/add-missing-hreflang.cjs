#!/usr/bin/env node
// add-missing-hreflang.cjs
// Adds missing hreflang tags to EN and FR pages based on page-map.json

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../../frontend');
const pageMap = JSON.parse(fs.readFileSync(path.join(__dirname, 'locales/page-map.json'), 'utf8'));

const BASE = 'https://aawebtools.com';
let fixed = 0;
let skipped = 0;

for (const [pageKey, urls] of Object.entries(pageMap.pages)) {
  // For blog articles: process all languages; for other pages: only EN and FR
  const isBlogArticle = pageKey.startsWith('blog/');
  const langsToProcess = isBlogArticle ? Object.keys(urls) : ['en', 'fr'];

  for (const lang of langsToProcess) {
    const urlPath = urls[lang];
    if (!urlPath) continue;

    // Strip leading slash and build path
    const relPath = urlPath === '/' ? 'index.html' : urlPath.replace(/^\//, '').replace(/\/$/, '') + '/index.html';
    const filePath = path.join(ROOT, relPath);
    if (!fs.existsSync(filePath)) continue;

    let html = fs.readFileSync(filePath, 'utf8');

    // Find what hreflang tags already exist
    const existingHreflang = new Set();
    const hreflangRegex = /<link rel="alternate" hreflang="([^"]+)"/g;
    let m;
    while ((m = hreflangRegex.exec(html)) !== null) {
      existingHreflang.add(m[1]);
    }

    // Build list of missing hreflang tags to add
    const toAdd = [];
    for (const [targetLang, targetUrl] of Object.entries(urls)) {
      if (!existingHreflang.has(targetLang) && targetLang !== 'x-default') {
        toAdd.push(`  <link rel="alternate" hreflang="${targetLang}" href="${BASE}${targetUrl}">`);
      }
    }

    // Also ensure x-default exists
    if (!existingHreflang.has('x-default') && urls['en']) {
      toAdd.push(`  <link rel="alternate" hreflang="x-default" href="${BASE}${urls['en']}">`);
    }

    if (toAdd.length === 0) {
      continue; // nothing to add
    }

    // Insert before </head>
    const insertPoint = html.indexOf('</head>');
    if (insertPoint === -1) {
      console.log(`SKIP (no </head>): ${filePath}`);
      skipped++;
      continue;
    }

    // Insert new hreflang tags before </head>
    html = html.slice(0, insertPoint) + toAdd.join('\n') + '\n' + html.slice(insertPoint);
    fs.writeFileSync(filePath, html, 'utf8');
    fixed++;
    console.log(`FIXED (${lang}): ${urlPath} — added ${toAdd.length} hreflang tags`);
  }
}

console.log(`\nDone. ${fixed} files updated, ${skipped} skipped.`);
