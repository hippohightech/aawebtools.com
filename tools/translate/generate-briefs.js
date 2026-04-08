#!/usr/bin/env node

/**
 * generate-briefs.js — Produce one self-contained translation brief per
 * page that needs regeneration.
 *
 * Each brief is a Markdown file the owner can paste into Claude Max or
 * GitHub Copilot Pro. The brief contains:
 *   - target page identity (lang, slug, file path)
 *   - the EN source HTML inline (no need to look it up separately)
 *   - the strict constraints from validator.js (so the AI knows what to satisfy)
 *   - the verification command to run after pasting the result back
 *
 * Briefs are written to docs/translation-briefs/{lang}/{slug}.md and
 * organized so the owner can batch them by language or by tool.
 *
 * Usage:
 *   node tools/translate/generate-briefs.js                      # all quarantined
 *   node tools/translate/generate-briefs.js --tools-only         # skip blog briefs
 *   node tools/translate/generate-briefs.js --lang fr            # one language
 *   node tools/translate/generate-briefs.js --priority           # tool pages + homepages only (the 73)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const FRONTEND_DIR = join(ROOT, 'frontend');
const BRIEFS_DIR = join(ROOT, 'docs', 'translation-briefs');
const PAGE_MAP = JSON.parse(readFileSync(join(__dirname, 'locales', 'page-map.json'), 'utf8'));
const LANGUAGES = JSON.parse(readFileSync(join(__dirname, 'locales', 'languages.json'), 'utf8'));

const NOINDEX_REGEX = /<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i;

// Pages we consider PRIORITY: high SEO value, language root pages, and
// the about page (trust signal). Skip privacy/terms/contact (low SEO
// value, easy to skip until much later).
const PRIORITY_PAGE_KEYS = new Set([
  'homepage',
  'tiktok-downloader',
  'twitter-video-downloader',
  'invoice-generator',
  'ai-detector',
  'ai-humanizer',
  'paystub-generator',
  'image-toolkit',
  'about',
]);

const TOOLS_ONLY_KEYS = new Set([
  'tiktok-downloader',
  'twitter-video-downloader',
  'invoice-generator',
  'ai-detector',
  'ai-humanizer',
  'paystub-generator',
  'image-toolkit',
]);

function urlToIndexPath(urlPath) {
  const clean = (urlPath || '').replace(/^\//, '').replace(/\/$/, '');
  return clean ? join(FRONTEND_DIR, clean, 'index.html') : join(FRONTEND_DIR, 'index.html');
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countSections(html) {
  const $ = cheerio.load(html, { decodeEntities: false });
  let scope = $('main');
  if (scope.length === 0) scope = $('body');
  return scope.find('> section, > .section').length;
}

function getLangNative(code) {
  return LANGUAGES.languages.find(l => l.code === code)?.native || code;
}

function getLangName(code) {
  return LANGUAGES.languages.find(l => l.code === code)?.name || code;
}

function isRtl(code) {
  return LANGUAGES.languages.find(l => l.code === code)?.dir === 'rtl';
}

/**
 * Render the brief Markdown for a single page.
 */
