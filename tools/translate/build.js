#!/usr/bin/env node

/**
 * build.js - Translation build orchestrator
 *
 * Generates sitemaps and validates translated pages across mapped languages.
 * Exits non-zero when validation failures are found.
 */

import { readFileSync, existsSync, watch } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { generateAllSitemaps } from './lib/seo.js';
import { validateTranslatedPage } from './lib/validator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const FRONTEND_DIR = join(ROOT, 'frontend');
const PAGE_MAP = JSON.parse(readFileSync(join(__dirname, 'locales', 'page-map.json'), 'utf8'));
const LANGUAGES = JSON.parse(readFileSync(join(__dirname, 'locales', 'languages.json'), 'utf8'));

function urlToIndexPath(urlPath) {
  const clean = (urlPath || '').replace(/^\//, '').replace(/\/$/, '');
  return clean ? join(FRONTEND_DIR, clean, 'index.html') : join(FRONTEND_DIR, 'index.html');
}

function runBuild() {
  console.log('\n[translate:build] Generating sitemaps...');
  generateAllSitemaps(FRONTEND_DIR);

  console.log('[translate:build] Validating localized pages...');
  let passed = 0;
  let failed = 0;
  let missing = 0;

  const targetLanguages = LANGUAGES.languages.filter((l) => l.code !== 'en').map((l) => l.code);

  for (const lang of targetLanguages) {
    for (const [pageKey, urls] of Object.entries(PAGE_MAP.pages)) {
      if (!urls[lang]) continue;

      const htmlPath = urlToIndexPath(urls[lang]);
      if (!existsSync(htmlPath)) {
        missing += 1;
        continue;
      }

      const html = readFileSync(htmlPath, 'utf8');
      const result = validateTranslatedPage(html, lang, pageKey);

      if (result.passed) {
        passed += 1;
      } else {
        failed += 1;
        console.error(`\n[translate:build] FAIL ${lang}/${pageKey}`);
        result.errors.forEach((err) => console.error(`  - ${err}`));
      }
    }
  }

  console.log(`\n[translate:build] Summary: ${passed} passed, ${failed} failed, ${missing} missing`);

  if (failed > 0) {
    process.exitCode = 1;
  }
}

const watchMode = process.argv.includes('--watch');

if (watchMode) {
  runBuild();
  console.log('[translate:build] Watch mode enabled (tools/translate + frontend).');

  let timer;
  const rerun = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      runBuild();
    }, 250);
  };

  watch(join(ROOT, 'tools', 'translate'), { recursive: true }, rerun);
  watch(FRONTEND_DIR, { recursive: true }, rerun);
} else {
  runBuild();
}
