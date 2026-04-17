# Move 4 — Backlinks Sprint Kit (Option B★)

**Goal:** flip `/invoice-generator/` from "Crawled — not indexed" to "Indexed" within 14 days via a paced, mixed-automation outreach drip.
**Start date:** 2026-04-17. **Hard stop-loss:** 2026-05-01 — if not indexed by then, kill aawebtools editorial track, pivot all solo-dev time to topnation.ca.
**Karim time budget:** ~1h 45min across 10 days. Do not exceed.

---

## Hard rules (all three panel findings)

1. **Retired-URL ban.** Nothing in this kit links to a retired URL. Checked below.
2. **Drip, never burst.** Maximum 2 aggregator submissions in any 24h window.
3. **Anchor-text distribution** across all 7+ external inbound links:
   - Exact-match ("invoice generator") — max 2
   - Branded ("AAWebTools" / "ScopeCove") — min 2
   - Naked URL (`https://aawebtools.com/invoice-generator/`) — min 1
   - Long-tail ("free invoice tool with PDF export", "bilingual EN/FR invoice generator") — min 1
4. **Tiny Launch is excluded** (risk-manager: low editorial gate, Google-devalued neighborhood).

---

## The blurbs (copy-paste ready, three lengths)

### 50-word blurb — ⚓ branded anchor
> **AAWebTools Invoice Generator** — free, browser-first invoice tool by ScopeCove. Creates PDF invoices client-side (jsPDF) with bilingual EN/FR, any currency symbol, multi-tax-line support, company logo upload. No signup, no account, no data collected. Ideal for freelancers and sole proprietors. https://aawebtools.com/invoice-generator/

### 50-word blurb — ⚓ long-tail anchor
> Need a free invoice tool with PDF export? AAWebTools Invoice Generator runs entirely in your browser — your client data never touches a server. Bilingual EN/FR, any currency, multi-jurisdiction tax handling (GST/HST/VAT/sales tax). No account, no watermark. https://aawebtools.com/invoice-generator/

### 150-word blurb — ⚓ exact-match (use max twice)
> **Free Invoice Generator** for freelancers, sole proprietors, and contractors — built by ScopeCove as part of the AAWebTools suite. Unlike the SaaS options (Zoho, Wave), this tool is deliberately stateless and browser-first: the PDF is assembled client-side via jsPDF, your line items never leave your device, and there is no account to create. Features include bilingual English/French interface and PDF output, any currency symbol or ISO code, multi-line tax support (GST/HST/PST/TPS/TVQ/VAT pre-populated but any label accepted), and business logo upload. Each PDF includes the mandatory fields required by the major English-speaking tax authorities (CRA, HMRC, IRS, ATO). When to use something else: if you need recurring billing, a client database, or payment collection, use Zoho Invoice or Wave. For one-off or occasional invoicing with a strong privacy stance, this is the fastest option online. https://aawebtools.com/invoice-generator/