function renderBrief(pageKey, targetLang, urls) {
  const enUrl = urls.en || Object.values(urls)[0];
  const enPath = urlToIndexPath(enUrl);
  const targetUrl = urls[targetLang];
  const targetPath = urlToIndexPath(targetUrl);

  if (!existsSync(enPath)) {
    return null; // Cannot brief without source
  }

  const enHtml = readFileSync(enPath, 'utf8');
  const $en = cheerio.load(enHtml, { decodeEntities: false });
  const enWords = countWords($en('body').text());
  const enSections = countSections(enHtml);
  const enTitle = $en('title').text().trim();

  const langNative = getLangNative(targetLang);
  const langName = getLangName(targetLang);
  const rtl = isRtl(targetLang);

  const minWords = Math.ceil(enWords * 0.7);

  // List all alternate language URLs for hreflang reference
  const hreflangList = Object.entries(urls)
    .map(([lang, url]) => `  - hreflang="${lang}" → https://aawebtools.com${url}`)
    .join('\n');

  return `# Translation Brief — ${pageKey} → ${langName} (${targetLang})

> **Status**: Currently quarantined (\`<meta robots noindex>\`) on the live site.
> **Goal**: Produce a high-quality ${langName} translation that passes the strict validator.
> **After completion**: Save to \`${targetPath.replace(ROOT + '/', '')}\`, then run verify.

## Target page identity

| Field | Value |
|---|---|
| Page key | \`${pageKey}\` |
| Source language | English |
| Source file | \`${enPath.replace(ROOT + '/', '')}\` |
| Target language | ${langName} (${langNative}) — \`${targetLang}\` |
| Target file | \`${targetPath.replace(ROOT + '/', '')}\` |
| Target canonical | \`https://aawebtools.com${targetUrl}\` |
| Direction | ${rtl ? 'RTL (right-to-left)' : 'LTR (left-to-right)'} |
| English title | "${enTitle}" |
| English word count | ${enWords} |
| English section count | ${enSections} |

## Hard constraints (the validator will reject anything that violates these)

The validator runs 14 strict checks in [tools/translate/lib/validator.js](../../tools/translate/lib/validator.js). Pay attention to these:

1. **\`<html lang="${targetLang}"${rtl ? ' dir="rtl"' : ''}>\`** — must be set on the root element.
2. **\`<title>\`** — must exist, ≤65 characters.
3. **\`<meta name="description">\`** — must exist, 100–170 characters.
4. **\`<link rel="canonical" href="https://aawebtools.com${targetUrl}">\`** — must exactly match.
5. **Hreflang block** — must contain EXACTLY these alternates:
${hreflangList}
  - hreflang="x-default" → https://aawebtools.com${urls.en || enUrl}
6. **No phantom Japanese references** — no \`ja_JP\`, no \`hreflang="ja"\`, no \`/ja/\` URLs.
7. **JSON-LD blocks must be valid JSON** — translate the textual fields, keep the structure.
8. **\`AAWebTools\` brand name must appear in the body** (do not translate).
9. **\`<meta property="og:locale" content="${LANGUAGES.languages.find(l => l.code === targetLang)?.locale || targetLang}">\`** — must be set.
10. **No phantom \`ja_JP\` in og:locale:alternate** — only languages from the hreflang list above.${
  ['es', 'pt', 'fr'].includes(targetLang)
    ? `\n11. **Romance-language diacritics**: at least 5 accented characters per 1000 body characters. ASCII-stripped translations FAIL automatically. Use proper accents: á é í ó ú ñ ç ã õ etc.`
    : ''
}${
  targetLang === 'hi'
    ? `\n11. **NO Hinglish**: Hindi pages must contain <30% Latin (ASCII) characters in body text. Do not mix English verbs into Devanagari script. Translate everything except brand names (AAWebTools, ChatGPT, etc).`
    : ''
}
12. **Word count**: target body must be ≥${minWords} words (≥70% of the ${enWords}-word English source). Anything thinner is rejected.
13. **Section count**: target must have ≥${enSections} \`<section>\` tags inside \`<main>\`. Do not collapse, drop, or merge sections from the source.

## Soft guidance (improves quality, not enforced by validator)

- Translate naturally — do not literal-translate idioms.
- Localize examples where appropriate (currencies, country references).
- Keep technical terms in their commonly-used form for that language (e.g., German often keeps "Download" as a loanword).
- For tool pages, the goal is "a native speaker would find this useful" not "this is a literal English translation."
- Maintain the EXACT same JSON-LD schema structure — translate "name", "description", "headline" but never change "@type", "@context", or property keys.
- For RTL languages (Arabic): the HTML automatically flips with \`dir="rtl"\`, you do not need to reorder content manually.

## English source HTML (paste into your AI of choice)

\`\`\`html
${enHtml}
\`\`\`

## Verification command

After pasting the translated HTML into \`${targetPath.replace(ROOT + '/', '')}\`, run:

\`\`\`bash
node tools/translate/build.js 2>&1 | grep -A 6 "FAIL ${targetLang}/${pageKey}$" || echo "PASS — page validates"
\`\`\`

If it says PASS, run the lift-noindex command to mark this page as ready:

\`\`\`bash
node tools/translate/quarantine.js --lift  # idempotent, only lifts pages that pass
\`\`\`

Then commit:

\`\`\`bash
git add ${targetPath.replace(ROOT + '/', '')}
git commit -m "Regenerate ${targetLang}/${pageKey} (passes validator)"
\`\`\`

The pre-commit hook will re-run the validator before allowing the commit.
`;
}

