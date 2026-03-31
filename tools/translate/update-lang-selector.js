#!/usr/bin/env node

/**
 * update-lang-selector.js
 * Replaces old 2-button lang-toggle with new 8-language dropdown
 * across ALL HTML files in frontend/
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const FRONTEND = join(ROOT, 'frontend');

// Language config per page prefix
const LANG_LABELS = {
  '': 'EN', 'fr': 'FR', 'es': 'ES', 'de': 'DE',
  'pt': 'PT', 'ar': 'AR', 'id': 'ID', 'hi': 'HI'
};

// Homepage URLs per language
const HOME_URLS = {
  en: '/', fr: '/fr/', es: '/es/', de: '/de/',
  pt: '/pt/', ar: '/ar/', id: '/id/', hi: '/hi/'
};

const LANG_NAMES = {
  en: 'English', fr: 'Français', es: 'Español', de: 'Deutsch',
  pt: 'Português', ar: 'العربية', id: 'Bahasa Indonesia', hi: 'हिन्दी'
};

function detectPageLang(filePath) {
  const rel = filePath.replace(FRONTEND + '/', '');
  // Check if it's in a language subdirectory
  const match = rel.match(/^(fr|es|de|pt|ar|id|hi)\//);
  return match ? match[1] : 'en';
}

function buildSelector(currentLang) {
  const label = LANG_LABELS[currentLang === 'en' ? '' : currentLang] || 'EN';
  let links = '';
  for (const [code, name] of Object.entries(LANG_NAMES)) {
    const active = code === currentLang ? ' class="active"' : '';
    links += `\n            <a href="${HOME_URLS[code]}"${active}>${name}</a>`;
  }

  return `<div class="lang-selector">
          <button class="lang-selector__trigger" id="langToggle">🌐 ${label} ▾</button>
          <div class="lang-selector__menu" id="langMenu">${links}
          </div>
        </div>`;
}

// Find all HTML files with old lang-toggle
const files = execSync(
  `grep -rl "lang-toggle__btn" "${FRONTEND}/" --include="*.html"`,
  { encoding: 'utf8' }
).trim().split('\n').filter(f => f.length > 0);

console.log(`Found ${files.length} files with old lang-toggle\n`);

let updated = 0;
let skipped = 0;

for (const file of files) {
  let html = readFileSync(file, 'utf8');
  const lang = detectPageLang(file);

  // Skip template files
  if (file.includes('template.html') || file.includes('template-blog.html') || file.includes('test.html')) {
    console.log(`  SKIP ${file.replace(FRONTEND + '/', '')} (template)`);
    skipped++;
    continue;
  }

  // Pattern 1: <div class="lang-toggle">...buttons...</div>
  // Match the entire lang-toggle div including its contents
  const toggleRegex = /<div\s+class="lang-toggle"[\s\S]*?<\/div>\s*(?:<\/div>)?/;

  // More specific: find the lang-toggle div and its direct content
  const patterns = [
    // Pattern: <div class="lang-toggle">\n  <button...>EN</button>\n  <button...>FR</button>\n</div>
    /<div\s+class="lang-toggle">\s*<button[^>]*>(?:EN|AR|DE|PT|HI|ID|FR|ES)<\/button>\s*<button[^>]*>(?:EN|AR|DE|PT|HI|ID|FR|ES)<\/button>\s*<\/div>/g,
    // Pattern with newlines
    /<div\s+class="lang-toggle">\s*\n\s*<button[^>]*>[^<]*<\/button>\s*\n\s*<button[^>]*>[^<]*<\/button>\s*\n\s*<\/div>/g,
  ];

  let replaced = false;
  const selector = buildSelector(lang);

  for (const pattern of patterns) {
    if (pattern.test(html)) {
      html = html.replace(pattern, selector);
      replaced = true;
      break;
    }
  }

  if (!replaced) {
    // Try a more aggressive match for any lang-toggle div
    const aggressivePattern = /<div class="lang-toggle">[\s\S]*?<\/div>/;
    const match = html.match(aggressivePattern);
    if (match) {
      // Make sure we're not matching the lang-selector we already placed
      if (!match[0].includes('lang-selector') && match[0].includes('lang-toggle__btn')) {
        html = html.replace(aggressivePattern, selector);
        replaced = true;
      }
    }
  }

  if (replaced) {
    writeFileSync(file, html);
    console.log(`  OK   ${file.replace(FRONTEND + '/', '')} [${lang}]`);
    updated++;
  } else {
    // Check if it already has the new selector
    if (html.includes('lang-selector__trigger')) {
      console.log(`  DONE ${file.replace(FRONTEND + '/', '')} (already updated)`);
      skipped++;
    } else {
      console.log(`  WARN ${file.replace(FRONTEND + '/', '')} — could not find toggle pattern`);
      skipped++;
    }
  }
}

console.log(`\nResults: ${updated} updated, ${skipped} skipped`);
