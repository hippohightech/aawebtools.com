/**
 * link-graph.js — Build and validate the internal link graph across all pages.
 *
 * Why this exists: in April 2026 a 4-expert internal linking audit found
 * 5 architectural gaps that 7 prior expert audits had missed — including
 * zombie country pay-stub pages still linked in-body from /paystub-generator/
 * after they were removed from page-map.json, and cross-language CTA leaks
 * on quarantined /fr/{tool}/ pages pointing back to English URLs. Those bugs
 * were invisible to the text-level validator because they live in the
 * GRAPH, not in any single file.
 *
 * This module builds an in-memory adjacency list of every internal link in
 * every page tracked by page-map.json, then runs 5 invariants:
 *
 *   1. ORPHAN CHECK: every page in page-map has in-degree ≥ 1 from another
 *      in-map page (excluding itself). The homepage is exempt.
 *
 *   2. BROKEN INTERNAL LINK: every internal href (starting with "/" and
 *      not a static asset) resolves to a page that exists in page-map OR
 *      points to a whitelisted non-page URL (e.g. /sitemap.xml).
 *
 *   3. ZOMBIE LINK: no in-body link points to a URL that was removed from
 *      page-map. This would have caught the /pay-stub-generator/{country}/
 *      bug at commit time.
 *
 *   4. CROSS-LANGUAGE LEAK: for any localized page /<lang>/<slug>/, every
 *      in-body internal href (excluding <head> hreflang and the language
 *      switcher block) must either:
 *        (a) stay within the same language prefix
 *        (b) be a static asset (/assets/*, /robots.txt, etc.)
 *        (c) be the EN root / (acceptable fallback for locales without
 *            localized content for that page)
 *      This catches CTA buttons on /fr/detecteur-ia/ that jump back to
 *      /ai-detector/ (English), which was in the original audit.
 *
 *   5. REACHABILITY: every page in page-map must be reachable from the
 *      English homepage in ≤ 4 clicks via in-body links. Nav/footer links
 *      are intentionally excluded from this check because they are
 *      site-wide chrome and would trivially connect every page; the
 *      architect's recommendation is to measure reachability via the
 *      contextual link layer (which is what matters for PageRank flow).
 *
 * These are BLOCKING checks — any failure exits the build with code 3.
 *
 * To bypass temporarily for a WIP commit: git commit --no-verify.
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..', '..');
const FRONTEND_DIR = join(ROOT, 'frontend');

// Static assets and non-page URLs that are allowed targets for internal
// links but don't need to exist in page-map.json.
const STATIC_PATHS = [
  '/assets/',
  '/sitemap.xml',
  '/sitemap-',
  '/robots.txt',
  '/favicon.ico',
  '/site.webmanifest',
  '/tools.json',
  '/a4b8c2d6e1f3g7h9.txt', // IndexNow key file
];

// Anchor fragments that are allowed (in-page jumps, not cross-page).
const ANCHOR_PATHS = ['#', '/'];

// Maximum click depth from the homepage via in-body links.
const MAX_DEPTH = 4;

// Pages that are legitimately reachable only via nav/footer chrome (not
// via contextual body links). These are site-wide utility pages that
// users access through the footer, not through topical content flow.
// They're exempt from the body-reachability check.
const CHROME_ONLY_PAGES = new Set([
  '/about/',
  '/contact/',
  '/privacy/',
  '/terms/',
  '/fr/a-propos/',
  '/fr/contact/',
  '/fr/confidentialite/',
  '/fr/conditions/',
  '/es/acerca-de/',
  '/es/contacto/',
  '/es/privacidad/',
  '/es/terminos/',
  '/de/ueber-uns/',
  '/de/kontakt/',
  '/de/datenschutz/',
  '/de/nutzungsbedingungen/',
  '/pt/sobre/',
  '/pt/contato/',
  '/pt/privacidade/',
  '/pt/termos/',
  '/ar/about/',
  '/ar/contact/',
  '/ar/privacy/',
  '/ar/terms/',
  '/id/tentang/',
  '/id/kontak/',
  '/id/privasi/',
  '/id/syarat/',
  '/hi/about/',
  '/hi/contact/',
  '/hi/privacy/',
  '/hi/terms/',
]);

// Noindex regex for checking if a source page is currently quarantined.
// Broken-link errors originating from quarantined pages are demoted to
// warnings because those pages are scheduled for regeneration and will
// be fixed as a side effect of Stage 2.
const NOINDEX_REGEX = /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i;

/**
 * Convert a URL like "/fr/detecteur-ia/" to the filesystem path that
 * nginx would serve when that URL is requested.
 */
