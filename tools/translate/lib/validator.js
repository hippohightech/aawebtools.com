/**
 * validator.js — Automated QA checks for translated HTML pages
 *
 * Runs 14 checks on every translated page before deployment.
 * Failures exit the build with non-zero status.
 *
 * Check philosophy: catch the bugs we KNOW shipped, not generic linting.
 * Each check has a comment explaining the actual incident it prevents.
 */

import * as cheerio from 'cheerio';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { DO_NOT_TRANSLATE } from './parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PAGE_MAP_PATH = join(__dirname, '..', 'locales', 'page-map.json');
const FRONTEND_DIR = join(__dirname, '..', '..', '..', 'frontend');
const pageMap = JSON.parse(readFileSync(PAGE_MAP_PATH, 'utf8'));

// Romance languages that MUST contain accented characters in real content.
// If a Spanish page contains zero accents per 1000 chars, it was machine-stripped.
const ROMANCE_LANGS = new Set(['es', 'pt', 'fr']);
const ACCENT_REGEX = /[áéíóúüñçâêîôûàèìòùäëïöüãõÁÉÍÓÚÜÑÇÂÊÎÔÛÀÈÌÒÙÄËÏÖÜÃÕ]/g;
const MIN_ACCENTS_PER_1000_CHARS = 5;

// Minimum word count ratio of translated body vs source body.
// Below this, the translated page is "thin" and Google will treat it as a stub.
const MIN_WORD_COUNT_RATIO = 0.7;

// For Hindi pages: max ratio of Latin (ASCII) characters in body text.
// Above this threshold, content is "Hinglish" (machine-mixed) which Google
// flags as low-quality NLP output.
const MAX_HI_LATIN_RATIO = 0.3;

