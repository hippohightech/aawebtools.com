/**
 * validator.js — Automated QA checks for translated HTML pages
 * Runs 10 checks on every translated page before deployment.
 */

import * as cheerio from 'cheerio';
import { DO_NOT_TRANSLATE } from './parser.js';

/**
 * Run all validation checks on a translated HTML page
 * @param {string} html - Translated HTML string
 * @param {string} targetLang - Target language code
 * @param {string} pageKey - Page key for URL lookup
 * @returns {object} { passed: boolean, checks: [...], errors: [...], warnings: [...] }
 */
export function validateTranslatedPage(html, targetLang, pageKey) {
  const $ = cheerio.load(html, { decodeEntities: false });
  const results = { passed: true, checks: [], errors: [], warnings: [] };

  // Check 1: HTML lang attribute
  const lang = $('html').attr('lang');
  if (lang === targetLang) {
    results.checks.push({ name: 'html-lang', status: 'pass' });
  } else {
    results.errors.push(`html lang="${lang}" should be "${targetLang}"`);
    results.checks.push({ name: 'html-lang', status: 'fail' });
    results.passed = false;
  }

  // Check 2: RTL dir attribute for Arabic
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

  // Check 3: Title tag length (< 65 chars)
  const title = $('title').text();
  if (title.length > 0 && title.length <= 65) {
    results.checks.push({ name: 'title-length', status: 'pass', value: title.length });
  } else if (title.length > 65) {
    results.warnings.push(`Title is ${title.length} chars (target: <65): "${title.slice(0, 70)}..."`);
    results.checks.push({ name: 'title-length', status: 'warn', value: title.length });
  } else {
    results.errors.push('Title tag is empty');
    results.checks.push({ name: 'title-length', status: 'fail' });
    results.passed = false;
  }

  // Check 4: Meta description length (100-170 chars)
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

  // Check 5: Canonical URL exists and is correct
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  if (canonical.startsWith('https://aawebtools.com/')) {
    results.checks.push({ name: 'canonical', status: 'pass' });
  } else {
    results.errors.push(`Canonical URL invalid: "${canonical}"`);
    results.checks.push({ name: 'canonical', status: 'fail' });
    results.passed = false;
  }

  // Check 6: Hreflang tags present
  const hreflangCount = $('link[rel="alternate"][hreflang]').length;
  if (hreflangCount >= 2) {
    results.checks.push({ name: 'hreflang', status: 'pass', value: hreflangCount });
  } else {
    results.errors.push(`Only ${hreflangCount} hreflang tags found (need at least 2)`);
    results.checks.push({ name: 'hreflang', status: 'fail' });
    results.passed = false;
  }

  // Check 7: JSON-LD validity
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

  // Check 8: Brand names preserved
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

  // Check 9: og:locale present
  const ogLocale = $('meta[property="og:locale"]').attr('content') || '';
  if (ogLocale.length > 0) {
    results.checks.push({ name: 'og-locale', status: 'pass', value: ogLocale });
  } else {
    results.warnings.push('og:locale meta tag missing');
    results.checks.push({ name: 'og-locale', status: 'warn' });
  }

  // Check 10: content-language meta present
  const contentLang = $('meta[http-equiv="content-language"]').attr('content') || '';
  if (contentLang === targetLang) {
    results.checks.push({ name: 'content-language', status: 'pass' });
  } else {
    results.warnings.push(`content-language meta is "${contentLang}", expected "${targetLang}"`);
    results.checks.push({ name: 'content-language', status: 'warn' });
  }

  return results;
}
