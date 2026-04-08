# Translation Brief — about → Spanish (es)

> **Status**: Currently quarantined (`<meta robots noindex>`) on the live site.
> **Goal**: Produce a high-quality Spanish translation that passes the strict validator.
> **After completion**: Save to `frontend/es/acerca-de/index.html`, then run verify.

## Target page identity

| Field | Value |
|---|---|
| Page key | `about` |
| Source language | English |
| Source file | `frontend/about/index.html` |
| Target language | Spanish (Español) — `es` |
| Target file | `frontend/es/acerca-de/index.html` |
| Target canonical | `https://aawebtools.com/es/acerca-de/` |
| Direction | LTR (left-to-right) |
| English title | "About AAWebTools — Free Online Tools by ScopeCove" |
| English word count | 305 |
| English section count | 0 |

## Hard constraints (the validator will reject anything that violates these)

The validator runs 14 strict checks in [tools/translate/lib/validator.js](../../tools/translate/lib/validator.js). Pay attention to these:

1. **`<html lang="es">`** — must be set on the root element.
2. **`<title>`** — must exist, ≤65 characters.
3. **`<meta name="description">`** — must exist, 100–170 characters.
4. **`<link rel="canonical" href="https://aawebtools.com/es/acerca-de/">`** — must exactly match.
5. **Hreflang block** — must contain EXACTLY these alternates:
  - hreflang="en" → https://aawebtools.com/about/
  - hreflang="fr" → https://aawebtools.com/fr/a-propos/
  - hreflang="es" → https://aawebtools.com/es/acerca-de/
  - hreflang="de" → https://aawebtools.com/de/ueber-uns/
  - hreflang="pt" → https://aawebtools.com/pt/sobre/
  - hreflang="ar" → https://aawebtools.com/ar/about/
  - hreflang="id" → https://aawebtools.com/id/tentang/
  - hreflang="hi" → https://aawebtools.com/hi/about/
  - hreflang="x-default" → https://aawebtools.com/about/
6. **No phantom Japanese references** — no `ja_JP`, no `hreflang="ja"`, no `/ja/` URLs.
7. **JSON-LD blocks must be valid JSON** — translate the textual fields, keep the structure.
8. **`AAWebTools` brand name must appear in the body** (do not translate).
9. **`<meta property="og:locale" content="es_ES">`** — must be set.
10. **No phantom `ja_JP` in og:locale:alternate** — only languages from the hreflang list above.
11. **Romance-language diacritics**: at least 5 accented characters per 1000 body characters. ASCII-stripped translations FAIL automatically. Use proper accents: á é í ó ú ñ ç ã õ etc.
12. **Word count**: target body must be ≥214 words (≥70% of the 305-word English source). Anything thinner is rejected.
13. **Section count**: target must have ≥0 `<section>` tags inside `<main>`. Do not collapse, drop, or merge sections from the source.

## Soft guidance (improves quality, not enforced by validator)

- Translate naturally — do not literal-translate idioms.
- Localize examples where appropriate (currencies, country references).
- Keep technical terms in their commonly-used form for that language (e.g., German often keeps "Download" as a loanword).
- For tool pages, the goal is "a native speaker would find this useful" not "this is a literal English translation."
- Maintain the EXACT same JSON-LD schema structure — translate "name", "description", "headline" but never change "@type", "@context", or property keys.
- For RTL languages (Arabic): the HTML automatically flips with `dir="rtl"`, you do not need to reorder content manually.