function urlToIndexPath(urlPath) {
  const clean = (urlPath || '').replace(/^\//, '').replace(/\/$/, '');
  return clean ? join(FRONTEND_DIR, clean, 'index.html') : join(FRONTEND_DIR, 'index.html');
}

/**
 * Count words in a body text string (whitespace-separated tokens).
 */
function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Run all validation checks on a translated HTML page.
 *
 * @param {string} html - Translated HTML string
 * @param {string} targetLang - Target language code
 * @param {string} pageKey - Page key for URL lookup
 * @returns {object} { passed, checks, errors, warnings }
 */
export function validateTranslatedPage(html, targetLang, pageKey) {
  const $ = cheerio.load(html, { decodeEntities: false });
  const results = { passed: true, checks: [], errors: [], warnings: [] };

  // ── Check 1: HTML lang attribute ────────────────────────────────────────
  // Catches: forgetting to set <html lang="es"> when translating from EN.
  const lang = $('html').attr('lang');
  if (lang === targetLang) {
    results.checks.push({ name: 'html-lang', status: 'pass' });
  } else {
    results.errors.push(`html lang="${lang}" should be "${targetLang}"`);
    results.checks.push({ name: 'html-lang', status: 'fail' });
    results.passed = false;
  }

  // ── Check 2: RTL dir attribute for Arabic ───────────────────────────────
  // Catches: Arabic page rendered LTR.
  if (targetLang === 'ar') {
    const dir = $('html').attr('dir');
    if (dir === 'rtl') {
      results.checks.push({ name: 'rtl-dir', status: 'pass' });
    } else {
      results.errors.push('Arabic page missing dir="rtl" on <html>');
      results.checks.push({ name: 'rtl-dir', status: 'fail' });
      results.passed = false;
    }
  }

  // ── Check 3: Title tag length (≤ 65 chars) ──────────────────────────────
  const title = $('title').text();
  if (title.length > 0 && title.length <= 65) {
    results.checks.push({ name: 'title-length', status: 'pass', value: title.length });
  } else if (title.length > 65) {
    results.warnings.push(`Title is ${title.length} chars (target: ≤65): "${title.slice(0, 70)}..."`);
    results.checks.push({ name: 'title-length', status: 'warn', value: title.length });
  } else {
    results.errors.push('Title tag is empty');
    results.checks.push({ name: 'title-length', status: 'fail' });
    results.passed = false;
  }

  // ── Check 4: Meta description length (100-170 chars) ────────────────────
  const desc = $('meta[name="description"]').attr('content') || '';
  if (desc.length >= 100 && desc.length <= 170) {
    results.checks.push({ name: 'meta-desc-length', status: 'pass', value: desc.length });
  } else if (desc.length > 0) {
    results.warnings.push(`Meta description is ${desc.length} chars (target: 100-170)`);
    results.checks.push({ name: 'meta-desc-length', status: 'warn', value: desc.length });
  } else {
    results.errors.push('Meta description is empty');
    results.checks.push({ name: 'meta-desc-length', status: 'fail' });
    results.passed = false;
  }

  // ── Check 5: Canonical URL exists, is HTTPS, and matches page-map ───────
  // Catches: canonical pointing to wrong URL or to EN from a translated page.
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  const expectedCanonical = pageMap.pages[pageKey]?.[targetLang]
    ? `https://aawebtools.com${pageMap.pages[pageKey][targetLang]}`
    : null;
  if (!canonical.startsWith('https://aawebtools.com/')) {
    results.errors.push(`Canonical URL invalid: "${canonical}"`);
    results.checks.push({ name: 'canonical', status: 'fail' });
    results.passed = false;
  } else if (expectedCanonical && canonical !== expectedCanonical) {
    results.errors.push(`Canonical mismatch: expected "${expectedCanonical}", got "${canonical}"`);
    results.checks.push({ name: 'canonical', status: 'fail' });
    results.passed = false;
  } else {
    results.checks.push({ name: 'canonical', status: 'pass' });
  }

  // ── Check 6: Hreflang count must EXACTLY match page-map ─────────────────
  // Catches: split hreflang blocks, missing alternates, stale ja_JP, the
  // "only en+fr declared but page exists in 8 langs" bug. The old check
  // only required "≥ 2" which let every bug through.
  const hreflangTags = $('link[rel="alternate"][hreflang]');
  const declaredLangs = new Set();
  hreflangTags.each((_, el) => {
    declaredLangs.add($(el).attr('hreflang'));
  });
  const expectedLangs = new Set(Object.keys(pageMap.pages[pageKey] || {}));
  expectedLangs.add('x-default');
  const missing = [...expectedLangs].filter(l => !declaredLangs.has(l));
  const extra = [...declaredLangs].filter(l => !expectedLangs.has(l));
  if (missing.length === 0 && extra.length === 0) {
    results.checks.push({ name: 'hreflang-exact', status: 'pass', value: declaredLangs.size });
  } else {
    if (missing.length) results.errors.push(`hreflang missing: ${missing.join(', ')}`);
    if (extra.length) results.errors.push(`hreflang has phantom alternates: ${extra.join(', ')}`);
    results.checks.push({ name: 'hreflang-exact', status: 'fail' });
    results.passed = false;
  }

  // ── Check 7: JSON-LD validity ───────────────────────────────────────────
  let jsonldValid = true;
  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      JSON.parse($(el).html());
    } catch {
      jsonldValid = false;
      results.errors.push(`JSON-LD block #${i} is invalid JSON`);
    }
  });
  results.checks.push({ name: 'jsonld-valid', status: jsonldValid ? 'pass' : 'fail' });
  if (!jsonldValid) results.passed = false;

  // ── Check 8: Brand names preserved ──────────────────────────────────────
  const bodyText = $('body').text();
  const missingBrands = [];
  for (const brand of ['AAWebTools']) {
    if (!bodyText.includes(brand) && !html.includes(brand)) {
      missingBrands.push(brand);
    }
  }
  if (missingBrands.length === 0) {
    results.checks.push({ name: 'brand-preserved', status: 'pass' });
  } else {
    results.warnings.push(`Brand names missing from body: ${missingBrands.join(', ')}`);
    results.checks.push({ name: 'brand-preserved', status: 'warn' });
  }

  // ── Check 9: og:locale present and correct ──────────────────────────────
  const ogLocale = $('meta[property="og:locale"]').attr('content') || '';
  if (ogLocale.length > 0) {
    results.checks.push({ name: 'og-locale', status: 'pass', value: ogLocale });
  } else {
    results.warnings.push('og:locale meta tag missing');
    results.checks.push({ name: 'og-locale', status: 'warn' });
  }

  // ── Check 10: No phantom Japanese references ────────────────────────────
  // Catches: ja_JP og:locale:alternate, hreflang="ja", or hardcoded /ja/
  // URLs left over from a dropped Japanese rollout. These signal Google
  // there's content that doesn't exist.
  if (html.includes('ja_JP') || /hreflang=["']ja["']/.test(html) || html.includes('/ja/')) {
    results.errors.push('Page contains phantom Japanese references (ja_JP, hreflang="ja", or /ja/ URLs)');
    results.checks.push({ name: 'no-phantom-ja', status: 'fail' });
    results.passed = false;
  } else {
    results.checks.push({ name: 'no-phantom-ja', status: 'pass' });
  }

  // ── Check 11: Diacritic density for romance languages ───────────────────
  // Catches: ASCII-stripped Spanish/Portuguese/French ("variacion" instead
  // of "variación"). A telltale sign of a broken translation pipeline that
  // ran content through a non-Unicode-safe normalizer.
  if (ROMANCE_LANGS.has(targetLang)) {
    const accents = (bodyText.match(ACCENT_REGEX) || []).length;
    const charsPer1000 = bodyText.length > 0 ? (accents / bodyText.length) * 1000 : 0;
    if (charsPer1000 >= MIN_ACCENTS_PER_1000_CHARS) {
      results.checks.push({ name: 'diacritic-density', status: 'pass', value: charsPer1000.toFixed(1) });
    } else {
      results.errors.push(`Only ${accents} accented chars in ${bodyText.length} chars body (${charsPer1000.toFixed(1)}/1000, need ≥${MIN_ACCENTS_PER_1000_CHARS}). Likely ASCII-stripped translation.`);
      results.checks.push({ name: 'diacritic-density', status: 'fail' });
      results.passed = false;
    }
  }

  // ── Check 12: Hindi must not be Hinglish ────────────────────────────────
  // Catches: "Analyze हो रहा है" — content that mixes English verbs into
  // Devanagari script. Google's NLP raters flag this as machine output.
  if (targetLang === 'hi') {
    // Strip whitespace, brand names, and digits before counting.
    let normalized = bodyText.replace(/\s+/g, '');
    for (const brand of DO_NOT_TRANSLATE) {
      normalized = normalized.split(brand).join('');
    }
    normalized = normalized.replace(/[\d.,;:!?'"()\[\]{}\-/]/g, '');
    const latinChars = (normalized.match(/[A-Za-z]/g) || []).length;
    const totalChars = normalized.length;
    const ratio = totalChars > 0 ? latinChars / totalChars : 0;
    if (ratio <= MAX_HI_LATIN_RATIO) {
      results.checks.push({ name: 'no-hinglish', status: 'pass', value: ratio.toFixed(2) });
    } else {
      results.errors.push(`Hindi page is ${(ratio * 100).toFixed(0)}% Latin chars (max ${MAX_HI_LATIN_RATIO * 100}%). Likely Hinglish.`);
      results.checks.push({ name: 'no-hinglish', status: 'fail' });
      results.passed = false;
    }
  }

  // ── Check 13: Word count ratio vs English source ────────────────────────
  // Catches: translated tool pages that ship at 25-30% the word count of
  // the English original because the parser silently dropped sections.
  const enUrl = pageMap.pages[pageKey]?.en;
  if (enUrl && targetLang !== 'en') {
    const enPath = urlToIndexPath(enUrl);
    if (existsSync(enPath)) {
      const enHtml = readFileSync(enPath, 'utf8');
      const $en = cheerio.load(enHtml, { decodeEntities: false });
      const enWords = countWords($en('body').text());
      const trWords = countWords(bodyText);
      const ratio = enWords > 0 ? trWords / enWords : 0;
      if (ratio >= MIN_WORD_COUNT_RATIO) {
        results.checks.push({ name: 'word-count-ratio', status: 'pass', value: ratio.toFixed(2) });
      } else {
        results.errors.push(`Body has ${trWords} words vs ${enWords} in EN source (${(ratio * 100).toFixed(0)}%, need ≥${MIN_WORD_COUNT_RATIO * 100}%). Likely thin/missing sections.`);
        results.checks.push({ name: 'word-count-ratio', status: 'fail' });
        results.passed = false;
      }
    }
  }

  // ── Check 14: Section count parity vs English source ────────────────────
  // Catches: parser silently dropping <section> tags. The English source
  // has N sections, the translated page MUST have N sections (or more).
  if (enUrl && targetLang !== 'en') {
    const enPath = urlToIndexPath(enUrl);
    if (existsSync(enPath)) {
      const enHtml = readFileSync(enPath, 'utf8');
      const $en = cheerio.load(enHtml, { decodeEntities: false });
      const enSections = $en('main section, body > section').length;
      const trSections = $('main section, body > section').length;
      if (enSections === 0) {
        // Source has no sections, can't enforce parity
        results.checks.push({ name: 'section-parity', status: 'pass', value: 'no source sections' });
      } else if (trSections >= enSections) {
        results.checks.push({ name: 'section-parity', status: 'pass', value: `${trSections}/${enSections}` });
      } else {
        results.errors.push(`Page has ${trSections} sections vs ${enSections} in EN source. Sections were silently dropped.`);
        results.checks.push({ name: 'section-parity', status: 'fail' });
        results.passed = false;
      }
    }
  }

  return results;
}
