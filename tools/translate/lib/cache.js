/**
 * cache.js — Translation cache with hash-based change detection
 * Stores translated segments keyed by source hash.
 * Avoids re-translating unchanged content.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = join(__dirname, '..', 'cache', 'translations');
const HASHES_FILE = join(__dirname, '..', 'cache', 'hashes.json');

/**
 * Load the global hashes file
 */
export function loadHashes() {
  if (!existsSync(HASHES_FILE)) return {};
  return JSON.parse(readFileSync(HASHES_FILE, 'utf8'));
}

/**
 * Save the global hashes file
 */
export function saveHashes(hashes) {
  writeFileSync(HASHES_FILE, JSON.stringify(hashes, null, 2));
}

/**
 * Load cached translations for a specific page + language
 */
export function loadTranslationCache(pageKey, langCode) {
  const cacheFile = join(CACHE_DIR, langCode, `${pageKey.replace(/\//g, '__')}.json`);
  if (!existsSync(cacheFile)) return null;
  return JSON.parse(readFileSync(cacheFile, 'utf8'));
}

/**
 * Save translated segments to cache
 */
export function saveTranslationCache(pageKey, langCode, translatedData) {
  const langDir = join(CACHE_DIR, langCode);
  if (!existsSync(langDir)) mkdirSync(langDir, { recursive: true });

  const cacheFile = join(langDir, `${pageKey.replace(/\//g, '__')}.json`);
  const cacheEntry = {
    pageKey,
    langCode,
    translatedAt: new Date().toISOString(),
    model: translatedData.model || 'claude-sonnet-4-20250514',
    pipelineVersion: '1.0.0',
    segments: translatedData,
  };

  writeFileSync(cacheFile, JSON.stringify(cacheEntry, null, 2));
}

/**
 * Check which segments have changed since last translation
 * @param {object} currentZones - Current extracted zones with hashes
 * @param {object} cachedHashes - Previously stored hashes
 * @returns {object} { changed: [...], unchanged: [...], added: [...] }
 */
export function diffSegments(currentZones, cachedHashes) {
  const result = { changed: [], unchanged: [], added: [] };

  // Check meta
  for (const [key, value] of Object.entries(currentZones.meta)) {
    if (!value) continue;
    const currentHash = hashSimple(value);
    const cachedHash = cachedHashes?.meta?.[key];
    if (!cachedHash) result.added.push(`meta.${key}`);
    else if (currentHash !== cachedHash) result.changed.push(`meta.${key}`);
    else result.unchanged.push(`meta.${key}`);
  }

  // Check body sections
  currentZones.bodySections.forEach((section, i) => {
    const cachedHash = cachedHashes?.bodySections?.[i];
    if (!cachedHash) result.added.push(`section.${i}`);
    else if (section.hash !== cachedHash) result.changed.push(`section.${i}`);
    else result.unchanged.push(`section.${i}`);
  });

  // Check JSON-LD
  currentZones.jsonld.forEach((block, i) => {
    const cachedHash = cachedHashes?.jsonld?.[i];
    if (!cachedHash) result.added.push(`jsonld.${i}`);
    else if (block.hash !== cachedHash) result.changed.push(`jsonld.${i}`);
    else result.unchanged.push(`jsonld.${i}`);
  });

  return result;
}

function hashSimple(text) {
  const crypto = await import('crypto');
  return crypto.createHash('sha256').update(text.trim()).digest('hex').slice(0, 16);
}