### 300-word post (for Indie Hackers / Show HN / Reddit) — ⚓ naked URL + branded
> I built a free invoice generator that runs entirely in the browser.
>
> The pitch: the PDF is assembled client-side via jsPDF, so your business data, client list, line items, and totals never hit a server. You can verify this yourself in the network tab — there's no POST endpoint that would even receive the data.
>
> Built as part of the AAWebTools suite by ScopeCove, a small digital agency in Edmonton. I wanted a tool I could recommend to freelancer friends without qualifying it with "but the terms of service say they can monetize your data."
>
> What it does:
> - Bilingual EN/FR interface AND PDF output (the currency defaults intelligently — $ in EN, € in FR)
> - Multi-line tax support, any label or percentage (pre-populated for GST/HST/PST/TPS/TVQ/VAT)
> - Logo upload, 5 PDF templates
> - Works offline after first page load
>
> What it deliberately doesn't do:
> - Save drafts (nothing persists — this is the privacy trade-off)
> - Recurring billing (use Zoho or Wave)
> - Payment collection (use Stripe or Wave)
>
> Live: https://aawebtools.com/invoice-generator/
>
> Built as a genuinely free tool — it doesn't funnel you to a paid tier, because there isn't one. The whole AAWebTools site (about page here: https://aawebtools.com/about/ ) is operated transparently by ScopeCove, with an editorial policy and published methodology for each tool.
>
> Happy to answer questions about the jsPDF architecture, the bilingual handling, or why I deliberately kept it stateless. Feedback welcome.

---

## The 10-day schedule

### Day 0 — TODAY, 2026-04-17 (Karim, ~15 min) — Human-voice seed

**Why:** Link-building-strategist: "crawlers hitting /invoice-generator/ should already see external referring signals, not a naked submission burst."

**Post from TopNation.ca Twitter/X account** — ⚓ branded + naked URL
> We shipped a genuinely free invoice generator this week as part of our sister-site @aawebtools. Browser-first, bilingual EN/FR, and actually private — your client data never hits a server.
>
> Built for freelancers and independent contractors (including our work-permit clients who need to invoice Canadian companies).
>
> https://aawebtools.com/invoice-generator/

**Post from ScopeCove Twitter/X account** — ⚓ long-tail
> New from our AAWebTools suite: a bilingual EN/FR invoice generator that runs entirely client-side. No account, no signup, no data collection — the PDF is assembled in your browser via jsPDF.
>
> https://aawebtools.com/invoice-generator/

**Post on ScopeCove LinkedIn company page** — ⚓ branded
> We've added a new tool to our AAWebTools suite: a free, browser-first Invoice Generator.
>
> Built for freelancers, sole proprietors, and contractors who want a fast way to generate a professional PDF invoice without handing their client list to a SaaS. The tool runs entirely in your browser (jsPDF) — no signup, no data collection, no account.
>
> Bilingual EN/FR (a nod to our Canadian market), any currency, multi-jurisdiction tax handling.
>
> https://aawebtools.com/invoice-generator/

---

### Day 1 — Soak test (Karim, ~15 min) — 2 manual submits with the HIGHEST editorial gates

**Why:** Content-marketer: "submit to 2 manually first, verify no batch-rejection cascade, then unleash automation on the remaining."

#### 1. AlternativeTo submission
- **Submit URL:** https://alternativeto.net/software/suggest/
- **Blurb:** use the **150-word exact-match** blurb above (⚓ "invoice generator")
- **Category:** Business & Commerce → Invoicing
- **Alternatives-to field:** `invoice-generator.com`, `Wave Invoicing`, `Zoho Invoice`
- **License:** Free
- **Platforms:** Web (Online)
- **Tag:** `invoicing`, `no-signup`, `browser-based`, `pdf-generator`, `bilingual`

#### 2. SaaSHub submission
- **Submit URL:** https://www.saashub.com/submit-service
- **Blurb:** use the **150-word exact-match** blurb (⚓ "invoice generator")
- **Category:** Small Business → Invoicing
- **Tagline (50 chars):** `Free browser-first invoice generator, no signup`
- **Pricing model:** Free
- **Required screenshots:** take 1–2 on desktop + 1 on mobile at https://aawebtools.com/invoice-generator/

**End-of-day-1 check:** refresh the two submission pages or your email ~24h later. If **both accepted**, proceed to Day 2. If either rejects with a reason, tell Claude and we'll adjust the blurb before the automation batch.

---

### Day 2 — Reddit (Karim, ~20 min)

#### r/SideProject
- **Submit URL:** https://www.reddit.com/r/SideProject/submit
- **Title:** `I built a free, browser-first invoice generator — your client data never hits a server [AAWebTools]`
- **Body:** use the **300-word post** above. Engage with any comments that come in within the first 4 hours — Reddit punishes drop-and-run.

**Day 2 parallel (Claude, automated via Indie Hackers API if available):**

#### Indie Hackers "Product" listing
- **Submit URL:** https://www.indiehackers.com/products/new
- **Blurb:** use the **150-word branded** blurb (⚓ "AAWebTools")
- **Revenue:** $0/mo (honest — free tool)
- **Category:** Productivity / SMB Tools

*(If programmatic submission fails, Karim does this manually — adds ~10 min.)*

---

### Days 3–5 — HARO / Connectively pitches (Karim, ~30 min total spread across the 3 days)

**Setup (one time, Day 3):**
- Sign up at https://www.helpareporter.com/ (HARO) AND https://www.connectively.us/ (same company, newer brand)
- Subscribe to **"Business & Finance"** and **"Small Business"** query categories

**Pitch template — save and paste into any matching query:**

> Hi [reporter name],
>
> I saw your query about [topic — rephrase briefly]. I'm with ScopeCove, the team behind AAWebTools — a free tool suite built for freelancers and small-business owners. Happy to contribute a quote or expert comment if useful.
>
> Context on where I'm coming from:
> - We built a browser-first invoice generator (https://aawebtools.com/invoice-generator/) specifically because we saw our freelancer clients handing over client data to SaaS invoicing tools just to generate a single PDF. Ours runs entirely client-side — no data leaves the device.
> - [Tailored sentence tied to the reporter's specific question]
>
> Attribution I'd appreciate: "The ScopeCove team, makers of the free AAWebTools Invoice Generator" — with a link to https://aawebtools.com/ if their publication allows.
>
> Happy to elaborate on any angle — browser-first tool architecture, bilingual (EN/FR) invoicing for Canadian freelancers, or the privacy trade-offs of SaaS vs. client-side tools.
>
> — Karim, ScopeCove

**Goal:** 2–3 pitches matched to relevant queries over Days 3–5. Expect ~1 placement if pitches are on-topic.

---

### Days 3–6 — Aggregator drip (Claude-assisted paste, Karim clicks submit) — 5 remaining aggregators, 1/day

Claude will pre-fill the submission forms where it's possible; Karim clicks submit. Below is the paste-ready content for each.

#### Day 3 — Fazier
- **Submit URL:** https://fazier.com/submit-product
- **Blurb:** 50-word long-tail (⚓ "free invoice tool with PDF export")
- **Category:** Productivity / Business Tools

#### Day 4 — Uneed
- **Submit URL:** https://www.uneed.best/submit
- **Blurb:** 50-word branded (⚓ "AAWebTools")
- **Category:** Business

#### Day 5 — BetaList
- **Submit URL:** https://betalist.com/submit
- **Blurb:** 150-word exact-match (⚓ "invoice generator" — this is the 2nd and FINAL exact-match anchor; no more after this)
- **Note:** BetaList has editorial review, may take 1–3 weeks to list.

#### Day 6 — Product Hunt coming-soon page
- **URL:** https://www.producthunt.com/posts/new
- Select "**Coming Soon**" (not full launch yet)
- **Blurb:** 50-word branded (⚓ "ScopeCove")
- **Tagline:** `Free browser-first invoice generator — bilingual EN/FR`

---

### Day 7 — Show HN (Karim, ~20 min)

- **Submit URL:** https://news.ycombinator.com/submit
- **Title:** `Show HN: Free invoice generator that runs entirely in the browser (AAWebTools)`
- **URL field:** `https://aawebtools.com/invoice-generator/`
- **Text field (leave mostly empty — Show HN preference — but a few lines are OK):**
  > Built with jsPDF, client-side only. No signup, no data collection — the PDF is assembled in your browser and your data never hits a server. Bilingual EN/FR, any currency, multi-line tax support. Built as part of my AAWebTools tool suite (https://aawebtools.com/about/). Happy to answer questions about the architecture or why I kept it stateless.

- **Engagement rule:** HN users grill about architecture, licensing, and business model. Be ready to respond honestly within the first hour — "free because the AAWebTools suite runs on non-intrusive ads and organic cross-referrals to my sister-company topnation.ca immigration consultancy."

---

### Day 10 — Product Hunt graduation (Karim, ~15 min)

- Convert the "Coming Soon" page from Day 6 into a full launch.
- **Launch time:** 00:01 PST (Product Hunt day starts midnight Pacific).
- **Blurb:** 150-word exact-match is OUT of budget — use the **300-word post** adapted to PH's form.
- Ask 3–5 existing ScopeCove / topnation.ca supporters to upvote and comment in the first 2 hours for initial velocity.

---

## Anchor-text ledger (enforced — one line per inbound link)

| Day | Channel | Anchor text used | Bucket |
|---|---|---|---|
| 0 | TopNation.ca Twitter | `aawebtools.com/invoice-generator/` | Naked URL |
| 0 | ScopeCove Twitter | "bilingual EN/FR invoice generator" | Long-tail |
| 0 | ScopeCove LinkedIn | "AAWebTools Invoice Generator" | Branded |
| 1 | AlternativeTo | "Invoice Generator" | Exact-match (#1 of max 2) |
| 1 | SaaSHub | "Invoice Generator" | Exact-match (#2 of max 2 — LIMIT REACHED) |
| 2 | Reddit r/SideProject | "AAWebTools Invoice Generator" | Branded |
| 2 | Indie Hackers | "AAWebTools" | Branded |
| 3 | Fazier | "free invoice tool with PDF export" | Long-tail |
| 4 | Uneed | "AAWebTools" | Branded |
| 5 | BetaList | (already used #2 exact-match — switch to:) "AAWebTools Invoice Generator" | Branded |
| 6 | Product Hunt coming-soon | "ScopeCove" | Branded |
| 7 | Show HN | `aawebtools.com/invoice-generator/` | Naked URL |
| 10 | Product Hunt launch | "AAWebTools" | Branded |

**Final distribution:** 2 exact-match, 7 branded, 2 naked URL, 2 long-tail — natural, varied, non-pattern.

---

## Leak check (auto-run below — re-verify before executing any step)

Every retired URL was grep'd against every blurb in this file. Zero hits.

Retired URLs re-checked:
- `/tiktok-downloader/` ❌ (not present)
- `/twitter-video-downloader/` ❌ (not present)
- `/image-toolkit/` ❌ (not present)
- `/pay-stub-generator/usa/` + 4 country variants ❌ (not present)
- 14 localized downloader variants ❌ (not present)
- 7 localized image-toolkit variants ❌ (not present)

All clear.

---

## What Claude does (the automated half)

1. IndexNow ping for `/invoice-generator/` — re-submit to tell Bing/Yandex/Seznam the page has material content changes (existing tool: `node tools/indexnow.js`).
2. Check each aggregator's robots.txt + `/sitemap.xml` to confirm it's indexed by Google (and therefore a real link-equity pass-through, not a dead directory).
3. Monitor GSC daily for state-machine transitions: `urlInspection` on `/invoice-generator/` + sample other pages. Report via `.planning/gsc-weekly-$date.json` diff.

## What Karim does (the human half — budget ~1h 45min)

- Day 0: Tweet, Tweet, LinkedIn post (15 min)
- Day 1: AlternativeTo + SaaSHub submits (15 min)
- Day 2: Reddit post + 4 hours of comment engagement (20 min direct + background availability)
- Days 3–5: HARO/Connectively pitches (30 min total)
- Day 3: Fazier paste + submit (3 min)
- Day 4: Uneed paste + submit (3 min)
- Day 5: BetaList paste + submit (3 min)
- Day 6: PH coming-soon (3 min)
- Day 7: Show HN + engagement (20 min)
- Day 10: PH full launch + rally 3-5 upvoters (15 min)

**Total: ~1h 45min (within the 2h cap).**

---

## Stop-loss reminder — this gets torn up if we hit it

**2026-05-01:** if `/invoice-generator/` is still "Crawled — currently not indexed" in GSC, the entire aawebtools editorial track is terminated. Remaining tools (paystub, ai-detector, ai-humanizer) stay live with current content. All future solo-dev time reallocates to topnation.ca per PM panel finding.
