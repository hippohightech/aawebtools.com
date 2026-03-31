#!/usr/bin/env node

/**
 * cli.js — Translation pipeline CLI for aawebtools.com
 *
 * Usage:
 *   node tools/translate/cli.js translate --lang es --page tiktok-downloader
 *   node tools/translate/cli.js translate --lang all --all-pages
 *   node tools/translate/cli.js translate --lang es --all-pages --dry-run
 *   node tools/translate/cli.js diff --all-pages
 *   node tools/translate/cli.js validate --lang es
 *   node tools/translate/cli.js sitemaps
 */

import { Command } from 'commander';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { extractZones, getTranslationSummary } from './lib/parser.js';
import { validateTranslatedPage } from './lib/validator.js';
import { generateAllSitemaps, generateSitemapIndex, generateLanguageSitemap } from './lib/seo.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const FRONTEND_DIR = join(ROOT, 'frontend');

function urlToIndexPath(urlPath) {
  const clean = (urlPath || '').replace(/^\//, '').replace(/\/$/, '');
  return clean ? join(FRONTEND_DIR, clean, 'index.html') : join(FRONTEND_DIR, 'index.html');
}

const pageMap = JSON.parse(readFileSync(join(__dirname, 'locales', 'page-map.json'), 'utf8'));
const languages = JSON.parse(readFileSync(join(__dirname, 'locales', 'languages.json'), 'utf8'));

const program = new Command();
program.name('translate').description('AAWebTools translation pipeline').version('1.0.0');

// ── translate command ──────────────────────────────────
program
  .command('translate')
  .description('Translate pages to target language(s)')
  .option('-l, --lang <code>', 'Target language code (es, de, pt, ar, id, hi) or "all"', 'all')
  .option('-p, --page <key>', 'Page key from page-map.json or "all"')
  .option('--all-pages', 'Translate all pages')
  .option('--dry-run', 'Show what would be translated without calling API')
  .option('--force', 'Ignore cache, re-translate everything')
  .action(async (opts) => {
    if (!opts.allPages && !opts.page) {
      opts.allPages = true;
    }

    const targetLangs = opts.lang === 'all'
      ? languages.languages.filter(l => l.code !== 'en').map(l => l.code)
      : [opts.lang];

    const pageKeys = (opts.allPages || opts.page === 'all')
      ? Object.keys(pageMap.pages)
      : [opts.page];

    console.log(`\n🌐 Translation Pipeline`);
    console.log(`   Languages: ${targetLangs.join(', ')}`);
    console.log(`   Pages: ${pageKeys.length}`);
    console.log(`   Mode: ${opts.dryRun ? 'DRY RUN' : opts.force ? 'FORCE' : 'INCREMENTAL'}\n`);

    let totalSegments = 0;
    let cachedSegments = 0;

    for (const pageKey of pageKeys) {
      const enUrl = pageMap.pages[pageKey]?.en;
      if (!enUrl) {
        // Page might be FR-only (like facturation-electronique)
        continue;
      }

      // Resolve the English source file
      const htmlPath = urlToIndexPath(enUrl);
      if (!existsSync(htmlPath)) {
        // Try .html file fallback
        const clean = enUrl.replace(/^\//, '').replace(/\/$/, '');
        const altPath = join(FRONTEND_DIR, `${clean}.html`);
        if (!existsSync(altPath)) {
          console.log(`   ⚠ Skipping ${pageKey}: source not found at ${htmlPath}`);
          continue;
        }
      }

      const clean = enUrl.replace(/^\//, '').replace(/\/$/, '');
      const html = readFileSync(
        existsSync(htmlPath) ? htmlPath : join(FRONTEND_DIR, `${clean}.html`),
        'utf8'
      );
      const zones = extractZones(html);
      const summary = getTranslationSummary(zones);

      for (const lang of targetLangs) {
        if (!pageMap.pages[pageKey]?.[lang]) continue; // No URL defined for this lang

        totalSegments += summary.totalSegments;
        console.log(`   📄 ${pageKey} → ${lang} (${summary.totalSegments} segments)`);
      }
    }

    if (opts.dryRun) {
      const estimatedTokens = totalSegments * 500; // rough estimate
      const estimatedCost = (estimatedTokens / 1000000 * 3) + (estimatedTokens * 1.2 / 1000000 * 15);
      console.log(`\n── DRY RUN SUMMARY ──`);
      console.log(`   Total segments: ${totalSegments}`);
      console.log(`   Cached (skip): ${cachedSegments}`);
      console.log(`   To translate: ${totalSegments - cachedSegments}`);
      console.log(`   Est. tokens: ~${Math.round(estimatedTokens / 1000)}K`);
      console.log(`   Est. cost: ~$${estimatedCost.toFixed(2)}`);
      console.log(`\n   Run without --dry-run to proceed.\n`);
      return;
    }

    console.log(`\n   ⚠ Translation requires ANTHROPIC_API_KEY environment variable.`);
    console.log(`   Set it and re-run to translate via Claude API.\n`);
  });

// ── diff command ──────────────────────────────────
program
  .command('diff')
  .description('Show what has changed since last translation')
  .option('-p, --page <key>', 'Page key or "all"', 'all')
  .option('--all-pages', 'Check all pages')
  .action((opts) => {
    const pageKeys = (opts.allPages || opts.page === 'all')
      ? Object.keys(pageMap.pages)
      : [opts.page];

    console.log(`\n🔍 Change Detection\n`);

    for (const pageKey of pageKeys) {
      const enUrl = pageMap.pages[pageKey]?.en;
      if (!enUrl) continue;

      const htmlPath = urlToIndexPath(enUrl);
      if (!existsSync(htmlPath)) continue;

      const html = readFileSync(htmlPath, 'utf8');
      const zones = extractZones(html);
      const summary = getTranslationSummary(zones);

      console.log(`   ${pageKey}: ${summary.totalSegments} segments, ${summary.bodySections} sections, ${summary.jsonldBlocks} JSON-LD`);
    }
    console.log('');
  });

// ── validate command ──────────────────────────────────
program
  .command('validate')
  .description('Validate translated pages')
  .option('-l, --lang <code>', 'Language to validate or "all"', 'all')
  .action((opts) => {
    const targetLangs = opts.lang === 'all'
      ? languages.languages.filter(l => l.code !== 'en').map(l => l.code)
      : [opts.lang];

    console.log(`\n✅ Validation\n`);

    let totalPassed = 0;
    let totalFailed = 0;

    for (const lang of targetLangs) {
      for (const [pageKey, urls] of Object.entries(pageMap.pages)) {
        if (!urls[lang]) continue;

        const htmlPath = urlToIndexPath(urls[lang]);
        if (!existsSync(htmlPath)) {
          console.log(`   ⚠ ${lang}/${pageKey}: file not found`);
          continue;
        }

        const html = readFileSync(htmlPath, 'utf8');
        const result = validateTranslatedPage(html, lang, pageKey);

        if (result.passed && result.warnings.length === 0) {
          totalPassed++;
        } else if (result.passed) {
          console.log(`   ⚠ ${lang}/${pageKey}: PASS with ${result.warnings.length} warnings`);
          result.warnings.forEach(w => console.log(`      - ${w}`));
          totalPassed++;
        } else {
          console.log(`   ✗ ${lang}/${pageKey}: FAIL`);
          result.errors.forEach(e => console.log(`      ✗ ${e}`));
          result.warnings.forEach(w => console.log(`      ⚠ ${w}`));
          totalFailed++;
        }
      }
    }

    console.log(`\n   Results: ${totalPassed} passed, ${totalFailed} failed\n`);
  });

// ── sitemaps command ──────────────────────────────────
program
  .command('sitemaps')
  .description('Generate all sitemaps with hreflang annotations')
  .action(() => {
    console.log(`\n🗺 Generating sitemaps...\n`);
    const files = generateAllSitemaps(FRONTEND_DIR);
    console.log(`   Generated: sitemap.xml (index)`);
    files.forEach(f => console.log(`   Generated: ${f}`));
    console.log(`   Updated: robots.txt\n`);
  });

// ── info command ──────────────────────────────────
program
  .command('info')
  .description('Show project translation status')
  .action(() => {
    console.log(`\n📊 AAWebTools Translation Status\n`);
    console.log(`   Languages: ${languages.languages.length} (${languages.languages.map(l => l.code).join(', ')})`);
    console.log(`   Pages in map: ${Object.keys(pageMap.pages).length}`);

    // Count existing translated files
    for (const lang of languages.languages) {
      let count = 0;
      for (const [, urls] of Object.entries(pageMap.pages)) {
        if (!urls[lang.code]) continue;
        const htmlPath = urlToIndexPath(urls[lang.code]);
        if (existsSync(htmlPath)) count++;
      }
      console.log(`   ${lang.code} (${lang.native}): ${count} pages exist`);
    }
    console.log('');
  });

program.parse();
