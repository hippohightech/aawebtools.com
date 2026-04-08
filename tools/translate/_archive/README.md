# Translation Pipeline Archive

These scripts were one-shot mutation tools used during the multilingual rollout.
They have been retired because the pipeline is now centralized in
`tools/translate/lib/{parser,assembler,validator,pagemap-validator}.js` and
called only via `tools/translate/cli.js` and `tools/translate/build.js`.

**Do not run these scripts.** They were the source of:

| Script | Bug it caused |
|---|---|
| `add-missing-hreflang.cjs` | Inserted hreflang via raw string concat before `</head>`, racing with `assembler.js` which inserts after `<link rel="canonical">`. Result: split hreflang blocks in `<head>`. Also hardcoded to only process EN+FR for non-blog pages, leaving AR/DE/ES/PT/ID/HI tool pages with stale hreflang. |
| `fix-hreflang-ja-to-id.cjs` | Hardcoded whitelist of 48 files; missed AR, EN, FR, ID. Phantom `ja_JP` and `hreflang="ja"` references still exist in 48+ files because this script never touched them. |
| `fix-lang-selector.cjs` | Manual lang-selector mutation. Should be done by the assembler from `page-map.json`. |
| `strip-data-lang.cjs` | Removed `data-en`/`data-fr` attributes ad-hoc. Now handled by `assembler.js#removeDataLangAttributes`. |
| `translate_de_blogs.py` | 57KB Python script with its own translation logic and (likely) ASCII-folding regex. Bypassed the JS pipeline. Source of "predecibilidad" without accents. |
| `translate_de_body.py` | 50KB Python script with its own DOM walker. Source of section-count mismatches between source and translated pages. |
| `fix_de_structure.py` | 18KB Python script that mutated DE files after-the-fact. Tombstone evidence of a bug the parser should have caught upstream. |

## How to translate now

1. Edit `tools/translate/locales/page-map.json` (the source of truth).
2. Run `npm run build` to validate the page-map and existing translations.
3. To regenerate translations, use `tools/translate/cli.js translate` (the
   stub at `cli.js:116-118` needs an `ANTHROPIC_API_KEY` and a real
   translator implementation — see roadmap).
4. Every output file is a build artifact. Do not hand-edit
   `frontend/<non-en>/**/*.html`.
