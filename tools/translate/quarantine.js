#!/usr/bin/env node

/**
 * quarantine.js — Add or lift noindex on translated pages based on validator status.
 *
 * Strategy: pages that fail the validator are sending Google a "low quality"
 * signal that lowers domain trust. Adding `<meta name="robots" content="noindex,follow">`
 * tells Google to drop them from the index immediately while preserving link
 * equity (follow keeps the crawl path open). Once a page is rebuilt and passes
 * the validator, this script can also LIFT the noindex tag.
 *
 * Usage:
 *   node tools/translate/quarantine.js                # dry run, show what would happen
 *   node tools/translate/quarantine.js --apply        # add noindex to failing pages
 *   node tools/translate/quarantine.js --lift         # remove noindex from passing pages
 *   node tools/translate/quarantine.js --apply --lift # both: full sync
 *
 * Idempotent: safe to run multiple times.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { validateTranslatedPage } from './lib/validator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const FRONTEND_DIR = join(ROOT, 'frontend');
const PAGE_MAP = JSON.parse(readFileSync(join(__dirname, 'locales', 'page-map.json'), 'utf8'));
const LANGUAGES = JSON.parse(readFileSync(join(__dirname, 'locales', 'languages.json'), 'utf8'));

const NOINDEX_TAG = '<meta name="robots" content="noindex,follow">';
const NOINDEX_REGEX = /<meta\s+name=["']robots["']\s+content=["']noindex[^"']*["']\s*\/?>/i;

function urlToIndexPath(urlPath) {
  const clean = (urlPath || '').replace(/^\//, '').replace(/\/$/, '');
  return clean ? join(FRONTEND_DIR, clean, 'index.html') : join(FRONTEND_DIR, 'index.html');
}

/**
 * Insert noindex tag right after the <head> opening, or update it if present.
 * Idempotent: never produces duplicates.
 */
function addNoindex(html) {
  if (NOINDEX_REGEX.test(html)) return { html, changed: false };
  // Insert just after <head> opening tag.
  const updated = html.replace(/<head[^>]*>/i, m => `${m}\n  ${NOINDEX_TAG}`);
  return { html: updated, changed: updated !== html };
}

/**
 * Remove the noindex tag if present.
 * Idempotent.
 */
function removeNoindex(html) {
  if (!NOINDEX_REGEX.test(html)) return { html, changed: false };
  // Remove the tag and any leading whitespace/newline that became orphaned.
  const updated = html.replace(/\s*<meta\s+name=["']robots["']\s+content=["']noindex[^"']*["']\s*\/?>\s*\n?/gi, '\n  ');
  return { html: updated, changed: updated !== html };
}

function main() {
  const args = process.argv.slice(2);
  const apply = args.includes('--apply');
  const lift = args.includes('--lift');
  const dryRun = !apply && !lift;

  if (dryRun) {
    console.log('[quarantine] DRY RUN — pass --apply to noindex failing pages, --lift to remove noindex from passing.\n');
  }

  const targetLanguages = LANGUAGES.languages.filter(l => l.code !== 'en').map(l => l.code);
  let toQuarantine = 0;
  let toRelease = 0;
  let quarantined = 0;
  let released = 0;
  let alreadyClean = 0;
  let alreadyQuarantined = 0;

  for (const lang of targetLanguages) {
    for (const [pageKey, urls] of Object.entries(PAGE_MAP.pages)) {
      if (!urls[lang]) continue;
      const htmlPath = urlToIndexPath(urls[lang]);
      if (!existsSync(htmlPath)) continue;

      const html = readFileSync(htmlPath, 'utf8');
      const result = validateTranslatedPage(html, lang, pageKey);
      const hasNoindex = NOINDEX_REGEX.test(html);

      if (!result.passed) {
        // Page fails validation → should be noindex
        if (!hasNoindex) {
          toQuarantine++;
          if (apply) {
            const { html: updated } = addNoindex(html);
            writeFileSync(htmlPath, updated);
            quarantined++;
            console.log(`  + noindex ${lang}/${pageKey}  (${result.errors.length} errors)`);
          } else {
            console.log(`  ? would noindex ${lang}/${pageKey}  (${result.errors.length} errors)`);
          }
        } else {
          alreadyQuarantined++;
        }
      } else {
        // Page passes validation → should NOT be noindex
        if (hasNoindex) {
          toRelease++;
          if (lift) {
            const { html: updated } = removeNoindex(html);
            writeFileSync(htmlPath, updated);
            released++;
            console.log(`  - lift ${lang}/${pageKey}`);
          } else {
            console.log(`  ? would lift ${lang}/${pageKey}`);
          }
        } else {
          alreadyClean++;
        }
      }
    }
  }

  console.log('\n[quarantine] Summary:');
  console.log(`  Failing pages without noindex: ${toQuarantine}`);
  console.log(`  Passing pages with stale noindex: ${toRelease}`);
  console.log(`  Already noindex (correctly quarantined): ${alreadyQuarantined}`);
  console.log(`  Already clean (correctly released): ${alreadyClean}`);
  if (apply) console.log(`  → Quarantined: ${quarantined}`);
  if (lift) console.log(`  → Released: ${released}`);
  if (dryRun) console.log(`\nRun with --apply to quarantine, --lift to release passing pages.`);
}

main();
