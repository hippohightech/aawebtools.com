#!/usr/bin/env node
// retire-adsense-risks.mjs — One-shot AdSense risk remediation.
//
// Removes retired tool URLs from every HTML page in /frontend/ without
// disturbing surrounding whitespace. Run once, then commit.
//
// Retired tools (decider call 2026-04-16 after 6-expert panel):
//   - TikTok Downloader (EN + 7 localized slugs)
//   - Twitter Video Downloader (EN + 7 localized slugs)
//   - 5 orphaned country paystub pages (/pay-stub-generator/{usa,canada,uk,france,australia}/)
//
// Output: edits HTML files in place, prints a removal log.

import { readFileSync, writeFileSync } from 'fs';
import pkg from 'glob';
const globSync = pkg.sync;
import * as cheerio from 'cheerio';
import { resolve } from 'path';

const ROOT = resolve(process.cwd(), 'frontend');

const RETIRED = new Set([
  '/tiktok-downloader/',
  '/twitter-video-downloader/',
  '/fr/telechargeur-tiktok/',
  '/fr/telechargeur-twitter/',
  '/es/descargador-tiktok/',
  '/es/descargador-twitter/',
  '/de/tiktok-herunterladen/',
  '/de/twitter-video-herunterladen/',
  '/pt/baixar-tiktok/',
  '/pt/baixar-twitter/',
  '/ar/tiktok-downloader/',
  '/ar/twitter-video-downloader/',
  '/id/unduh-tiktok/',
  '/id/unduh-twitter/',
  '/hi/tiktok-downloader/',
  '/hi/twitter-video-downloader/',
  '/pay-stub-generator/usa/',
  '/pay-stub-generator/canada/',
  '/pay-stub-generator/uk/',
  '/pay-stub-generator/france/',
  '/pay-stub-generator/australia/',
]);

function isRetired(href) {
  if (!href) return false;
  const bare = href.split('#')[0].split('?')[0];
  return RETIRED.has(bare);
}

const files = globSync('frontend/**/*.html', { absolute: true });
let totalRemoved = 0;
let touchedFiles = 0;

for (const file of files) {
  const original = readFileSync(file, 'utf8');
  const $ = cheerio.load(original, { decodeEntities: false });
  let removedInFile = 0;

  // Remove any <a> tag pointing at a retired URL. Handles nav links,
  // footer links, body paragraph links, tool cards, CTA buttons.
  $('a[href]').each((_, el) => {
    const $el = $(el);
    if (isRetired($el.attr('href'))) {
      const $parent = $el.parent();
      $el.remove();
      removedInFile++;

      // If we just emptied a <div class="nav__dropdown-menu">, also
      // remove its parent <div class="nav__dropdown"> so the empty
      // "Downloaders" hat doesn't remain.
      if (
        $parent.hasClass('nav__dropdown-menu') &&
        $parent.children('a').length === 0
      ) {
        $parent.parent('.nav__dropdown').remove();
      }
    }
  });

  // Also clean <link rel="alternate" hreflang="..."> entries pointing
  // at retired URLs (hreflang for retired pages is meaningless).
  $('link[rel="alternate"][hreflang]').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href') || '';
    const path = href.replace(/^https?:\/\/[^/]+/, '');
    if (isRetired(path)) {
      $el.remove();
      removedInFile++;
    }
  });

  if (removedInFile > 0) {
    writeFileSync(file, $.html());
    touchedFiles++;
    totalRemoved += removedInFile;
    console.log(
      `✓ ${file.replace(process.cwd() + '/', '')}  (removed ${removedInFile})`,
    );
  }
}

console.log(
  `\nRemoved ${totalRemoved} retired references across ${touchedFiles} files.`,
);