## English source HTML (paste into your AI of choice)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About AAWebTools — Free Online Tools by ScopeCove</title>
  <meta name="description" content="Learn about AAWebTools — 7 free online tools built by ScopeCove. No signup, no limits, your data stays in your browser.">
  <link rel="canonical" href="https://aawebtools.com/about/">
  <link rel="alternate" hreflang="en" href="https://aawebtools.com/about/">
  <link rel="alternate" hreflang="x-default" href="https://aawebtools.com/about/">
  <meta property="og:title" content="About AAWebTools — Free Online Tools by ScopeCove">
  <meta property="og:description" content="Learn about AAWebTools — 7 free online tools built by ScopeCove. No signup, no limits, your data stays in your browser.">
  <meta property="og:url" content="https://aawebtools.com/about/">
  <meta property="og:image" content="https://aawebtools.com/assets/img/og-default.png">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="AAWebTools">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="AAWebTools">
  <meta name="twitter:image" content="https://aawebtools.com/assets/img/og-default.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/img/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/img/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="stylesheet" href="/assets/css/fonts.css">
  <link rel="stylesheet" href="/assets/css/main.css">
  <style>
    .legal { max-width: 740px; margin: 0 auto; padding: 140px 24px 80px; }
    .legal h1 { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
    .legal .legal-date { font-size: 13px; color: var(--text-tertiary); margin-bottom: 40px; }
    .legal h2 { font-size: 20px; font-weight: 600; margin: 36px 0 12px; }
    .legal p, .legal li { font-size: 15px; line-height: 1.7; color: var(--text-secondary); margin-bottom: 12px; }
    .legal ul { padding-left: 20px; margin-bottom: 16px; }
    .legal a { color: var(--accent-blue); }
  </style>
  <link rel="alternate" hreflang="fr" href="https://aawebtools.com/fr/a-propos/">
  <link rel="alternate" hreflang="es" href="https://aawebtools.com/es/acerca-de/">
  <link rel="alternate" hreflang="de" href="https://aawebtools.com/de/ueber-uns/">
  <link rel="alternate" hreflang="pt" href="https://aawebtools.com/pt/sobre/">
  <link rel="alternate" hreflang="ar" href="https://aawebtools.com/ar/about/">
  <link rel="alternate" hreflang="id" href="https://aawebtools.com/id/tentang/">
  <link rel="alternate" hreflang="hi" href="https://aawebtools.com/hi/about/">
</head>
<body>

  <nav class="nav">
    <div class="nav__inner">
      <a href="/" class="nav__logo"><img src="/assets/img/logo-light.png" alt="AAWebTools" height="56"></a>
      <div class="nav__links">
        <div class="nav__dropdown"><a href="#" class="nav__link">Downloaders</a><div class="nav__dropdown-menu"><a href="/tiktok-downloader/" class="nav__dropdown-item">TikTok Downloader</a><a href="/twitter-video-downloader/" class="nav__dropdown-item">Twitter Downloader</a></div></div>
        <div class="nav__dropdown"><a href="#" class="nav__link">Generators</a><div class="nav__dropdown-menu"><a href="/invoice-generator/" class="nav__dropdown-item">Invoice Generator</a><a href="/paystub-generator/" class="nav__dropdown-item">Pay Stub Generator</a><a href="/image-toolkit/" class="nav__dropdown-item">Image Toolkit</a></div></div>
        <div class="nav__dropdown"><a href="#" class="nav__link">AI Tools</a><div class="nav__dropdown-menu"><a href="/ai-detector/" class="nav__dropdown-item">AI Content Detector</a><a href="/ai-humanizer/" class="nav__dropdown-item">AI Text Humanizer</a></div></div>
      <a href="/blog/" class="nav__link">Blog</a>
      </div>
      <div class="nav__right">
        <div class="lang-selector">
          <button class="lang-selector__trigger" id="langToggle">🌐 EN ▾</button>
          <div class="lang-selector__menu" id="langMenu">
            <a href="/about/" class="active">English</a>
            <a href="/fr/a-propos/">Français</a>
            <a href="/es/acerca-de/">Español</a>
            <a href="/de/ueber-uns/">Deutsch</a>
            <a href="/pt/sobre/">Português</a>
            <a href="/ar/about/">العربية</a>
            <a href="/id/tentang/">Bahasa Indonesia</a>
            <a href="/hi/about/">हिन्दी</a>
          </div>
        </div>
        <a href="/#tools" class="btn-primary btn-sm">All Tools</a>
        <button class="nav__hamburger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>
      </div>
    </div>
  </nav>
  <div class="nav__mobile" id="mobileNav">
    <a href="/tiktok-downloader/" class="nav__mobile-link">TikTok Downloader</a>
    <a href="/twitter-video-downloader/" class="nav__mobile-link">Twitter Downloader</a>
    <a href="/invoice-generator/" class="nav__mobile-link">Invoice Generator</a>
    <a href="/ai-detector/" class="nav__mobile-link">AI Content Detector</a>
    <a href="/ai-humanizer/" class="nav__mobile-link">AI Text Humanizer</a>
    <a href="/paystub-generator/" class="nav__mobile-link">Pay Stub Generator</a>
    <a href="/image-toolkit/" class="nav__mobile-link">Image Toolkit</a>
    <a href="/blog/" class="nav__mobile-link">Blog</a>
  </div>

  <main>
    <div class="legal">
      <h1>About AAWebTools</h1>

      <h2>Our Mission</h2>
      <p>We believe essential online tools should be free, private, and accessible to everyone. AAWebTools offers 7 free tools that work directly in your browser — no accounts, no uploads, no limits.</p>

      <h2>What We Offer</h2>
      <p>All 7 tools are free to use with no signup required:</p>
      <ul>
        <li><a href="/tiktok-downloader/">TikTok Downloader</a> — Download TikTok videos without watermark in HD</li>
        <li><a href="/twitter-video-downloader/">Twitter Video Downloader</a> — Download Twitter/X videos and GIFs for free</li>
        <li><a href="/invoice-generator/">Invoice Generator</a> — Create professional invoices free, no sign up required</li>
        <li><a href="/paystub-generator/">Pay Stub Generator</a> — Create professional pay stubs free, instant PDF download</li>
        <li><a href="/ai-detector/">AI Content Detector</a> — Detect AI-generated text from ChatGPT, Claude, and more</li>
        <li><a href="/ai-humanizer/">AI Text Humanizer</a> — Make AI-written text sound natural and human</li>
        <li><a href="/image-toolkit/">Image Toolkit</a> — Compress, convert &amp; resize images free, files never leave your browser</li>
      </ul>

      <h2>Privacy First</h2>
      <p>Your data never leaves your browser. Invoice and pay stub generators create PDFs client-side. Image tools process entirely in your browser. We don't store your files, your documents, or your text.</p>

      <h2>Built by ScopeCove</h2>
      <p>AAWebTools is built and maintained by <a href="https://scopecove.com/" target="_blank" rel="noopener">ScopeCove</a>, a digital agency based in Edmonton, Alberta, Canada. Founded by Karim Narimi.</p>

      <h2>Open &amp; Transparent</h2>
      <p>We use Umami for privacy-focused analytics (no cookies, no personal data). We support our tools through non-intrusive advertising.</p>
    </div>
  </main>

  <footer class="footer">
    <div class="footer__grid">
      <div>
        <div class="footer__logo"><img src="/assets/img/logo-light.png" alt="AAWebTools" height="44"></div>
        <p class="footer__tagline">Free tools for everyone, worldwide</p>
        <p class="footer__copyright">&copy; 2026 AAWebTools. All rights reserved. Built by <a href="https://scopecove.com/" target="_blank" rel="noopener" class="footer__link" style="display:inline;">ScopeCove</a></p>
      </div>
      <div>
        <h4 class="footer__heading">Tools</h4>
        <a href="/tiktok-downloader/" class="footer__link">TikTok Downloader</a>
        <a href="/twitter-video-downloader/" class="footer__link">Twitter Video Downloader</a>
        <a href="/invoice-generator/" class="footer__link">Invoice Generator</a>
        <a href="/ai-detector/" class="footer__link">AI Content Detector</a>
        <a href="/ai-humanizer/" class="footer__link">AI Text Humanizer</a>
        <a href="/paystub-generator/" class="footer__link">Pay Stub Generator</a>
        <a href="/image-toolkit/" class="footer__link">Image Toolkit</a>
      </div>
      <div>
        <h4 class="footer__heading">Legal</h4>
        <a href="/privacy/" class="footer__link">Privacy Policy</a>
        <a href="/terms/" class="footer__link">Terms of Service</a>
        <a href="/about/" class="footer__link">About</a>
        <a href="/contact/" class="footer__link">Contact</a>
        <a href="/blog/" class="footer__link">Blog</a>
      </div>
    </div>
    <div class="footer__bottom">Made with &#10084;&#65039; | Free forever | No signup required</div>
  </footer>

  <script src="/assets/js/core.js" defer></script>
  <script defer src="https://analytics.aawebtools.com/script.js" data-website-id="836dfc88-b05f-49b2-9824-3a085e248896"></script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9434634079795273" crossorigin="anonymous"></script>
</body>
</html>

```

## Verification command

After pasting the translated HTML into `frontend/es/acerca-de/index.html`, run:

```bash
node tools/translate/build.js 2>&1 | grep -A 6 "FAIL es/about$" || echo "PASS — page validates"
```

If it says PASS, run the lift-noindex command to mark this page as ready:

```bash
node tools/translate/quarantine.js --lift  # idempotent, only lifts pages that pass
```

Then commit:

```bash
git add frontend/es/acerca-de/index.html
git commit -m "Regenerate es/about (passes validator)"
```

The pre-commit hook will re-run the validator before allowing the commit.