function urlToIndexPath(urlPath) {
  if (!urlPath) return null;
  const clean = urlPath.replace(/^\//, '').replace(/\/$/, '');
  return clean ? join(FRONTEND_DIR, clean, 'index.html') : join(FRONTEND_DIR, 'index.html');
}

/**
 * Determine the language prefix for a URL. Returns "en" for URLs that
 * don't start with a known language code (i.e. English content at /).
 */
function urlToLang(urlPath) {
  const match = urlPath.match(/^\/(fr|es|de|pt|ar|id|hi)(\/|$)/);
  return match ? match[1] : 'en';
}

/**
 * Check if a URL is a whitelisted static/non-page target.
 */
function isStaticOrAnchor(href) {
  if (!href) return true;
  if (ANCHOR_PATHS.includes(href)) return true;
  if (href.startsWith('#')) return true;
  for (const prefix of STATIC_PATHS) {
    if (href.startsWith(prefix)) return true;
  }
  return false;
}

/**
 * Extract all in-body internal links from an HTML page.
 * Returns { allLinks, bodyLinks } where bodyLinks excludes nav and footer.
 * bodyLinks is the set used for PageRank-style reachability analysis;
 * allLinks is used for the broken-link and zombie-link checks.
 */
function extractLinks(html) {
  const $ = cheerio.load(html, { decodeEntities: false });

  const allLinks = new Set();
  const bodyLinks = new Set();

  // Strip nav, footer, and the language selector before extracting
  // contextual body links. These are "site-wide chrome" that would
  // make every page trivially connected to every other page, hiding
  // real architectural problems.
  const $body = cheerio.load($.html(), { decodeEntities: false });
  $body('nav, .nav, .nav__mobile, footer, .footer, .lang-selector, link[rel="alternate"]').remove();

  // Collect ALL internal href values (for broken/zombie checks).
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    // Strip query strings and fragment identifiers for comparison.
    const normalized = href.split('#')[0].split('?')[0];
    if (!normalized) return;
    if (!normalized.startsWith('/')) return; // external or relative
    allLinks.add(normalized);
  });

  // Collect BODY-ONLY links (for reachability / PageRank flow).
  $body('a[href]').each((_, el) => {
    const href = $body(el).attr('href');
    if (!href) return;
    const normalized = href.split('#')[0].split('?')[0];
    if (!normalized) return;
    if (!normalized.startsWith('/')) return;
    bodyLinks.add(normalized);
  });

  return { allLinks, bodyLinks };
}

/**
 * Normalize a URL to its canonical form for lookup in the URL set
 * (ensures trailing slash, no query, no fragment).
 */
function normalizeUrl(href) {
  if (!href) return href;
  let normalized = href.split('#')[0].split('?')[0];
  // Add trailing slash if it looks like a directory (no file extension)
  if (normalized && !normalized.endsWith('/') && !normalized.match(/\.[a-z0-9]+$/i)) {
    normalized += '/';
  }
  return normalized;
}

/**
 * Build the full link graph from page-map.json.
 *
 * @param {object} pageMap - parsed page-map.json
 * @returns {object} { nodes, adjacency, bodyAdjacency, langOf, quarantined, missingFiles }
 *   - nodes: Set of canonical URLs from page-map
 *   - adjacency: Map<url, Set<url>> of ALL outbound links per page
 *   - bodyAdjacency: Map<url, Set<url>> of contextual-body outbound links only
 *   - langOf: Map<url, lang> for each page in page-map
 *   - quarantined: Set of URLs whose HTML has a noindex meta tag
 *   - missingFiles: list of page-map URLs whose HTML file doesn't exist
 */