function main() {
  const args = process.argv.slice(2);
  const toolsOnly = args.includes('--tools-only');
  const priorityOnly = args.includes('--priority');
  const langFilter = args.find(a => a.startsWith('--lang='))?.replace('--lang=', '')
    || (args.includes('--lang') ? args[args.indexOf('--lang') + 1] : null);

  // Wipe and recreate the briefs directory.
  if (existsSync(BRIEFS_DIR)) {
    rmSync(BRIEFS_DIR, { recursive: true, force: true });
  }
  mkdirSync(BRIEFS_DIR, { recursive: true });

  let count = 0;
  const byLang = new Map();

  for (const [pageKey, urls] of Object.entries(PAGE_MAP.pages)) {
    if (toolsOnly && !TOOLS_ONLY_KEYS.has(pageKey)) continue;
    if (priorityOnly && !PRIORITY_PAGE_KEYS.has(pageKey)) continue;

    for (const [lang, url] of Object.entries(urls)) {
      if (lang === 'en') continue; // Don't translate to English
      if (langFilter && lang !== langFilter) continue;

      // Only generate briefs for pages currently quarantined
      const targetPath = urlToIndexPath(url);
      if (!existsSync(targetPath)) continue;
      const html = readFileSync(targetPath, 'utf8');
      if (!NOINDEX_REGEX.test(html)) continue;

      const brief = renderBrief(pageKey, lang, urls);
      if (!brief) continue;

      // Filename: docs/translation-briefs/{lang}/{slug}.md
      const langDir = join(BRIEFS_DIR, lang);
      mkdirSync(langDir, { recursive: true });
      const safeKey = pageKey.replace(/\//g, '__');
      writeFileSync(join(langDir, `${safeKey}.md`), brief);
      count += 1;
      if (!byLang.has(lang)) byLang.set(lang, 0);
      byLang.set(lang, byLang.get(lang) + 1);
    }
  }

  console.log(`\n[generate-briefs] Generated ${count} translation briefs in docs/translation-briefs/\n`);
  for (const [lang, n] of [...byLang.entries()].sort()) {
    console.log(`  ${lang}: ${n} briefs`);
  }

  // Write a top-level INDEX.md so the owner can navigate
  const indexLines = [
    '# Translation Briefs Index',
    '',
    `Generated: ${new Date().toISOString().split('T')[0]}`,
    '',
    `Total briefs: ${count}`,
    '',
    '## How to use these briefs',
    '',
    '1. Open any brief file. Each is self-contained — you do not need to look up the source HTML separately.',
    '2. Paste the entire brief into Claude Max (claude.ai) or GitHub Copilot Pro chat.',
    '3. Add this prompt at the end: "Translate the English HTML to the target language following all hard constraints. Output only the complete translated HTML, nothing else."',
    '4. Save the result to the target file path shown in the brief.',
    '5. Run the verification command from the brief.',
    '6. If it passes, lift the noindex with `node tools/translate/quarantine.js --lift`.',
    '7. Commit. The pre-commit hook will re-validate.',
    '',
    '## Recommended order',
    '',
    '**Stage 1 — Homepages (8 pages, language roots Googlebot is actively crawling):**',
    ...['fr', 'es', 'de', 'pt', 'ar', 'id', 'hi'].map(lang => `- [\`${lang}/homepage.md\`](${lang}/homepage.md)`),
    '',
    '**Stage 2 — Tool pages by language (start with FR for shortest linguistic distance):**',
  ];

  for (const lang of ['fr', 'es', 'pt', 'de', 'ar', 'id', 'hi']) {
    const briefsForLang = byLang.get(lang) || 0;
    if (briefsForLang > 0) {
      indexLines.push('');
      indexLines.push(`### ${getLangName(lang)} (${lang}) — ${briefsForLang} briefs`);
      const langDir = join(BRIEFS_DIR, lang);
      if (existsSync(langDir)) {
        for (const f of readdirSync(langDir).sort()) {
          if (f.endsWith('.md')) indexLines.push(`- [\`${lang}/${f}\`](${lang}/${f})`);
        }
      }
    }
  }

  writeFileSync(join(BRIEFS_DIR, 'INDEX.md'), indexLines.join('\n') + '\n');
  console.log(`\n  → docs/translation-briefs/INDEX.md`);
}

main();
