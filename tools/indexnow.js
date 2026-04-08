#!/usr/bin/env node

/**
 * indexnow.js — Submit URLs to the IndexNow API after deploy.
 *
 * IndexNow is a search-engine notification protocol shared by Bing,
 * Yandex, Seznam, Naver, and others. It does NOT include Google, but it
 * dramatically reduces time-to-index on the engines that do support it
 * and is the only deploy-time push mechanism we have for a brand-new
 * domain (Google still relies on its own crawl schedule).
 *
 * Usage:
 *   node tools/indexnow.js               # submit all URLs from sitemaps
 *   node tools/indexnow.js url1 url2 ... # submit specific URLs
 *
 * Key file: frontend/a4b8c2d6e1f3g7h9.txt (already deployed at site root)
 * Spec: https://www.indexnow.org/documentation
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const FRONTEND_DIR = join(ROOT, 'frontend');

const HOST = 'aawebtools.com';
const KEY = 'a4b8c2d6e1f3g7h9';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const SITE_URL = `https://${HOST}`;

/**
 * Extract all <loc> URLs from a sitemap XML file.
 */
function extractUrlsFromSitemap(sitemapPath) {
  if (!existsSync(sitemapPath)) return [];
  const xml = readFileSync(sitemapPath, 'utf8');
  const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)];
  return matches.map(m => m[1].trim()).filter(u => u.startsWith('https://'));
}

/**
 * Discover all sitemap files in frontend/ and extract their URLs.
 */
function getAllSitemapUrls() {
  const urls = new Set();
  const files = readdirSync(FRONTEND_DIR).filter(f => f.startsWith('sitemap') && f.endsWith('.xml'));
  for (const file of files) {
    const fileUrls = extractUrlsFromSitemap(join(FRONTEND_DIR, file));
    for (const url of fileUrls) {
      // Skip the sitemap index entries (they reference other sitemaps,
      // not page URLs). IndexNow only accepts content URLs.
      if (!url.endsWith('.xml')) urls.add(url);
    }
  }
  return [...urls];
}

/**
 * Filter out URLs whose corresponding HTML file has a noindex meta tag.
 * IndexNow should not be told about pages we're asking Google not to index.
 */
function filterNoindexUrls(urls) {
  return urls.filter(url => {
    const path = url.replace(SITE_URL, '').replace(/\/$/, '') || '';
    const candidates = [
      join(FRONTEND_DIR, path, 'index.html'),
      join(FRONTEND_DIR, `${path}.html`),
      path === '' ? join(FRONTEND_DIR, 'index.html') : null,
    ].filter(Boolean);
    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        const html = readFileSync(candidate, 'utf8');
        if (/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(html)) {
          return false;
        }
      }
    }
    return true;
  });
}

/**
 * POST URLs to IndexNow in chunks of 10,000 (the spec limit).
 */
async function submit(urls) {
  if (urls.length === 0) {
    console.log('[indexnow] No URLs to submit.');
    return { ok: true, submitted: 0 };
  }

  const chunks = [];
  for (let i = 0; i < urls.length; i += 10000) {
    chunks.push(urls.slice(i, i + 10000));
  }

  let totalOk = 0;
  for (const chunk of chunks) {
    const body = {
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: chunk,
    };
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(body),
      });
      // IndexNow returns 200 (OK), 202 (Accepted), 422 (invalid URLs), etc.
      // 200 and 202 are both successes per the spec.
      if (res.status === 200 || res.status === 202) {
        totalOk += chunk.length;
        console.log(`[indexnow] ✓ ${chunk.length} URLs accepted (HTTP ${res.status})`);
      } else {
        const text = await res.text().catch(() => '');
        console.error(`[indexnow] ✗ HTTP ${res.status}: ${text.slice(0, 200)}`);
      }
    } catch (err) {
      console.error(`[indexnow] ✗ network error: ${err.message}`);
    }
  }
  return { ok: totalOk === urls.length, submitted: totalOk };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const cliArgs = args.filter(a => a !== '--dry-run');
  let urls;
  if (cliArgs.length > 0) {
    urls = cliArgs.map(u => u.startsWith('http') ? u : `${SITE_URL}${u.startsWith('/') ? '' : '/'}${u}`);
    console.log(`[indexnow] ${dryRun ? '[DRY RUN] ' : ''}Submitting ${urls.length} URLs from CLI args...`);
  } else {
    const allUrls = getAllSitemapUrls();
    urls = filterNoindexUrls(allUrls);
    const filtered = allUrls.length - urls.length;
    console.log(`[indexnow] ${dryRun ? '[DRY RUN] ' : ''}Found ${allUrls.length} URLs in sitemaps; ${filtered} excluded as noindex; ${dryRun ? 'would submit' : 'submitting'} ${urls.length}.`);
  }

  if (dryRun) {
    urls.slice(0, 20).forEach(u => console.log(`  ${u}`));
    if (urls.length > 20) console.log(`  ... and ${urls.length - 20} more`);
    return;
  }

  const result = await submit(urls);
  process.exitCode = result.ok ? 0 : 1;
}

main().catch(err => {
  console.error(`[indexnow] FATAL: ${err.message}`);
  process.exitCode = 1;
});