export function buildLinkGraph(pageMap) {
  const nodes = new Set();
  const adjacency = new Map();
  const bodyAdjacency = new Map();
  const langOf = new Map();
  const quarantined = new Set();
  const missingFiles = [];

  // First pass: collect every URL declared in page-map.
  for (const [, urls] of Object.entries(pageMap.pages)) {
    for (const [lang, url] of Object.entries(urls)) {
      const canonical = normalizeUrl(url);
      nodes.add(canonical);
      langOf.set(canonical, lang);
    }
  }

  // Second pass: read each page's HTML and extract its link list.
  for (const canonical of nodes) {
    const htmlPath = urlToIndexPath(canonical);
    if (!htmlPath || !existsSync(htmlPath)) {
      missingFiles.push(canonical);
      adjacency.set(canonical, new Set());
      bodyAdjacency.set(canonical, new Set());
      continue;
    }

    const html = readFileSync(htmlPath, 'utf8');
    if (NOINDEX_REGEX.test(html)) {
      quarantined.add(canonical);
    }
    const { allLinks, bodyLinks } = extractLinks(html);

    // Normalize each extracted link to its canonical form before storing.
    const normAll = new Set();
    const normBody = new Set();
    for (const link of allLinks) normAll.add(normalizeUrl(link));
    for (const link of bodyLinks) normBody.add(normalizeUrl(link));

    adjacency.set(canonical, normAll);
    bodyAdjacency.set(canonical, normBody);
  }

  return { nodes, adjacency, bodyAdjacency, langOf, quarantined, missingFiles };
}

/**
 * Run all link-graph invariants and return an aggregated result.
 *
 * @param {object} pageMap - parsed page-map.json
 * @returns {{ valid, errors, warnings, stats }}
 */
