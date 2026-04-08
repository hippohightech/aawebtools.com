# aawebtools.com SEO Recovery — Action Log & Owner Tasks

This document records the SEO recovery work, the diagnostic findings that
corrected the original audit, and the items that require owner action
(things Claude cannot fix from the codebase).

## Reality vs. The Original Audit (corrected by diagnostics)

The original Chrome-extension GSC audit reported 7 problem buckets and the
first 5 SEO experts proposed a recovery plan based on them. Two reviewers
(architecture + analytics) flagged that several premises were unverified.
SSH diagnostics on the live VPS confirmed the reviewers were right:

| Original claim | Diagnostic finding | Status |
|---|---|---|
| 143 pages with 5xx server errors | Ghost subdomains return NXDOMAIN; current Traefik returns 404 (not 5xx). Stale GSC data. | **Stale** — these are historical, will self-clear |
| fail2ban kernel-bans Googlebot | Only `sshd` jail active in production. Repo's nginx jails were never deployed. | **Wrong premise** — no fix needed |
| nginx default_server fix needed | Traefik is the edge, not nginx. nginx never sees host headers Traefik doesn't route. | **Wrong target** — fix would be no-op |
| Googlebot is being blocked | 244 Googlebot hits in 11 days, 211× 200, 25× 404, 8× 304. Crawling fine. | **Wrong premise** — Googlebot is fine |
| 1/389 indexation = crisis | Domain was created 2026-03-27 (11 days old). Sandbox indexation curve is normal for this age. | **Misframed** — normal new-domain behavior |
| 6 missing OG images cause 404s | Confirmed. Only `og-blog-ai-detectors.png` existed. 6 blog posts referenced absent images. | **Real bug, fixed** |
| NS records on dns-parking.com | Confirmed. A record points to VPS but nameservers were never migrated. | **Owner action required** |
| Translate pipeline silently drops content | Confirmed. 104 of 127 translated pages failed strict validation. | **Real bug, partially fixed** |

## What was actually shipped (Option D — pipeline rebuild)

### Validator strengthening (commit 52f422b)
Validator went from 10 lenient checks (128 pages "passing") to 14 strict
checks that exposed 104 of 127 translated pages had silently shipped with
broken hreflang, dropped sections, ASCII-stripped accents, phantom `ja_JP`
references, or thin word counts vs source.

**New checks:**
- Check #5: canonical URL must EXACTLY match page-map (was: just startsWith)
- Check #6: hreflang count must EXACTLY match the languages declared in
  page-map for that page, plus x-default (was: ≥2 — let every bug through)
- Check #10: no phantom Japanese (`ja_JP`, `hreflang="ja"`, `/ja/` URLs)
- Check #11: diacritic density ≥5/1000 chars for romance languages (catches
  ASCII-stripped Spanish/Portuguese/French)
- Check #12: Hindi pages must be <30% Latin chars (catches Hinglish)
- Check #13: word count ratio ≥0.7 vs English source (catches thin pages)
- Check #14: section count parity vs English source (catches silent drops)

**Failure scoreboard at first run:**
| Failure | Count |
|---|---|
| Word count <70% of source | 65 |
| Sections silently dropped | 55 |
| Phantom Japanese references | 48 |
| ASCII-stripped accents | 31 |
| Hreflang phantom alternates | 22 |
| Hinglish (HI mixed with English) | 7 |

By language: es 18, hi 16, de 16, pt 14, id 14, ar 14, fr 12 = 104 fails of 127.

### Parser invariants (commit 52f422b)
- Removed silent section-drop fallback in `lib/parser.js`. Every `<section>`
  in the source is now captured regardless of length.
- Removed the `$('section')` global fallback that caught sections inside
  nav/aside/footer (different selection set than `main > section`).

### Assembler throw-on-mismatch (commit 52f422b)
- `lib/assembler.js` now throws when `bodySections.length` doesn't match
  the source section count, instead of silently skipping unmatched sections.
- Removed deprecated `meta http-equiv="content-language"` insertion.

### Page-map source-of-truth validation (commit 52f422b)
- New `lib/pagemap-validator.js` runs FIRST in the build pipeline.
- Refuses to build if page-map has duplicate URLs, prefix collisions, or
  schema violations.
- Caught and removed 5 `pay-stub-generator/[country]` doorway page keys
  that collided with the real `/paystub-generator/` tool.

### Tombstone removal
Moved 7 one-shot mutation scripts to `tools/translate/_archive/`:
- `add-missing-hreflang.cjs` — was racing the assembler, producing split
  hreflang blocks in `<head>`
- `fix-hreflang-ja-to-id.cjs` — hardcoded whitelist of 48 files, missed AR
  and 6 other languages
- `fix-lang-selector.cjs`, `strip-data-lang.cjs` — pre-pipeline cleanup hacks
- `translate_de_blogs.py`, `translate_de_body.py`, `fix_de_structure.py` —
  126KB of Python that bypassed the JS pipeline
- Deleted empty `i18n/ja/` directory (source of phantom `ja_JP` references)

