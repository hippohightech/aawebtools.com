#!/usr/bin/env node
// strip-data-lang.cjs — Remove legacy data-en="..." and data-fr="..." attributes from HTML files

const fs = require('fs');
const path = require('path');
const glob = require('path');

const ROOT = path.join(__dirname, '..', '..', 'frontend');

function findHtmlFiles(dir) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findHtmlFiles(full));
    } else if (entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

const files = findHtmlFiles(ROOT);
let totalFixed = 0;
let totalAttrsRemoved = 0;

for (const file of files) {
  let html = fs.readFileSync(file, 'utf8');
  const original = html;

  // Remove data-en="..." and data-fr="..." attributes (handles double quotes)
  // Match: space + data-en="any content" or data-fr="any content"
  const attrPattern = / data-(en|fr)="[^"]*"/g;
  const matches = html.match(attrPattern);
  if (!matches) continue;

  html = html.replace(attrPattern, '');

  if (html !== original) {
    fs.writeFileSync(file, html, 'utf8');
    totalFixed++;
    totalAttrsRemoved += matches.length;
    console.log(`FIXED: ${path.relative(ROOT, file)} (${matches.length} attrs removed)`);
  }
}

console.log(`\nDone: ${totalFixed} files fixed, ${totalAttrsRemoved} attributes removed.`);