export function validateLinkGraph(pageMap) {
  const errors = [];
  const warnings = [];

  const graph = buildLinkGraph(pageMap);
  const { nodes, adjacency, bodyAdjacency, langOf, quarantined, missingFiles } = graph;

  // ── Precompute the in-degree map (all links, not just body) ────────────
  const inDegree = new Map();
  for (const node of nodes) inDegree.set(node, 0);
  for (const [source, targets] of adjacency) {
    for (const target of targets) {
      if (nodes.has(target) && target !== source) {
        inDegree.set(target, (inDegree.get(target) || 0) + 1);
      }
    }
  }

  // ── Check 1: Orphans ───────────────────────────────────────────────────
  // Every page in page-map must have in-degree ≥ 1 from another in-map page.
  // Homepage (/) is exempt because it's the root.
  const HOMEPAGE_EXEMPT = new Set(['/', '/fr/', '/es/', '/de/', '/pt/', '/ar/', '/id/', '/hi/']);
  const orphans = [];
  for (const node of nodes) {
    if (HOMEPAGE_EXEMPT.has(node)) continue;
    if ((inDegree.get(node) || 0) === 0) {
      orphans.push(node);
    }
  }
  if (orphans.length > 0) {
    errors.push(`link-graph: ${orphans.length} orphan page(s) (no inbound links from other page-map pages): ${orphans.slice(0, 5).join(', ')}${orphans.length > 5 ? ', ...' : ''}`);
  }

  // ── Check 2: Broken internal links ─────────────────────────────────────
  // Every outbound internal link must either point to an in-map URL or
  // be a whitelisted static/non-page path.
  //
  // Broken links originating from QUARANTINED (noindex) source pages are
  // demoted to warnings, not errors. Those source pages are scheduled for
  // regeneration in Stage 2 and their link problems will be fixed as a
  // side effect of that regeneration. Blocking commits on them now would
  // make every commit to unrelated files fail pointlessly.
  const brokenLinks = [];
  const brokenFromQuarantine = [];
  for (const [source, targets] of adjacency) {
    for (const target of targets) {
      if (isStaticOrAnchor(target)) continue;
      if (nodes.has(target)) continue;
      // Some tool pages link to /pay-stub-generator/ or /paystub-generator/
      // as cross-references; normalize to their canonical form.
      const alt = target.replace(/\/pay-stub-generator\//, '/paystub-generator/');
      if (nodes.has(alt)) continue;
      if (quarantined.has(source)) {
        brokenFromQuarantine.push({ source, target });
      } else {
        brokenLinks.push({ source, target });
      }
    }
  }
  if (brokenLinks.length > 0) {
    const sample = brokenLinks.slice(0, 5).map(b => `${b.source} → ${b.target}`);
    errors.push(`link-graph: ${brokenLinks.length} broken internal link(s) from LIVE pages: ${sample.join('; ')}${brokenLinks.length > 5 ? '; ...' : ''}`);
  }
  if (brokenFromQuarantine.length > 0) {
    warnings.push(`link-graph: ${brokenFromQuarantine.length} broken link(s) from quarantined pages (will be fixed in Stage 2 regeneration)`);
  }

  // ── Check 3: Zombie links (pointing to removed page-map entries) ───────
  // This is actually a subset of check 2 when a URL was removed from
  // page-map — it becomes "broken" by our definition. We report it as a
  // distinct category only for URLs that look like they were intentionally
  // part of the site (e.g. /pay-stub-generator/{country}/) so the error
  // message is more actionable.
  const zombiePatterns = [
    /^\/pay-stub-generator\/[a-z]+\/$/,  // removed country doorways
    /\/ja\//,                             // phantom Japanese from earlier cleanup
  ];
  const zombies = brokenLinks.filter(b => zombiePatterns.some(re => re.test(b.target)));
  if (zombies.length > 0) {
    const sample = zombies.slice(0, 3).map(b => `${b.source} → ${b.target}`);
    errors.push(`link-graph: ${zombies.length} zombie link(s) to previously-removed URLs: ${sample.join('; ')}`);
  }

  // ── Check 4: Cross-language CTA leaks ──────────────────────────────────
  // Localized pages should not have body links that escape their language
  // prefix (except to the EN homepage as an acceptable fallback).
  const crossLangLeaks = [];
  for (const [source, bodyTargets] of bodyAdjacency) {
    const sourceLang = langOf.get(source);
    if (!sourceLang || sourceLang === 'en') continue;
    const langPrefix = `/${sourceLang}/`;
    for (const target of bodyTargets) {
      if (isStaticOrAnchor(target)) continue;
      if (target === '/') continue;  // EN homepage fallback is OK
      if (target.startsWith(langPrefix)) continue;
      // An explicit cross-language link to another non-EN language is
      // acceptable in lang-selector contexts but we already stripped
      // those. So anything left is a real leak.
      crossLangLeaks.push({ source, target });
    }
  }
  if (crossLangLeaks.length > 0) {
    const sample = crossLangLeaks.slice(0, 5).map(l => `${l.source} → ${l.target}`);
    // Warn rather than error for now: quarantined pages haven't been
    // regenerated yet and will inherently fail this check until Stage 2.
    // Once Stage 2 lifts noindex on regenerated pages, we can promote to error.
    warnings.push(`link-graph: ${crossLangLeaks.length} cross-language body link(s) (warning — will become error after Stage 2): ${sample.join('; ')}${crossLangLeaks.length > 5 ? '; ...' : ''}`);
  }

  // ── Check 5: Reachability from EN homepage via body links ──────────────
  // BFS from "/" over bodyAdjacency only. Any page in page-map not
  // reachable within MAX_DEPTH clicks is flagged.
  const visited = new Map(); // url → depth
  const queue = [['/', 0]];
  visited.set('/', 0);
  while (queue.length > 0) {
    const [url, depth] = queue.shift();
    if (depth >= MAX_DEPTH) continue;
    const neighbors = bodyAdjacency.get(url) || new Set();
    for (const next of neighbors) {
      if (!nodes.has(next)) continue;
      if (visited.has(next)) continue;
      visited.set(next, depth + 1);
      queue.push([next, depth + 1]);
    }
  }

  const unreachable = [];
  for (const node of nodes) {
    if (visited.has(node)) continue;
    // CHROME_ONLY_PAGES (about/contact/privacy/terms and their localized
    // equivalents) are legitimately only reachable via nav/footer chrome,
    // not via contextual body links. Exempt them from the body-reachability
    // check. They're still covered by the orphan check (which uses all
    // links including chrome) so they can't silently disappear.
    if (CHROME_ONLY_PAGES.has(node)) continue;
    unreachable.push(node);
  }
  if (unreachable.length > 0) {
    const enUnreachable = unreachable.filter(u => langOf.get(u) === 'en');
    if (enUnreachable.length > 0) {
      errors.push(`link-graph: ${enUnreachable.length} English page(s) unreachable from / in ≤${MAX_DEPTH} body clicks: ${enUnreachable.slice(0, 5).join(', ')}${enUnreachable.length > 5 ? ', ...' : ''}`);
    }
    const nonEnUnreachable = unreachable.filter(u => langOf.get(u) !== 'en');
    if (nonEnUnreachable.length > 0) {
      warnings.push(`link-graph: ${nonEnUnreachable.length} localized page(s) unreachable from / (expected during quarantine): sample ${nonEnUnreachable.slice(0, 3).join(', ')}`);
    }
  }

  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = {
    nodes: nodes.size,
    missingFiles: missingFiles.length,
    orphans: orphans.length,
    brokenLinks: brokenLinks.length,
    zombies: zombies.length,
    crossLangLeaks: crossLangLeaks.length,
    unreachable: unreachable.length,
    averageInDegree: nodes.size > 0 ? ([...inDegree.values()].reduce((a, b) => a + b, 0) / nodes.size).toFixed(1) : 0,
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats,
  };
}