### IndexNow automation
- New `tools/indexnow.js` POSTs URLs to https://api.indexnow.org/indexnow
- Filters out noindex'd pages automatically
- Wired into `scripts/deploy.sh` post-deploy
- Notifies Bing/Yandex/Seznam/Naver instantly (Google ignores IndexNow)
- The IndexNow key file `frontend/a4b8c2d6e1f3g7h9.txt` was already deployed
  but orphaned — now it's actually used

### Quarantine script
- New `tools/translate/quarantine.js` adds/lifts noindex on failing pages
- Idempotent — safe to re-run
- `--apply` adds noindex to failing pages
- `--lift` removes noindex from passing pages
- Default mode is dry-run

### Missing OG images
- Created 6 placeholder OG images (copied `og-default.png`) to stop the
  Googlebot 404s on `og-blog-*.png` references
- These should be replaced with real custom images per blog post

## Owner action items (Claude cannot do these)

### 1. Migrate nameservers off dns-parking.com **[CRITICAL]**
The domain `aawebtools.com` was created 2026-03-27 at Hostinger but the NS
records still point to `horizon.dns-parking.com` and `orbit.dns-parking.com`.
This is the source of every "ghost subdomain" that ever appeared in GSC
(`f6ztc.aawebtools.com`, `wzrwq.aawebtools.com`, etc.) — they were
wildcard-resolved spam pages that the parking provider used to serve.

**To verify:** `dig +short NS aawebtools.com`

**Expected output (broken):**
```
horizon.dns-parking.com.
orbit.dns-parking.com.
```

**To fix:**
1. Log in to your domain registrar (where you bought aawebtools.com)
2. Find the DNS / Nameservers settings
3. Change nameservers to either:
   - **Hostinger's** (if Hostinger is your VPS provider): `ns1.dns-parking.com` is NOT Hostinger — it's a cPanel/parking service. Look up Hostinger's actual nameservers in their control panel (typically `ns1.dns-parking.com`, `ns2.dns-parking.com`... wait, those ARE Hostinger's parking nameservers, but they should serve real records once you point the domain to your VPS hosting). Confirm with Hostinger support.
   - **Cloudflare** (recommended): create a free Cloudflare account, add `aawebtools.com`, copy the assigned nameservers, paste them at the registrar. Cloudflare will inherit your existing A record and you get DDoS protection + page rules + analytics for free.
4. Wait 24-48 hours for DNS propagation
5. Re-verify with `dig +short NS aawebtools.com`

**Impact when fixed:** Google will stop discovering ghost subdomains via
wildcard DNS, the historical "143 5xx errors" in GSC will accelerate to
zero, and Bing/Yandex will trust the domain more.

### 2. Submit URL Inspection requests for the 23 passing pages
GSC → URL Inspection → paste each of these → "Request Indexing":
- `/` (homepage)
- `/about/`, `/contact/`, `/privacy/`, `/terms/`, `/blog/`
- `/ai-detector/`, `/ai-humanizer/`, `/tiktok-downloader/`,
  `/twitter-video-downloader/`, `/invoice-generator/`,
  `/paystub-generator/`, `/image-toolkit/`
- The 6 English blog posts under `/blog/`
- The 8 passing French pages

This pushes Google to re-crawl high-quality pages and bypass the normal
discovery delay. Limit: ~10 requests per day per property.

### 3. Verify Bing Webmaster Tools
The Bing API key `375dcb0bb37d435da054a9104cbf1396` is in your team memory
but I found no evidence the site is verified in Bing Webmaster Tools. Bing
indexes faster than Google for new sites and is the leading indicator that
the recovery is working.

### 4. Decide the strategic question (see next section)

## Strategic decision: what to do about the 104 failing pages

| Option | Action | Cost | Recovery speed | Reversibility |
|---|---|---|---|---|
| **A — Quarantine (noindex)** | Run `node tools/translate/quarantine.js --apply` to add noindex to all 104. Rebuild over time, lift noindex when validator passes. | $0 | Slow (3-6 mo) | Full — just lift noindex |
| **B — Regenerate via Claude API** | Wire `cli.js translate` to actually call Claude Sonnet/Opus. Regenerate the 104 pages with real translations. | $20-80 in API costs | Fast (1-2 weeks) | Full — translations are content |
| **C — Delete failing languages** | Delete `frontend/{ar,de,es,hi,id,pt}/` entirely. Keep only EN+FR. Remove from page-map. | $0 | Fastest indexation recovery | Hard — files would need to be regenerated to come back |
| **D — Hybrid** | Quarantine (A) immediately to stop the "low quality" signal; then regenerate (B) the high-value tool pages first, deferring blog posts. | $5-30 | Medium (4-6 weeks) | Full |

**My recommendation: D (Hybrid).** Run quarantine now to stop the bleeding,
then prioritize regeneration of the 7 tool pages × 6 languages = 42 pages
that drive the most search value. Skip blog post translations entirely
until tools are clean.

Once the user picks an option, the next steps are:
- Option A: `node tools/translate/quarantine.js --apply && git commit`
- Option B: Set `ANTHROPIC_API_KEY`, wire the cli.js translate stub to a
  real Claude call, run for ~104 pages, validate, commit.
- Option C: Delete directories, edit page-map, regenerate sitemaps, commit.
- Option D: Quarantine first; then user picks budget for B.
