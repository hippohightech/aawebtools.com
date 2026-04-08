/**
 * pagemap-validator.js — Schema and uniqueness validation for page-map.json
 *
 * The page-map is the single source of truth for URLs across all languages.
 * If it has duplicates, prefix collisions, or schema violations, every
 * downstream artifact (HTML, sitemaps, hreflang, internal links) will be wrong.
 *
 * This validator runs FIRST in the build pipeline and refuses to proceed
 * if the source of truth is broken.
 */

const VALID_LANG_CODES = new Set(['en', 'fr', 'es', 'de', 'pt', 'ar', 'id', 'hi']);

/**
 * Validate the entire page-map structure.
 * @param {object} pageMap - parsed page-map.json
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validatePageMap(pageMap) {
  const errors = [];
  const warnings = [];

  if (!pageMap || typeof pageMap !== 'object') {
    return { valid: false, errors: ['page-map.json is not an object'], warnings: [] };
  }
  if (!pageMap.pages || typeof pageMap.pages !== 'object') {
    return { valid: false, errors: ['page-map.json missing "pages" key'], warnings: [] };
  }

  // Check 1: every page key is a string, every value is an object of lang→URL
  for (const [pageKey, urls] of Object.entries(pageMap.pages)) {
    if (typeof urls !== 'object' || urls === null) {
      errors.push(`page "${pageKey}" is not an object`);
      continue;
    }
    if (Object.keys(urls).length === 0) {
      errors.push(`page "${pageKey}" has no language URLs`);
      continue;
    }
    for (const [lang, url] of Object.entries(urls)) {
      if (!VALID_LANG_CODES.has(lang)) {
        errors.push(`page "${pageKey}" has invalid language code "${lang}" (allowed: ${[...VALID_LANG_CODES].join(', ')})`);
      }
      if (typeof url !== 'string' || !url.startsWith('/')) {
        errors.push(`page "${pageKey}" lang "${lang}" URL must start with "/" (got: "${url}")`);
      }
    }
  }

  // Check 2: every URL must be globally unique across the entire tree.
  // This prevents two page keys from claiming the same URL (e.g.
  // /paystub-generator/ vs paystub-generator/canada accidentally collapsing).
  const urlOwners = new Map(); // url → "pageKey/lang"
  for (const [pageKey, urls] of Object.entries(pageMap.pages)) {
    for (const [lang, url] of Object.entries(urls)) {
      const owner = `${pageKey}/${lang}`;
      if (urlOwners.has(url)) {
        errors.push(`URL collision: "${url}" is claimed by both "${urlOwners.get(url)}" and "${owner}"`);
      } else {
        urlOwners.set(url, owner);
      }
    }
  }

  // Check 3: detect URL prefix collisions that look like the same product
  // shipping under two slugs. Compares slug stems after removing language
  // prefixes and trailing slashes. Catches /paystub-generator/ vs /pay-stub-generator/...
  const slugStems = new Map(); // normalized stem → original URL
  for (const url of urlOwners.keys()) {
    // Strip leading lang prefix if any (e.g. /es/, /fr/)
    const noLang = url.replace(/^\/(en|fr|es|de|pt|ar|id|hi)\//, '/');
    // Strip trailing slash and any sub-path (we want the top segment)
    const topSegment = noLang.replace(/^\//, '').split('/')[0];
    if (!topSegment) continue;
    // Normalize: lowercase, strip hyphens, strip dashes
    const normalized = topSegment.toLowerCase().replace(/[-_]/g, '');
    if (slugStems.has(normalized) && slugStems.get(normalized) !== topSegment) {
      warnings.push(`possible slug collision: "${topSegment}" and "${slugStems.get(normalized)}" normalize to the same stem "${normalized}"`);
    } else {
      slugStems.set(normalized, topSegment);
    }
  }

  // Check 4: every page that exists in EN should declare an EN URL.
  // Missing EN means the source-of-truth has no canonical anchor.
  for (const [pageKey, urls] of Object.entries(pageMap.pages)) {
    if (!urls.en && !urls.fr) {
      warnings.push(`page "${pageKey}" has neither en nor fr — orphaned in source language tree`);
    }
  }

  // Check 5: hreflang reciprocity sanity. If a page has 3+ languages, the
  // page should ideally have either ALL languages or document why not.
  // Catches accidentally-incomplete blog translations.
  for (const [pageKey, urls] of Object.entries(pageMap.pages)) {
    const langs = Object.keys(urls);
    if (langs.length >= 3 && langs.length < VALID_LANG_CODES.size) {
      const missing = [...VALID_LANG_CODES].filter(l => !langs.includes(l));
      warnings.push(`page "${pageKey}" has ${langs.length}/${VALID_LANG_CODES.size} languages (missing: ${missing.join(', ')})`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalPages: Object.keys(pageMap.pages).length,
      totalUrls: urlOwners.size,
    },
  };
}
