# Translation Brief — invoice-generator → French (fr)

> **Status**: Currently quarantined (`<meta robots noindex>`) on the live site.
> **Goal**: Produce a high-quality French translation that passes the strict validator.
> **After completion**: Save to `frontend/fr/generateur-facture/index.html`, then run verify.

## Target page identity

| Field | Value |
|---|---|
| Page key | `invoice-generator` |
| Source language | English |
| Source file | `frontend/invoice-generator/index.html` |
| Target language | French (Français) — `fr` |
| Target file | `frontend/fr/generateur-facture/index.html` |
| Target canonical | `https://aawebtools.com/fr/generateur-facture/` |
| Direction | LTR (left-to-right) |
| English title | "Free Invoice Generator — No Sign Up, Instant PDF Download | AAWebTools" |
| English word count | 2759 |
| English section count | 7 |

## Hard constraints (the validator will reject anything that violates these)

The validator runs 14 strict checks in [tools/translate/lib/validator.js](../../tools/translate/lib/validator.js). Pay attention to these:

1. **`<html lang="fr">`** — must be set on the root element.
2. **`<title>`** — must exist, ≤65 characters.
3. **`<meta name="description">`** — must exist, 100–170 characters.
4. **`<link rel="canonical" href="https://aawebtools.com/fr/generateur-facture/">`** — must exactly match.
5. **Hreflang block** — must contain EXACTLY these alternates:
  - hreflang="en" → https://aawebtools.com/invoice-generator/
  - hreflang="fr" → https://aawebtools.com/fr/generateur-facture/
  - hreflang="es" → https://aawebtools.com/es/generador-facturas/
  - hreflang="de" → https://aawebtools.com/de/rechnungsgenerator/
  - hreflang="pt" → https://aawebtools.com/pt/gerador-faturas/
  - hreflang="ar" → https://aawebtools.com/ar/invoice-generator/
  - hreflang="id" → https://aawebtools.com/id/pembuat-faktur/
  - hreflang="hi" → https://aawebtools.com/hi/invoice-generator/
  - hreflang="x-default" → https://aawebtools.com/invoice-generator/
6. **No phantom Japanese references** — no `ja_JP`, no `hreflang="ja"`, no `/ja/` URLs.
7. **JSON-LD blocks must be valid JSON** — translate the textual fields, keep the structure.
8. **`AAWebTools` brand name must appear in the body** (do not translate).
9. **`<meta property="og:locale" content="fr_FR">`** — must be set.
10. **No phantom `ja_JP` in og:locale:alternate** — only languages from the hreflang list above.
11. **Romance-language diacritics**: at least 5 accented characters per 1000 body characters. ASCII-stripped translations FAIL automatically. Use proper accents: á é í ó ú ñ ç ã õ etc.
12. **Word count**: target body must be ≥1932 words (≥70% of the 2759-word English source). Anything thinner is rejected.
13. **Section count**: target must have ≥7 `<section>` tags inside `<main>`. Do not collapse, drop, or merge sections from the source.

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
  <title>Free Invoice Generator — No Sign Up, Instant PDF Download | AAWebTools</title>
  <meta name="description" content="Create professional invoices free online. No registration, no watermark. Download PDF instantly. Supports English and French.">
  <meta name="keywords" content="free invoice generator, invoice maker, free invoice template, invoice generator no sign up, french invoice generator">
  <link rel="canonical" href="https://aawebtools.com/invoice-generator/">
  <link rel="alternate" hreflang="en" href="https://aawebtools.com/invoice-generator/">
  <link rel="alternate" hreflang="fr" href="https://aawebtools.com/fr/generateur-facture/">
  <link rel="alternate" hreflang="x-default" href="https://aawebtools.com/invoice-generator/">
  <meta property="og:title" content="Free Invoice Generator — No Sign Up, Instant PDF Download | AAWebTools">
  <meta property="og:description" content="Create professional invoices free online. No registration, no watermark. Download PDF instantly.">
  <meta property="og:image" content="https://aawebtools.com/assets/img/og-invoice-generator.png">
  <meta property="og:url" content="https://aawebtools.com/invoice-generator/">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="AAWebTools">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Free Invoice Generator | AAWebTools">
  <meta name="twitter:description" content="Create professional invoices free online. Instant PDF download.">
  <meta name="twitter:image" content="https://aawebtools.com/assets/img/og-invoice-generator.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/assets/img/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/img/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">
  <link rel="stylesheet" href="/assets/css/fonts.css">
  <link rel="stylesheet" href="/assets/css/main.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Free Invoice Generator",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {"@type":"Offer","price":"0","priceCurrency":"USD"},
    "description": "Create professional invoices free online. No signup required. Instant PDF download.",
    "url": "https://aawebtools.com/invoice-generator/",
    "inLanguage": ["en","fr"],
    "dateModified": "2026-03-27"
  }
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {"@type": "Question", "name": "How do I create a free invoice online?", "acceptedAnswer": {"@type": "Answer", "text": "Simply fill in your business details, client info, and line items in the form above. Click 'Download PDF' to generate and download your professional invoice instantly. No signup, no watermark, completely free."}},
      {"@type": "Question", "name": "Can I create an invoice without signing up?", "acceptedAnswer": {"@type": "Answer", "text": "Yes! Our free invoice generator requires no sign up, no account, and no email. Just fill in the form and download. Your data stays in your browser — nothing is sent to any server. This is the simplest free invoice generator with no sign up required."}},
      {"@type": "Question", "name": "Is there a French invoice generator?", "acceptedAnswer": {"@type": "Answer", "text": "Yes! Click the FR toggle at the top of the invoice form. All labels, placeholders, and the PDF output will switch to French. Currency defaults to € in French mode. This is perfect for Canadian French and European French invoicing."}},
      {"@type": "Question", "name": "Can I add my logo to the invoice?", "acceptedAnswer": {"@type": "Answer", "text": "Yes. Click the 'Business Logo' upload field and select your logo image (PNG, JPG, or SVG). It will appear in the top-right corner of your PDF invoice. The logo is processed entirely in your browser — never uploaded to any server."}},
      {"@type": "Question", "name": "How do I download the invoice as PDF?", "acceptedAnswer": {"@type": "Answer", "text": "Click the blue 'Download PDF' button at the bottom of the form. The PDF generates instantly in your browser using jsPDF — no server processing. The file saves with the filename invoice-[your-invoice-number].pdf."}}
    ]
  }
  </script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Create an Invoice",
    "step": [
      {"@type": "HowToStep", "position": 1, "name": "Fill in your details", "text": "Enter your business info, client details, and line items."},
      {"@type": "HowToStep", "position": 2, "name": "Preview your invoice", "text": "Click Preview to see how your invoice will look."},
      {"@type": "HowToStep", "position": 3, "name": "Download PDF", "text": "Click Download PDF — your invoice saves instantly."}
    ]
  }
  </script>
  <script async defer src="https://analytics.aawebtools.com/script.js" data-website-id="836dfc88-b05f-49b2-9824-3a085e248896"></script>
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://aawebtools.com/"},{"@type":"ListItem","position":2,"name":"Free Invoice Generator","item":"https://aawebtools.com/invoice-generator/"}]}
  </script>
  <link rel="alternate" hreflang="es" href="https://aawebtools.com/es/generador-facturas/">
  <link rel="alternate" hreflang="de" href="https://aawebtools.com/de/rechnungsgenerator/">
  <link rel="alternate" hreflang="pt" href="https://aawebtools.com/pt/gerador-faturas/">
  <link rel="alternate" hreflang="ar" href="https://aawebtools.com/ar/invoice-generator/">
  <link rel="alternate" hreflang="id" href="https://aawebtools.com/id/pembuat-faktur/">
  <link rel="alternate" hreflang="hi" href="https://aawebtools.com/hi/invoice-generator/">
</head>
<body>

  <!-- Navigation -->
  <nav class="nav">
    <div class="nav__inner">
      <a href="/" class="nav__logo"><img src="/assets/img/logo-light.png" alt="AAWebTools" height="56"></a>
      <div class="nav__links">
        <div class="nav__dropdown"><a href="#" class="nav__link">Downloaders</a><div class="nav__dropdown-menu"><a href="/tiktok-downloader/" class="nav__dropdown-item">TikTok Downloader</a><a href="/twitter-video-downloader/" class="nav__dropdown-item">Twitter Downloader</a></div></div>
        <div class="nav__dropdown"><a href="#" class="nav__link nav__link--active">Generators</a><div class="nav__dropdown-menu"><a href="/invoice-generator/" class="nav__dropdown-item">Invoice Generator</a><a href="/paystub-generator/" class="nav__dropdown-item">Pay Stub Generator</a><a href="/image-toolkit/" class="nav__dropdown-item">Image Toolkit</a></div></div>
        <div class="nav__dropdown"><a href="#" class="nav__link">AI Tools</a><div class="nav__dropdown-menu"><a href="/ai-detector/" class="nav__dropdown-item">AI Content Detector</a><a href="/ai-humanizer/" class="nav__dropdown-item">AI Text Humanizer</a></div></div>
      <a href="/blog/" class="nav__link">Blog</a>
      </div>
      <div class="nav__right">
        <div class="lang-selector">
          <button class="lang-selector__trigger" id="langToggle">🌐 EN ▾</button>
          <div class="lang-selector__menu" id="langMenu">
            <a href="/invoice-generator/" class="active">English</a>
            <a href="/fr/generateur-facture/">Français</a>
            <a href="/es/generador-facturas/">Español</a>
            <a href="/de/rechnungsgenerator/">Deutsch</a>
            <a href="/pt/gerador-faturas/">Português</a>
            <a href="/ar/invoice-generator/">العربية</a>
            <a href="/id/pembuat-faktur/">Bahasa Indonesia</a>
            <a href="/hi/invoice-generator/">हिन्दी</a>
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

    <!-- Hero -->
    <section class="hero" style="min-height:auto;padding:140px 24px 60px;">
      <div class="hero__content">
        <span class="hero__label">INVOICE GENERATOR</span>
        <h1 class="hero__title">Free Invoice Generator — No Sign Up Required</h1>
        <p class="hero__subtitle">Create and download professional invoices in seconds. Free forever, no account needed.</p>
        <p class="tool-updated">Last updated: March 2026</p>
        <div class="hero__trust">
          <span>✓ No Watermark</span>
          <span class="hero__trust-sep"></span>
          <span>✓ Instant PDF</span>
          <span class="hero__trust-sep"></span>
          <span>✓ No Login</span>
          <span class="hero__trust-sep"></span>
          <span>✓ EN/FR Support</span>
        </div>
      </div>
    </section>

    <!-- AdSense placeholder 1: Above tool card -->
    <div class="ad-unit ad-adsense-leaderboard" style="max-width:960px;margin:0 auto 24px;min-height:90px;">
      <ins class="adsbygoogle" style="display:block;min-height:90px;max-height:250px;overflow:hidden" data-ad-client="ca-pub-9434634079795273" data-ad-slot="auto" data-ad-format="auto" data-full-width-responsive="true"></ins>
    </div>

    <!-- Tool Interface Card -->
    <section class="tool-section" style="padding-top:0;">
      <div class="tool-interface" style="max-width:960px;" id="invoiceTool">

        <!-- Header: Title + Lang toggle -->
        <div class="invoice-header">
          <h2 style="font-size:var(--text-xl);font-weight:700;color:var(--tool-text);">Invoice</h2>
          <div class="lang-toggle" id="invoiceLang">
            <button class="lang-toggle__btn lang-toggle__btn--active" data-lang="en">EN</button>
            <button class="lang-toggle__btn" data-lang="fr">FR</button>
          </div>
        </div>

        <!-- Template Picker -->
        <div style="margin-bottom:var(--space-lg);">
          <label class="tool-label">Choose Template</label>
          <div id="templatePicker" style="display:flex;gap:12px;flex-wrap:wrap;">
            <button class="tpl-btn tpl-btn--active" data-tpl="classic" aria-label="Classic template">
              <svg width="60" height="80" viewBox="0 0 60 80" fill="none"><rect width="60" height="80" rx="3" fill="#fff" stroke="#e2e8f0"/><rect x="6" y="6" width="20" height="4" rx="1" fill="#0f172a"/><rect x="34" y="6" width="20" height="4" rx="1" fill="#4f7fff"/><rect x="6" y="16" width="48" height="1" fill="#e2e8f0"/><rect x="6" y="20" width="48" height="3" rx="1" fill="#f8fafc"/><rect x="6" y="26" width="48" height="2" rx="1" fill="#f1f5f9"/><rect x="6" y="31" width="48" height="2" rx="1" fill="#f1f5f9"/><rect x="6" y="36" width="48" height="2" rx="1" fill="#f1f5f9"/><rect x="30" y="44" width="24" height="3" rx="1" fill="#0f172a"/><rect x="6" y="54" width="48" height="1" fill="#e2e8f0"/><rect x="6" y="58" width="30" height="2" rx="1" fill="#94a3b8"/></svg>
              <span>Classic</span>
            </button>
            <button class="tpl-btn" data-tpl="modern" aria-label="Modern template">
              <svg width="60" height="80" viewBox="0 0 60 80" fill="none"><rect width="60" height="80" rx="3" fill="#fff" stroke="#e2e8f0"/><rect width="22" height="80" rx="3" fill="#4f7fff"/><rect x="4" y="8" width="14" height="3" rx="1" fill="#fff"/><rect x="4" y="14" width="10" height="2" rx="1" fill="rgba(255,255,255,0.6)"/><rect x="4" y="40" width="14" height="2" rx="1" fill="rgba(255,255,255,0.6)"/><rect x="26" y="8" width="28" height="3" rx="1" fill="#0f172a"/><rect x="26" y="16" width="28" height="1" fill="#e2e8f0"/><rect x="26" y="20" width="28" height="3" rx="1" fill="#eff6ff"/><rect x="26" y="26" width="28" height="2" rx="1" fill="#f1f5f9"/><rect x="26" y="31" width="28" height="2" rx="1" fill="#f1f5f9"/><rect x="38" y="40" width="16" height="3" rx="1" fill="#0f172a"/></svg>
              <span>Modern</span>
            </button>
            <button class="tpl-btn" data-tpl="minimal" aria-label="Minimal template">
              <svg width="60" height="80" viewBox="0 0 60 80" fill="none"><rect width="60" height="80" rx="3" fill="#fff" stroke="#e2e8f0"/><rect x="6" y="8" width="16" height="2" rx="1" fill="#94a3b8"/><rect x="6" y="14" width="24" height="3" rx="1" fill="#e2e8f0"/><rect x="6" y="24" width="48" height="0.5" fill="#e2e8f0"/><rect x="6" y="28" width="48" height="1.5" rx="1" fill="#f1f5f9"/><rect x="6" y="33" width="48" height="0.5" fill="#e2e8f0"/><rect x="6" y="37" width="48" height="1.5" rx="1" fill="#f1f5f9"/><rect x="6" y="42" width="48" height="0.5" fill="#e2e8f0"/><rect x="36" y="50" width="18" height="3" rx="1" fill="#0f172a"/><rect x="6" y="64" width="30" height="1.5" rx="1" fill="#e2e8f0"/></svg>
              <span>Minimal</span>
            </button>
            <button class="tpl-btn" data-tpl="executive" aria-label="Executive template">
              <svg width="60" height="80" viewBox="0 0 60 80" fill="none"><rect width="60" height="80" rx="3" fill="#fff" stroke="#e2e8f0"/><rect width="60" height="22" rx="3" fill="#0a0e1a"/><rect x="6" y="7" width="20" height="3" rx="1" fill="#fff"/><rect x="34" y="7" width="20" height="3" rx="1" fill="#fff" opacity="0.6"/><rect x="6" y="14" width="14" height="2" rx="1" fill="rgba(255,255,255,0.4)"/><rect width="60" height="1.5" y="22" fill="#f59e0b"/><rect x="6" y="30" width="48" height="2" rx="1" fill="#f1f5f9"/><rect x="6" y="35" width="48" height="2" rx="1" fill="#f1f5f9"/><rect x="6" y="40" width="48" height="2" rx="1" fill="#f1f5f9"/><rect x="36" y="50" width="18" height="3" rx="1" fill="#0f172a"/><rect width="60" height="1" y="62" fill="#f59e0b"/><rect x="6" y="66" width="30" height="2" rx="1" fill="#94a3b8"/></svg>
              <span>Executive</span>
            </button>
            <button class="tpl-btn" data-tpl="bold" aria-label="Bold template">
              <svg width="60" height="80" viewBox="0 0 60 80" fill="none"><rect width="60" height="80" rx="3" fill="#fff" stroke="#e2e8f0"/><rect width="60" height="24" rx="3" fill="#4f7fff"/><rect x="42" y="0" width="18" height="24" fill="rgba(255,255,255,0.15)"/><rect x="6" y="7" width="24" height="4" rx="1" fill="#fff"/><rect x="6" y="14" width="16" height="2" rx="1" fill="rgba(255,255,255,0.6)"/><rect x="2" y="28" width="2" height="30" fill="#4f7fff"/><rect x="8" y="30" width="46" height="3" rx="1" fill="#f8fafc"/><rect x="8" y="36" width="46" height="2" rx="1" fill="#fff"/><rect x="8" y="41" width="46" height="3" rx="1" fill="#f8fafc"/><rect x="8" y="47" width="46" height="2" rx="1" fill="#fff"/><rect x="8" y="54" width="46" height="6" rx="2" fill="#4f7fff" opacity="0.15"/><rect x="14" y="56" width="20" height="2" rx="1" fill="#0f172a"/></svg>
              <span>Bold</span>
            </button>
          </div>
        </div>
        <style>
        .tpl-btn{background:#fff;border:2px solid var(--tool-border);border-radius:var(--radius-md);padding:8px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;transition:all var(--transition-fast);font-family:var(--font-primary);font-size:11px;font-weight:500;color:var(--tool-text-secondary)}
        .tpl-btn:hover{border-color:var(--accent-blue)}
        .tpl-btn--active{border-color:var(--accent-blue);box-shadow:0 0 0 2px var(--accent-blue-glow);color:var(--accent-blue)}
        .tpl-btn--active::after{content:'✓';position:absolute;top:4px;right:4px;background:var(--accent-blue);color:#fff;width:16px;height:16px;border-radius:50%;font-size:10px;display:flex;align-items:center;justify-content:center}
        .tpl-btn{position:relative}
        </style>

        <!-- Logo upload -->
        <div class="tool-group logo-upload">
          <label class="tool-label">Business Logo</label>
          <input type="file" id="logoUpload" accept="image/*" style="font-size:var(--text-sm);">
          <img id="logoPreview" class="logo-preview" style="display:none;" alt="Logo" width="120" height="60">
        </div>

        <!-- From / To -->
        <div class="invoice-grid">
          <div>
            <h3 class="tool-label" style="font-size:var(--text-base);margin-bottom:12px;">From</h3>
            <div class="tool-group"><input class="tool-input" id="fromName" placeholder="Your business name"></div>
            <div class="tool-group"><input class="tool-input" id="fromAddress" placeholder="Address"></div>
            <div class="tool-group"><input class="tool-input" id="fromEmail" type="email" placeholder="Email"></div>
            <div class="tool-group"><input class="tool-input" id="fromPhone" placeholder="Phone"></div>
            <div class="tool-group"><label class="tool-label" style="font-size:12px;color:var(--tool-text-secondary);">VAT/TVA Number (optional)</label><input class="tool-input" id="fromVat" placeholder="e.g. FR12345678901"></div>
            <div class="tool-group"><label class="tool-label" style="font-size:12px;color:var(--tool-text-secondary);">Company Reg. Number (optional)</label><input class="tool-input" id="fromRegNum" placeholder="SIRET, BN, etc."></div>
            <div class="tool-group"><label class="tool-label" style="font-size:12px;color:var(--tool-text-secondary);">IBAN / Bank Account (optional)</label><input class="tool-input" id="fromIban" placeholder="e.g. DE89 3704 0044 0532 0130 00"></div>
          </div>
          <div>
            <h3 class="tool-label" style="font-size:var(--text-base);margin-bottom:12px;">To</h3>
            <div class="tool-group"><input class="tool-input" id="toName" placeholder="Client name"></div>
            <div class="tool-group"><input class="tool-input" id="toAddress" placeholder="Address"></div>
            <div class="tool-group"><input class="tool-input" id="toEmail" type="email" placeholder="Email"></div>
            <div class="tool-group"><input class="tool-input" id="toPhone" placeholder="Phone"></div>
          </div>
        </div>

        <!-- Invoice details -->
        <div class="invoice-row" style="margin-top:var(--space-lg);">
          <div class="tool-group">
            <label class="tool-label">Invoice Number</label>
            <input class="tool-input" id="invNumber" value="INV-001">
          </div>
          <div class="tool-group">
            <label class="tool-label">Issue Date</label>
            <input class="tool-input" id="invDate" type="date">
          </div>
          <div class="tool-group">
            <label class="tool-label">Due Date</label>
            <input class="tool-input" id="invDue" type="date">
          </div>
        </div>

        <!-- Currency -->
        <div class="tool-group" style="max-width:120px;margin-top:var(--space-md);">
          <label class="tool-label">Currency</label>
          <input class="tool-input" id="currency" value="$" style="text-align:center;">
        </div>

        <!-- Line items -->
        <table class="line-items">
          <thead>
            <tr>
              <th>Description</th>
              <th class="col-qty">Qty</th>
              <th class="col-rate">Rate</th>
              <th class="col-amt">Amount</th>
              <th class="col-remove"><span class="sr-only">Remove</span></th>
            </tr>
          </thead>
          <tbody id="lineItems">
            <tr>
              <td><input class="tool-input item-desc" placeholder="Item description" aria-label="Item description"></td>
              <td><input class="tool-input item-qty" type="number" value="1" min="0" step="1" aria-label="Quantity"></td>
              <td><input class="tool-input item-rate" type="number" value="0" min="0" step="0.01" aria-label="Rate"></td>
              <td class="item-amt" style="padding-top:22px;font-weight:600;color:var(--tool-text);">0.00</td>
              <td><button class="btn-remove" title="Remove">&times;</button></td>
            </tr>
          </tbody>
        </table>
        <button class="btn-add-item" id="addItem">+ Add Item</button>

        <!-- Tax + Totals -->
        <div class="totals">
          <div class="totals__row"><span>Subtotal</span><span id="subtotal">0.00</span></div>
          <div class="totals__row" id="taxRow1">
            <span style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <select id="taxLabel1" class="tool-input" style="width:auto;min-width:90px;padding:4px 8px;font-size:13px;" aria-label="Tax type">
                <option value="Tax">Tax</option><option value="VAT">VAT</option><option value="TVA">TVA</option>
                <option value="GST">GST</option><option value="HST">HST</option><option value="TPS">TPS</option>
                <option value="TVQ">TVQ</option><option value="MwSt">MwSt</option><option value="Sales Tax">Sales Tax</option>
                <option value="Custom">Custom</option>
              </select>
              <input id="taxCustom1" class="tool-input" style="display:none;width:80px;padding:4px 8px;font-size:13px;" placeholder="Label" aria-label="Custom tax label">
              <input id="taxRate1" type="number" value="0" min="0" max="100" step="0.1" style="width:50px;text-align:center;border:1px solid var(--tool-border);border-radius:4px;padding:2px 4px;font-size:13px;" aria-label="Tax rate">%
            </span>
            <span id="taxAmount1">0.00</span>
          </div>
          <div class="totals__row" id="taxRow2" style="display:none;">
            <span style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <select id="taxLabel2" class="tool-input" style="width:auto;min-width:90px;padding:4px 8px;font-size:13px;" aria-label="Tax type 2">
                <option value="Tax">Tax</option><option value="VAT">VAT</option><option value="TVA">TVA</option>
                <option value="GST">GST</option><option value="HST">HST</option><option value="TPS">TPS</option>
                <option value="TVQ">TVQ</option><option value="MwSt">MwSt</option><option value="Sales Tax">Sales Tax</option>
                <option value="Custom">Custom</option>
              </select>
              <input id="taxCustom2" class="tool-input" style="display:none;width:80px;padding:4px 8px;font-size:13px;" placeholder="Label" aria-label="Custom tax label 2">
              <input id="taxRate2" type="number" value="0" min="0" max="100" step="0.1" style="width:50px;text-align:center;border:1px solid var(--tool-border);border-radius:4px;padding:2px 4px;font-size:13px;" aria-label="Tax rate 2">%
              <button class="btn-remove" id="removeTax2" title="Remove" style="font-size:16px;">&times;</button>
            </span>
            <span id="taxAmount2">0.00</span>
          </div>
          <div id="addTaxWrap" style="text-align:right;margin:4px 0;">
            <button id="addTaxLine" style="background:none;border:none;color:var(--accent-blue);font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font-primary);">+ Add tax line</button>
          </div>
          <div class="totals__row totals__row--total"><span>Total</span><span id="totalAmount">0.00</span></div>
        </div>

        <!-- Payment Method -->
        <div class="tool-group" style="margin-top:var(--space-md);max-width:300px;">
          <label class="tool-label">Payment Method (optional)</label>
          <select id="paymentMethod" class="tool-input" aria-label="Payment method">
            <option value="">— Select —</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="PayPal">PayPal</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Stripe">Stripe</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <!-- Notes + Payment Terms -->
        <div class="invoice-grid" style="margin-top:var(--space-lg);">
          <div class="tool-group">
            <label class="tool-label">Notes</label>
            <textarea class="tool-input" id="notes" rows="3" placeholder="Thank you for your business"></textarea>
          </div>
          <div class="tool-group">
            <label class="tool-label">Payment Terms</label>
            <textarea class="tool-input" id="terms" rows="3" placeholder="Payment due within 30 days"></textarea>
          </div>
        </div>

        <!-- Signature -->
        <div class="tool-group" style="margin-top:var(--space-lg);">
          <label class="tool-label">Signature (optional)</label>
          <canvas id="sigCanvas" class="sig-canvas" width="400" height="150"></canvas>
          <div class="sig-actions">
            <button class="btn-ghost btn-sm" id="clearSig">Clear</button>
            <label class="btn-ghost btn-sm" style="cursor:pointer;">Upload Image<input type="file" id="sigUpload" accept="image/*" style="display:none;"></label>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="btn-action-group">
          <button class="btn-tool" id="downloadPdf" style="flex:2;">Download PDF</button>
          <button class="btn-ghost" id="previewBtn" style="flex:1;padding:14px 24px;">Preview</button>
          <button class="btn-ghost" id="resetBtn" style="flex:1;padding:14px 24px;color:var(--accent-red);border-color:var(--accent-red);">Reset</button>
        </div>

      </div>

      <!-- AdSense placeholder 2: Below tool card -->
      <div class="ad-unit ad-adsense-leaderboard" style="max-width:960px;margin:24px auto 0;min-height:90px;">
      <ins class="adsbygoogle" style="display:block;min-height:90px;max-height:250px;overflow:hidden" data-ad-client="ca-pub-9434634079795273" data-ad-slot="auto" data-ad-format="auto" data-full-width-responsive="true"></ins>
    </div>
    </section>

    <!-- Preview Modal -->
    <div class="modal-overlay" id="previewModal">
      <div class="modal">
        <button class="modal__close" id="closeModal">&times;</button>
        <div id="previewContent"></div>
      </div>
    </div>

    <!-- How to Use -->
    <section class="section">
      <div class="container">
        <span class="section-label reveal">HOW IT WORKS</span>
        <h2 class="reveal mb-xl">How to Create an Invoice</h2>
        <div class="steps">
          <div class="step reveal">
            <div class="step__number">1</div>
            <div class="step__text">
              <h3>Fill in your details</h3>
              <p>Enter your business info, client details, and line items.</p>
            </div>
          </div>
          <div class="step reveal">
            <div class="step__number">2</div>
            <div class="step__text">
              <h3>Preview your invoice</h3>
              <p>Click Preview to see how your invoice will look.</p>
            </div>
          </div>
          <div class="step reveal">
            <div class="step__number">3</div>
            <div class="step__text">
              <h3>Download PDF</h3>
              <p>Click Download PDF — your invoice saves instantly.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="section" style="background:var(--bg-secondary);">
      <div class="container">
        <span class="section-label reveal">FAQ</span>
        <h2 class="reveal mb-xl">Frequently Asked Questions</h2>
        <div class="faq-list">
          <details class="faq-item reveal">
            <summary>How do I create a free invoice online?</summary>
            <p>Simply fill in your business details, client info, and line items in the form above. Click "Download PDF" to generate and download your professional invoice instantly. No signup, no watermark, completely free. For US tax requirements, see the <a href="https://www.irs.gov/businesses/small-businesses-self-employed" target="_blank" rel="noopener">IRS small business guide</a>.</p>
          </details>
          <details class="faq-item reveal">
            <summary>Can I create an invoice without signing up?</summary>
            <p>Yes! Our free invoice generator requires no sign up, no account, and no email. Just fill in the form and download. Your data stays in your browser — nothing is sent to any server. This is the simplest free invoice generator with no sign up required.</p>
          </details>
          <details class="faq-item reveal">
            <summary>Is there a French invoice generator?</summary>
            <p>Yes! Click the FR toggle at the top of the invoice form. All labels, placeholders, and the PDF output will switch to French. Currency defaults to € in French mode. This is perfect for Canadian French and European French invoicing. See the <a href="https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/keeping-records.html" target="_blank" rel="noopener">Canada Revenue Agency invoicing guidelines</a> for more details.</p>
          </details>
          <details class="faq-item reveal">
            <summary>Can I add my logo to the invoice?</summary>
            <p>Yes. Click the "Business Logo" upload field and select your logo image (PNG, JPG, or SVG). It will appear in the top-right corner of your PDF invoice. The logo is processed entirely in your browser — never uploaded to any server.</p>
          </details>
          <details class="faq-item reveal">
            <summary>How do I download the invoice as PDF?</summary>
            <p>Click the blue "Download PDF" button at the bottom of the form. The PDF generates instantly in your browser using jsPDF — no server processing. The file saves with the filename invoice-[your-invoice-number].pdf.</p>
          </details>
        </div>
      </div>
    </section>

    <!-- SEO Content -->
    <section class="section">
      <div class="container" style="max-width:800px;">
        <style>
          .seo-content h2{font-size:1.5rem;font-weight:700;color:var(--text-primary);margin:48px 0 16px;line-height:1.3;}
          .seo-content h2:first-child{margin-top:0;}
          .seo-content h3{font-size:1.15rem;font-weight:600;color:var(--text-primary);margin:28px 0 12px;}
          .seo-content p{font-size:16px;line-height:1.75;color:#475569;margin-bottom:16px;}
          .seo-content ul,.seo-content ol{padding-left:24px;margin-bottom:20px;list-style:disc;}
          .seo-content ol{list-style:decimal;}
          .seo-content li{font-size:16px;line-height:1.75;color:#475569;margin-bottom:8px;}
          .seo-content a{color:#4f7fff;text-decoration:underline;text-decoration-color:rgba(79,127,255,0.3);text-underline-offset:2px;transition:text-decoration-color 0.15s;}
          .seo-content a:hover{text-decoration-color:#4f7fff;}
          .seo-content strong{color:var(--text-primary);font-weight:600;}
        </style>
        <div class="seo-content">

          <h2>How to Create a Professional Invoice</h2>
          <p>Creating a professional invoice does not have to involve expensive software or complicated accounting tools. With the AAWebTools free invoice generator, you can produce a polished, ready-to-send invoice in under two minutes. Here is exactly how to do it, step by step.</p>
          <ol>
            <li><strong>Add your business information.</strong> Start by entering your company name, address, email, and phone number. If you have a business logo, upload it using the logo field and it will appear in the header of your PDF. This branding instantly makes your invoice look more professional and trustworthy.</li>
            <li><strong>Enter your client details.</strong> Fill in the client or company name and their billing address. Accurate client information ensures there is no confusion about who the invoice is addressed to and helps your client process payment faster.</li>
            <li><strong>Add line items.</strong> Describe each product or service you provided, specify the quantity and unit price, and the tool will calculate the line total automatically. You can add as many line items as you need. For recurring services, you can keep your browser tab open and reuse the same form.</li>
            <li><strong>Configure tax, currency, and dates.</strong> Set the invoice date, due date, and payment terms. Choose your currency from the dropdown, which supports USD, CAD, EUR, GBP, AUD, and more. Add one or multiple tax lines such as GST, HST, VAT, or any custom tax rate your jurisdiction requires.</li>
            <li><strong>Choose a template and download.</strong> Select from five professionally designed invoice templates: Classic, Modern, Minimal, Executive, and Bold. Each template arranges the same information in a different visual style. Click "Download PDF" and your invoice is generated instantly in your browser. No data ever leaves your device.</li>
          </ol>
          <p>The entire process runs locally in your browser using client-side JavaScript. Nothing is uploaded to a server, making this one of the most private invoice tools available online. If you also need to generate <a href="/paystub-generator/">pay stubs</a> or track self-employment income, pair this tool with our <a href="/blog/pay-stub-generator-self-employed/">self-employed pay stub guide</a>.</p>

          <h2>What to Include on an Invoice</h2>
          <p>A complete invoice serves as both a payment request and a legal record of a transaction. Whether you are a freelancer billing a single client or a small business managing dozens of accounts, every invoice should contain these essential elements:</p>
          <ul>
            <li><strong>Invoice number</strong> — A unique identifier for tracking and bookkeeping. Use sequential numbering (INV-001, INV-002) or a date-based system (2026-04-001) to keep records organized.</li>
            <li><strong>Invoice date</strong> — The date the invoice was issued. This establishes the billing period and is critical for accounting purposes.</li>
            <li><strong>Due date</strong> — When payment is expected. Common terms include Net 15, Net 30, or Due on Receipt. Clear due dates reduce late payments.</li>
            <li><strong>Business details</strong> — Your company name, address, email, phone number, and optionally your tax registration number (GST/HST number, VAT ID, EIN, etc.).</li>
            <li><strong>Client details</strong> — The full name or business name and billing address of the person or company you are invoicing.</li>
            <li><strong>Line items</strong> — A detailed breakdown of each product or service provided, including description, quantity, unit price, and line total.</li>
            <li><strong>Tax</strong> — The applicable tax rate(s) and calculated tax amount. In many jurisdictions, showing the tax breakdown is a legal requirement.</li>
            <li><strong>Total amount due</strong> — The final amount the client owes, clearly displayed. This should include the subtotal, all taxes, and any discounts applied.</li>
            <li><strong>Payment terms and instructions</strong> — How the client can pay (bank transfer, PayPal, cheque, etc.) and any late payment policies.</li>
          </ul>
          <p>Missing any of these elements can delay payment or cause disputes. Our invoice generator includes fields for every one of these items, ensuring your invoices are complete and professional every time.</p>

          <h2>Invoice Templates for Every Business</h2>
          <p>Different businesses have different branding needs. That is why the AAWebTools invoice generator offers five distinct PDF templates, all included free:</p>
          <ul>
            <li><strong>Classic</strong> — A clean, traditional layout with a structured grid. Ideal for freelancers, consultants, and small businesses that want a straightforward, no-frills invoice.</li>
            <li><strong>Modern</strong> — A contemporary design with a colored header band and refined typography. Well suited for creative agencies, design studios, and tech companies.</li>
            <li><strong>Minimal</strong> — A stripped-down layout with maximum whitespace. Perfect for solopreneurs and professionals who prefer an understated, elegant look.</li>
            <li><strong>Executive</strong> — A premium-feeling template with subtle accents and formal structure. Best for law firms, financial consultants, and corporate service providers.</li>
            <li><strong>Bold</strong> — A high-contrast design with strong visual hierarchy. Great for contractors, trades professionals, and businesses that want their invoices to stand out.</li>
          </ul>
          <p>Every template includes the same complete set of fields: logo placement, line items, multi-tax support, notes, and payment terms. Switch between templates with a single click to find the one that matches your brand.</p>

          <h2>Multi-Currency and Tax Support</h2>
          <p>The invoice generator supports a wide range of currencies including USD, CAD, EUR, GBP, AUD, INR, and many more. The currency symbol is automatically applied throughout your invoice and PDF output. For international businesses, this means you can issue invoices in the currency your client expects without any manual formatting.</p>
          <p>Tax handling is equally flexible. You can add multiple tax lines to a single invoice, each with a custom label and rate. This covers common scenarios like Canadian HST (13%), GST (5%), or provincial PST, European VAT (ranging from 19% to 27% depending on the country), UK VAT (20%), and Australian GST (10%). If your jurisdiction uses a compound tax system or you need to show multiple tax components separately, simply add additional tax rows. Each tax line calculates independently against the subtotal, and the final total reflects all applied taxes.</p>

          <h2>Frequently Asked Questions</h2>
          <details class="faq-item reveal">
            <summary>Is the invoice generator completely free?</summary>
            <p>Yes. The AAWebTools invoice generator is 100% free with no hidden costs, no watermarks, and no limits on the number of invoices you can create. There is no signup or account required. The tool is supported by non-intrusive advertising.</p>
          </details>
          <details class="faq-item reveal">
            <summary>Can I add my company logo to the invoice?</summary>
            <p>Yes. Upload any PNG, JPG, or SVG file using the logo upload field. Your logo will appear in the header area of the generated PDF. The image is processed entirely in your browser and is never uploaded to any server.</p>
          </details>
          <details class="faq-item reveal">
            <summary>What tax rates are supported?</summary>
            <p>Any tax rate you need. You can add multiple tax lines with custom labels (GST, HST, VAT, PST, state tax, etc.) and set the percentage for each. The tool calculates each tax line independently against the subtotal, so it works for any country or jurisdiction.</p>
          </details>
          <details class="faq-item reveal">
            <summary>Can I create invoices in French?</summary>
            <p>Yes. Click the language toggle to switch to French. All form labels, placeholders, and the PDF output will render in French with proper terminology (Facture, Montant HT, TVA, Total TTC, etc.). The currency defaults to EUR in French mode. This works for both Canadian French and European French invoicing needs.</p>
          </details>
          <details class="faq-item reveal">
            <summary>Are my invoices stored on your servers?</summary>
            <p>No. The entire invoice generation process runs locally in your browser. Your business details, client information, and line items never leave your device. The PDF is generated client-side using JavaScript and downloaded directly to your computer. We do not store, transmit, or have access to any of your invoice data.</p>
          </details>

        </div>
      </div>
    </section>

    <section class="section" style="background:var(--bg-secondary)">
      <div class="container">
        <h2>Related Articles</h2>
        <ul style="list-style:none;padding:0;display:grid;gap:12px;">
          <li><a href="/blog/pay-stub-generator-self-employed/" style="color:var(--accent-blue)">Pay Stub Generator for Self-Employed 2026</a></li>
        </ul>
      </div>
    </section>

    <!-- Related Tools -->
    <section class="section">
      <div class="container text-center">
        <span class="section-label reveal">MORE TOOLS</span>
        <h2 class="reveal mb-lg">You might also need</h2>
        <div class="related-tools">
          <a href="/paystub-generator/" class="related-tool reveal">
            <div class="related-tool__icon"><svg viewBox="0 0 40 40" fill="none"><rect x="8" y="6" width="24" height="28" rx="2" stroke="currentColor" stroke-width="2"/><path d="M20 16v8m-3-4.5L20 16l3 3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="20" cy="28" r="1.5" fill="currentColor"/></svg></div>
            <div><div class="related-tool__name">Pay Stub Generator</div><div class="related-tool__desc">Create professional pay stubs — free PDF</div></div>
          </a>
          <a href="/ai-detector/" class="related-tool reveal">
            <div class="related-tool__icon"><svg viewBox="0 0 40 40" fill="none"><circle cx="18" cy="18" r="10" stroke="currentColor" stroke-width="2"/><path d="M26 26l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></div>
            <div><div class="related-tool__name">AI Content Detector</div><div class="related-tool__desc">Detect AI-generated text instantly</div></div>
          </a>
        </div>
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer class="footer">
    <div class="footer__grid">
      <div><div class="footer__logo"><img src="/assets/img/logo-light.png" alt="AAWebTools" height="44"></div><p class="footer__tagline">Free tools for everyone, worldwide</p><p class="footer__copyright">&copy; 2026 AAWebTools. All rights reserved. Built by <a href="https://scopecove.com/" target="_blank" rel="noopener" class="footer__link" style="display:inline;">ScopeCove</a></p></div>
      <div><h4 class="footer__heading">Tools</h4><a href="/tiktok-downloader/" class="footer__link">TikTok Downloader</a><a href="/twitter-video-downloader/" class="footer__link">Twitter Video Downloader</a><a href="/invoice-generator/" class="footer__link">Invoice Generator</a><a href="/ai-detector/" class="footer__link">AI Content Detector</a><a href="/ai-humanizer/" class="footer__link">AI Text Humanizer</a><a href="/paystub-generator/" class="footer__link">Pay Stub Generator</a></div>
      <div><h4 class="footer__heading">Legal</h4><a href="/privacy/" class="footer__link">Privacy Policy</a><a href="/terms/" class="footer__link">Terms of Service</a><a href="/about/" class="footer__link">About</a><a href="/contact/" class="footer__link">Contact</a><a href="/blog/" class="footer__link">Blog</a></div>
    </div>
    <div class="footer__bottom">Made with &#10084;&#65039; | Free forever | No signup required</div>
  </footer>

  <script src="/assets/js/core.js" defer></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" defer></script>
  <script>
  (function(){
    'use strict';

    // === State ===
    var lang='en';
    var logoData=null;
    var sigData=null;
    var selectedTemplate='classic';
    var T={
      en:{invoice:'Invoice',from:'From',to:'To',invNum:'Invoice Number',date:'Issue Date',due:'Due Date',desc:'Description',qty:'Qty',rate:'Rate',amt:'Amount',sub:'Subtotal',total:'Total',notes:'Notes',terms:'Payment Terms',dl:'Download PDF',currency:'$',defTax:'Tax',vatNum:'VAT/TVA Number',regNum:'Company Reg. Number',iban:'IBAN / Bank Account',payment:'Payment Method'},
      fr:{invoice:'Facture',from:'De',to:'Pour',invNum:'Numéro de facture',date:"Date d'émission",due:"Date d'échéance",desc:'Description',qty:'Qté',rate:'Taux',amt:'Montant',sub:'Sous-total',total:'Total',notes:'Notes',terms:'Conditions de paiement',dl:'Télécharger PDF',currency:'€',defTax:'TVA',vatNum:'Numéro de TVA',regNum:"Numéro d'immatriculation",iban:'IBAN / Compte bancaire',payment:'Mode de paiement'}
    };

    // === Template Picker ===
    document.querySelectorAll('.tpl-btn').forEach(function(b){
      b.addEventListener('click',function(){
        document.querySelectorAll('.tpl-btn').forEach(function(x){x.classList.remove('tpl-btn--active');});
        b.classList.add('tpl-btn--active');
        selectedTemplate=b.getAttribute('data-tpl');
      });
    });

    // === Invoice language toggle (separate from global) ===
    document.getElementById('invoiceLang').querySelectorAll('.lang-toggle__btn').forEach(function(b){
      b.addEventListener('click',function(){
        lang=b.getAttribute('data-lang');
        document.getElementById('invoiceLang').querySelectorAll('.lang-toggle__btn').forEach(function(x){x.classList.toggle('lang-toggle__btn--active',x.getAttribute('data-lang')===lang);});
        document.getElementById('currency').value=T[lang].currency;
        document.getElementById('taxLabel1').value=T[lang].defTax;
      });
    });

    // === Today's date ===
    var today=new Date().toISOString().split('T')[0];
    document.getElementById('invDate').value=today;
    var due=new Date();due.setDate(due.getDate()+30);
    document.getElementById('invDue').value=due.toISOString().split('T')[0];

    // === Logo upload ===
    document.getElementById('logoUpload').addEventListener('change',function(e){
      var f=e.target.files[0];if(!f)return;
      var r=new FileReader();r.onload=function(ev){logoData=ev.target.result;var p=document.getElementById('logoPreview');p.src=logoData;p.style.display='block';};r.readAsDataURL(f);
    });

    // === Signature canvas ===
    var canvas=document.getElementById('sigCanvas'),ctx=canvas.getContext('2d'),drawing=false;
    function getPos(e){var r=canvas.getBoundingClientRect();var t=e.touches?e.touches[0]:e;return{x:t.clientX-r.left,y:t.clientY-r.top};}
    canvas.addEventListener('mousedown',function(e){drawing=true;ctx.beginPath();var p=getPos(e);ctx.moveTo(p.x,p.y);});
    canvas.addEventListener('mousemove',function(e){if(!drawing)return;var p=getPos(e);ctx.lineTo(p.x,p.y);ctx.strokeStyle='#0f172a';ctx.lineWidth=2;ctx.stroke();});
    canvas.addEventListener('mouseup',function(){drawing=false;sigData=canvas.toDataURL();});
    canvas.addEventListener('mouseleave',function(){drawing=false;});
    canvas.addEventListener('touchstart',function(e){e.preventDefault();drawing=true;ctx.beginPath();var p=getPos(e);ctx.moveTo(p.x,p.y);},{passive:false});
    canvas.addEventListener('touchmove',function(e){e.preventDefault();if(!drawing)return;var p=getPos(e);ctx.lineTo(p.x,p.y);ctx.strokeStyle='#0f172a';ctx.lineWidth=2;ctx.stroke();},{passive:false});
    canvas.addEventListener('touchend',function(){drawing=false;sigData=canvas.toDataURL();});
    document.getElementById('clearSig').addEventListener('click',function(){ctx.clearRect(0,0,canvas.width,canvas.height);sigData=null;});
    document.getElementById('sigUpload').addEventListener('change',function(e){
      var f=e.target.files[0];if(!f)return;
      var r=new FileReader();r.onload=function(ev){sigData=ev.target.result;ctx.clearRect(0,0,canvas.width,canvas.height);var img=new Image();img.onload=function(){ctx.drawImage(img,0,0,canvas.width,canvas.height);};img.src=sigData;};r.readAsDataURL(f);
    });

    // === Line items ===
    function newRow(){
      var ph=lang==='fr'?"Description de l'article":"Item description";
      var tr=document.createElement('tr');
      tr.innerHTML='<td><input class="tool-input item-desc" placeholder="'+ph+'"></td><td><input class="tool-input item-qty" type="number" value="1" min="0" step="1"></td><td><input class="tool-input item-rate" type="number" value="0" min="0" step="0.01"></td><td class="item-amt" style="padding-top:22px;font-weight:600;color:var(--tool-text);">0.00</td><td><button class="btn-remove" title="Remove">&times;</button></td>';
      document.getElementById('lineItems').appendChild(tr);
      bindRow(tr);
    }
    function bindRow(tr){
      tr.querySelector('.btn-remove').addEventListener('click',function(){if(document.getElementById('lineItems').rows.length>1)tr.remove();calc();});
      tr.querySelector('.item-qty').addEventListener('input',calc);
      tr.querySelector('.item-rate').addEventListener('input',calc);
    }
    document.getElementById('addItem').addEventListener('click',newRow);
    document.querySelectorAll('#lineItems tr').forEach(bindRow);

    // === Tax UI logic ===
    function setupTaxSelect(n){
      var sel=document.getElementById('taxLabel'+n),cust=document.getElementById('taxCustom'+n);
      sel.addEventListener('change',function(){cust.style.display=sel.value==='Custom'?'inline-block':'none';calc();});
    }
    setupTaxSelect(1);setupTaxSelect(2);
    document.getElementById('taxRate1').addEventListener('input',calc);
    document.getElementById('taxRate2').addEventListener('input',calc);
    document.getElementById('addTaxLine').addEventListener('click',function(){
      document.getElementById('taxRow2').style.display='flex';
      document.getElementById('addTaxWrap').style.display='none';
    });
    document.getElementById('removeTax2').addEventListener('click',function(){
      document.getElementById('taxRow2').style.display='none';
      document.getElementById('addTaxWrap').style.display='block';
      document.getElementById('taxRate2').value='0';calc();
    });

    function getTaxLabel(n){
      var sel=document.getElementById('taxLabel'+n);
      if(sel.value==='Custom')return document.getElementById('taxCustom'+n).value||'Tax';
      return sel.value;
    }
    function getTaxRate(n){return parseFloat(document.getElementById('taxRate'+n).value)||0;}
    function isTax2Visible(){return document.getElementById('taxRow2').style.display!=='none';}

    function calc(){
      var rows=document.getElementById('lineItems').rows;
      var sub=0;
      for(var i=0;i<rows.length;i++){
        var q=parseFloat(rows[i].querySelector('.item-qty').value)||0;
        var r=parseFloat(rows[i].querySelector('.item-rate').value)||0;
        var a=q*r;
        rows[i].querySelector('.item-amt').textContent=a.toFixed(2);
        sub+=a;
      }
      var t1=sub*(getTaxRate(1)/100);
      var t2=isTax2Visible()?sub*(getTaxRate(2)/100):0;
      var cur=document.getElementById('currency').value;
      document.getElementById('subtotal').textContent=cur+sub.toFixed(2);
      document.getElementById('taxAmount1').textContent=cur+t1.toFixed(2);
      if(isTax2Visible())document.getElementById('taxAmount2').textContent=cur+t2.toFixed(2);
      document.getElementById('totalAmount').textContent=cur+(sub+t1+t2).toFixed(2);
    }
    calc();

    // === Reset ===
    document.getElementById('resetBtn').addEventListener('click',function(){
      document.querySelectorAll('#invoiceTool input[type="text"],#invoiceTool input[type="email"],#invoiceTool input[type="url"]').forEach(function(i){i.value='';});
      document.getElementById('fromName').value='';document.getElementById('toName').value='';
      document.getElementById('fromAddress').value='';document.getElementById('toAddress').value='';
      document.getElementById('fromEmail').value='';document.getElementById('toEmail').value='';
      document.getElementById('fromPhone').value='';document.getElementById('toPhone').value='';
      document.getElementById('fromVat').value='';document.getElementById('fromRegNum').value='';document.getElementById('fromIban').value='';
      document.getElementById('notes').value='';document.getElementById('terms').value='';
      document.getElementById('taxRate1').value='0';document.getElementById('taxRate2').value='0';
      document.getElementById('taxLabel1').value=T[lang].defTax;document.getElementById('taxLabel2').value='Tax';
      document.getElementById('taxCustom1').style.display='none';document.getElementById('taxCustom2').style.display='none';
      document.getElementById('taxRow2').style.display='none';document.getElementById('addTaxWrap').style.display='block';
      document.getElementById('paymentMethod').value='';
      var tb=document.getElementById('lineItems');while(tb.rows.length>1)tb.deleteRow(1);
      var r0=tb.rows[0];r0.querySelector('.item-desc').value='';r0.querySelector('.item-qty').value='1';r0.querySelector('.item-rate').value='0';
      ctx.clearRect(0,0,canvas.width,canvas.height);sigData=null;logoData=null;
      document.getElementById('logoPreview').style.display='none';
      calc();
    });

    // === getData — collect all form values into one object ===
    function getData(){
      var rows=document.getElementById('lineItems').rows;
      var items=[];
      for(var i=0;i<rows.length;i++){
        items.push({desc:rows[i].querySelector('.item-desc').value||'',qty:rows[i].querySelector('.item-qty').value,rate:rows[i].querySelector('.item-rate').value,amt:rows[i].querySelector('.item-amt').textContent});
      }
      return {
        t:T[lang],cur:document.getElementById('currency').value,lang:lang,
        logo:logoData,sig:sigData,
        fromName:document.getElementById('fromName').value,fromAddress:document.getElementById('fromAddress').value,
        fromEmail:document.getElementById('fromEmail').value,fromPhone:document.getElementById('fromPhone').value,
        fromVat:document.getElementById('fromVat').value,fromReg:document.getElementById('fromRegNum').value,
        fromIban:document.getElementById('fromIban').value,
        toName:document.getElementById('toName').value,toAddress:document.getElementById('toAddress').value,
        toEmail:document.getElementById('toEmail').value,toPhone:document.getElementById('toPhone').value,
        invNum:document.getElementById('invNumber').value,invDate:document.getElementById('invDate').value,
        invDue:document.getElementById('invDue').value,
        items:items,sub:document.getElementById('subtotal').textContent,
        tax1Label:getTaxLabel(1),tax1Rate:getTaxRate(1),tax1Amt:document.getElementById('taxAmount1').textContent,
        hasTax2:isTax2Visible(),tax2Label:isTax2Visible()?getTaxLabel(2):'',tax2Rate:isTax2Visible()?getTaxRate(2):0,tax2Amt:isTax2Visible()?document.getElementById('taxAmount2').textContent:'',
        total:document.getElementById('totalAmount').textContent,
        notes:document.getElementById('notes').value,terms:document.getElementById('terms').value,
        payMethod:document.getElementById('paymentMethod').value
      };
    }

    // === Preview ===
    document.getElementById('previewBtn').addEventListener('click',function(){
      document.getElementById('previewContent').innerHTML=buildPreviewHTML(getData());
      document.getElementById('previewModal').classList.add('is-open');
    });
    document.getElementById('closeModal').addEventListener('click',function(){document.getElementById('previewModal').classList.remove('is-open');});
    document.getElementById('previewModal').addEventListener('click',function(e){if(e.target===this)this.classList.remove('is-open');});

    function buildPreviewHTML(d){
      var t=d.t,c=d.cur,itemsH='';
      d.items.forEach(function(it){itemsH+='<tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0">'+it.desc+'</td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:center">'+it.qty+'</td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right">'+c+it.rate+'</td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right">'+c+it.amt+'</td></tr>';});
      var logoH=d.logo?'<img src="'+d.logo+'" style="max-width:120px;max-height:60px;">':'';
      var sigH=d.sig?'<img src="'+d.sig+'" style="max-width:200px;max-height:80px;margin-top:16px;">':'';
      var fExtra='';
      if(d.fromVat)fExtra+='<br><span style="color:#64748b;font-size:12px;">'+t.vatNum+': '+d.fromVat+'</span>';
      if(d.fromReg)fExtra+='<br><span style="color:#64748b;font-size:12px;">'+t.regNum+': '+d.fromReg+'</span>';
      var taxH='<p>'+d.tax1Label+' ('+d.tax1Rate+'%): '+d.tax1Amt+'</p>';
      if(d.hasTax2)taxH+='<p>'+d.tax2Label+' ('+d.tax2Rate+'%): '+d.tax2Amt+'</p>';
      var footH='';
      if(d.payMethod)footH+='<div style="margin-top:12px;"><strong>'+t.payment+'</strong><p style="color:#64748b;">'+d.payMethod+'</p></div>';
      if(d.fromIban)footH+='<div style="margin-top:8px;"><strong>'+t.iban+'</strong><p style="color:#64748b;">'+d.fromIban+'</p></div>';
      return '<div style="font-family:Inter,sans-serif;color:#0f172a;font-size:14px;"><div style="display:flex;justify-content:space-between;margin-bottom:32px;"><div><h2 style="font-size:28px;font-weight:700;margin:0;">'+t.invoice+'</h2><p style="color:#64748b;margin:4px 0;">'+d.invNum+'</p></div>'+logoH+'</div><div style="display:flex;gap:40px;margin-bottom:24px;"><div style="flex:1;"><strong>'+t.from+'</strong><br>'+d.fromName+'<br>'+d.fromAddress+'<br>'+d.fromEmail+'<br>'+d.fromPhone+fExtra+'</div><div style="flex:1;"><strong>'+t.to+'</strong><br>'+d.toName+'<br>'+d.toAddress+'<br>'+d.toEmail+'<br>'+d.toPhone+'</div></div><div style="display:flex;gap:24px;margin-bottom:24px;font-size:13px;color:#64748b;"><span>'+t.date+': '+d.invDate+'</span><span>'+t.due+': '+d.invDue+'</span></div><table style="width:100%;border-collapse:collapse;"><thead><tr style="border-bottom:2px solid #0f172a;"><th style="text-align:left;padding:8px 0;">'+t.desc+'</th><th style="text-align:center;padding:8px 0;">'+t.qty+'</th><th style="text-align:right;padding:8px 0;">'+t.rate+'</th><th style="text-align:right;padding:8px 0;">'+t.amt+'</th></tr></thead><tbody>'+itemsH+'</tbody></table><div style="text-align:right;margin-top:16px;"><p>'+t.sub+': '+d.sub+'</p>'+taxH+'<p style="font-size:18px;font-weight:700;margin-top:8px;">'+t.total+': '+d.total+'</p></div>'+(d.notes?'<div style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;"><strong>'+t.notes+'</strong><p style="color:#64748b;">'+d.notes+'</p></div>':'')+(d.terms?'<div style="margin-top:12px;"><strong>'+t.terms+'</strong><p style="color:#64748b;">'+d.terms+'</p></div>':'')+footH+sigH+'</div>';
    }

    // ============================================================
    // PDF RENDER HELPERS
    // ============================================================
    function pdfItems(doc,d,x,y,w){
      var t=d.t,c=d.cur,rX=x+w*0.55,qX=x+w*0.7,aX=x+w*0.85;
      doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(0);
      doc.text(t.desc,x,y);doc.text(t.qty,qX,y);doc.text(t.rate,rX,y);doc.text(t.amt,aX,y);y+=2;
      doc.setDrawColor(15,23,42);doc.setLineWidth(0.5);doc.line(x,y,x+w,y);y+=6;
      doc.setFont('helvetica','normal');
      d.items.forEach(function(it){doc.text((it.desc||'').substring(0,45),x,y);doc.text(it.qty,qX,y);doc.text(c+it.rate,rX,y);doc.text(c+it.amt,aX,y);y+=6;if(y>260){doc.addPage();y=20;}});
      return y+4;
    }
    function pdfTotals(doc,d,x,y){
      var t=d.t;
      doc.setDrawColor(226,232,240);doc.line(x,y,x+65,y);y+=6;
      doc.setFont('helvetica','normal');doc.setFontSize(9);
      doc.text(t.sub+':',x,y);doc.text(d.sub,x+50,y);y+=6;
      doc.text(d.tax1Label+' ('+d.tax1Rate+'%):',x-10,y);doc.text(d.tax1Amt,x+50,y);y+=6;
      if(d.hasTax2){doc.text(d.tax2Label+' ('+d.tax2Rate+'%):',x-10,y);doc.text(d.tax2Amt,x+50,y);y+=6;}
      doc.setFont('helvetica','bold');doc.setFontSize(12);
      doc.text(t.total+':',x,y);doc.text(d.total,x+50,y);y+=12;
      return y;
    }
    function pdfFooter(doc,d,y){
      var t=d.t;doc.setFont('helvetica','normal');doc.setFontSize(9);
      if(d.notes){doc.setFont('helvetica','bold');doc.text(t.notes,20,y);y+=5;doc.setFont('helvetica','normal');doc.setTextColor(100);var nl=doc.splitTextToSize(d.notes,170);doc.text(nl,20,y);y+=nl.length*4+4;doc.setTextColor(0);}
      if(d.terms){doc.setFont('helvetica','bold');doc.text(t.terms,20,y);y+=5;doc.setFont('helvetica','normal');doc.setTextColor(100);var tl=doc.splitTextToSize(d.terms,170);doc.text(tl,20,y);y+=tl.length*4+4;doc.setTextColor(0);}
      if(d.payMethod||d.fromIban){if(y>240){doc.addPage();y=20;}doc.setDrawColor(226,232,240);doc.line(20,y,195,y);y+=6;if(d.payMethod){doc.setFont('helvetica','bold');doc.text(t.payment+':',20,y);doc.setFont('helvetica','normal');doc.text(d.payMethod,65,y);y+=5;}if(d.fromIban){doc.setFont('helvetica','bold');doc.text(t.iban+':',20,y);doc.setFont('helvetica','normal');doc.text(d.fromIban,65,y);y+=5;}y+=4;}
      if(d.sig){try{if(y>230){doc.addPage();y=20;}doc.addImage(d.sig,'PNG',20,y,60,25);}catch(e){}}
      return y;
    }
    function pdfFrom(doc,d,x,y){
      var t=d.t;doc.setFont('helvetica','bold');doc.text(t.from,x,y);y+=6;doc.setFont('helvetica','normal');
      [d.fromName,d.fromAddress,d.fromEmail,d.fromPhone].forEach(function(l){doc.text(l||'',x,y);y+=5;});
      if(d.fromVat){doc.setFontSize(8);doc.setTextColor(100);doc.text(t.vatNum+': '+d.fromVat,x,y);y+=4;doc.setFontSize(10);doc.setTextColor(0);}
      if(d.fromReg){doc.setFontSize(8);doc.setTextColor(100);doc.text(t.regNum+': '+d.fromReg,x,y);y+=4;doc.setFontSize(10);doc.setTextColor(0);}
      return y;
    }

    // ============================================================
    // TEMPLATE 1 — Classic
    // ============================================================
    function renderClassicPDF(d){
      var doc=new(window.jspdf.jsPDF);var t=d.t,y=20;
      if(d.logo){try{doc.addImage(d.logo,'PNG',140,15,50,25);}catch(e){}}
      doc.setFontSize(24);doc.setFont('helvetica','bold');doc.setTextColor(79,127,255);doc.text(t.invoice,150,25,{align:'right'});
      doc.setTextColor(0);doc.setFontSize(10);doc.setFont('helvetica','bold');doc.text(d.fromName||'',20,y);y+=6;
      doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(100);
      [d.fromAddress,d.fromEmail,d.fromPhone].forEach(function(l){if(l){doc.text(l,20,y);y+=4;}});
      if(d.fromVat){doc.text(t.vatNum+': '+d.fromVat,20,y);y+=4;}
      if(d.fromReg){doc.text(t.regNum+': '+d.fromReg,20,y);y+=4;}
      doc.setTextColor(0);y+=6;
      doc.setFontSize(9);doc.setTextColor(100);doc.text(d.invNum,20,y);doc.text(t.date+': '+d.invDate+'   '+t.due+': '+d.invDue,80,y);y+=8;
      doc.setTextColor(0);doc.setFontSize(10);doc.setFont('helvetica','bold');doc.text(t.to,20,y);y+=6;
      doc.setFont('helvetica','normal');[d.toName,d.toAddress,d.toEmail,d.toPhone].forEach(function(l){if(l){doc.text(l,20,y);y+=5;}});y+=6;
      doc.setFillColor(248,250,252);doc.rect(20,y-3,175,8,'F');
      y=pdfItems(doc,d,20,y,175);y=pdfTotals(doc,d,130,y);y=pdfFooter(doc,d,y);
      return doc;
    }

    // ============================================================
    // TEMPLATE 2 — Modern (blue sidebar)
    // ============================================================
    function renderModernPDF(d){
      var doc=new(window.jspdf.jsPDF);var t=d.t;
      doc.setFillColor(79,127,255);doc.rect(0,0,65,297,'F');
      doc.setTextColor(255);doc.setFontSize(22);doc.setFont('helvetica','bold');doc.text(t.invoice,10,30);
      doc.setFontSize(10);doc.setFont('helvetica','normal');
      if(d.logo){try{doc.addImage(d.logo,'PNG',8,40,48,20);}catch(e){}}
      var sy=d.logo?65:45;
      doc.setFontSize(9);doc.setFont('helvetica','bold');doc.text(d.fromName||'',10,sy);sy+=5;
      doc.setFont('helvetica','normal');doc.setFontSize(8);
      [d.fromAddress,d.fromEmail,d.fromPhone].forEach(function(l){if(l){doc.text(l,10,sy);sy+=4;}});
      if(d.fromVat){doc.text(t.vatNum+': '+d.fromVat,10,sy);sy+=4;}
      if(d.fromReg){doc.text(t.regNum+': '+d.fromReg,10,sy);sy+=4;}
      if(d.fromIban){doc.text(d.fromIban,10,sy);sy+=4;}
      doc.setTextColor(0);var rx=75,ry=20;
      doc.setFontSize(10);doc.setFont('helvetica','bold');doc.text(d.invNum,rx,ry);ry+=6;
      doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(100);doc.text(t.date+': '+d.invDate,rx,ry);ry+=4;doc.text(t.due+': '+d.invDue,rx,ry);ry+=8;
      doc.setTextColor(0);doc.setFont('helvetica','bold');doc.text(t.to,rx,ry);ry+=5;doc.setFont('helvetica','normal');
      [d.toName,d.toAddress,d.toEmail,d.toPhone].forEach(function(l){if(l){doc.text(l,rx,ry);ry+=4;}});ry+=6;
      doc.setFillColor(239,246,255);doc.rect(rx-2,ry-3,128,8,'F');
      ry=pdfItems(doc,d,rx,ry,125);ry=pdfTotals(doc,d,145,ry);
      doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(100);var fy=ry;
      if(d.notes){doc.text(t.notes+': '+d.notes.substring(0,80),rx,fy);fy+=4;}
      if(d.terms){doc.text(t.terms+': '+d.terms.substring(0,80),rx,fy);fy+=4;}
      if(d.payMethod){doc.text(t.payment+': '+d.payMethod,rx,fy);fy+=4;}
      if(d.sig){try{doc.addImage(d.sig,'PNG',rx,fy+2,50,20);}catch(e){}}
      return doc;
    }

    // ============================================================
    // TEMPLATE 3 — Minimal
    // ============================================================
    function renderMinimalPDF(d){
      var doc=new(window.jspdf.jsPDF);var t=d.t,y=25;
      doc.setFontSize(9);doc.setFont('helvetica','normal');doc.setTextColor(150);doc.text(d.fromName||'',20,y);
      doc.setFontSize(10);doc.setTextColor(180);doc.text('invoice',170,y,{align:'right'});y+=12;
      doc.setTextColor(100);doc.setFontSize(8);doc.text(d.invNum+'  |  '+d.invDate+'  |  '+t.due+': '+d.invDue,20,y);y+=10;
      doc.setTextColor(0);doc.setFontSize(9);
      doc.setFont('helvetica','bold');doc.text(t.from,20,y);doc.text(t.to,110,y);y+=5;doc.setFont('helvetica','normal');
      [d.fromName,d.fromAddress,d.fromEmail,d.fromPhone].forEach(function(l,i){doc.text(l||'',20,y);doc.text([d.toName,d.toAddress,d.toEmail,d.toPhone][i]||'',110,y);y+=4;});
      if(d.fromVat){doc.setFontSize(7);doc.setTextColor(150);doc.text(t.vatNum+': '+d.fromVat,20,y);y+=3;doc.setFontSize(9);doc.setTextColor(0);}
      y+=8;
      doc.setDrawColor(226,232,240);doc.setLineWidth(0.3);
      doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(150);
      doc.text(t.desc,20,y);doc.text(t.qty,120,y);doc.text(t.rate,145,y);doc.text(t.amt,175,y);y+=2;doc.line(20,y,195,y);y+=5;
      doc.setTextColor(0);doc.setFontSize(9);
      d.items.forEach(function(it){doc.text((it.desc||'').substring(0,50),20,y);doc.text(it.qty,122,y);doc.text(d.cur+it.rate,145,y);doc.text(d.cur+it.amt,175,y);y+=5;doc.line(20,y,195,y);y+=5;if(y>260){doc.addPage();y=20;}});
      y+=4;doc.setFontSize(9);doc.text(t.sub+': '+d.sub,175,y,{align:'right'});y+=5;
      doc.text(d.tax1Label+' ('+d.tax1Rate+'%): '+d.tax1Amt,175,y,{align:'right'});y+=5;
      if(d.hasTax2){doc.text(d.tax2Label+' ('+d.tax2Rate+'%): '+d.tax2Amt,175,y,{align:'right'});y+=5;}
      doc.setFont('helvetica','bold');doc.setFontSize(11);doc.text(t.total+': '+d.total,175,y,{align:'right'});y+=12;
      doc.setFont('helvetica','normal');y=pdfFooter(doc,d,y);
      if(d.logo){try{doc.addImage(d.logo,'PNG',150,10,40,18);}catch(e){}}
      return doc;
    }

    // ============================================================
    // TEMPLATE 4 — Executive (dark header + amber accent)
    // ============================================================
    function renderExecutivePDF(d){
      var doc=new(window.jspdf.jsPDF);var t=d.t;
      doc.setFillColor(10,14,26);doc.rect(0,0,210,45,'F');
      doc.setDrawColor(245,158,11);doc.setLineWidth(1);doc.line(0,45,210,45);
      doc.setTextColor(255);doc.setFontSize(11);doc.setFont('helvetica','bold');
      doc.text(d.fromName||'',20,18);
      doc.setFontSize(8);doc.setFont('helvetica','normal');
      var hy=24;[d.fromAddress,d.fromEmail,d.fromPhone].forEach(function(l){if(l){doc.text(l,20,hy);hy+=4;}});
      doc.setFontSize(22);doc.setFont('helvetica','bold');doc.text(t.invoice,190,20,{align:'right'});
      doc.setFontSize(9);doc.setFont('helvetica','normal');doc.text(d.invNum,190,28,{align:'right'});
      doc.text(t.date+': '+d.invDate,190,34,{align:'right'});doc.text(t.due+': '+d.invDue,190,39,{align:'right'});
      if(d.logo){try{doc.addImage(d.logo,'PNG',20,28,35,14);}catch(e){}}
      doc.setTextColor(0);var y=55;
      doc.setFont('helvetica','bold');doc.setFontSize(10);doc.text(t.to,20,y);y+=5;
      doc.setFont('helvetica','normal');doc.setFontSize(9);
      [d.toName,d.toAddress,d.toEmail,d.toPhone].forEach(function(l){if(l){doc.text(l,20,y);y+=4;}});y+=6;
      y=pdfItems(doc,d,20,y,175);y=pdfTotals(doc,d,130,y);
      doc.setFont('helvetica','normal');doc.setFontSize(9);y=pdfFooter(doc,d,y);
      if(d.fromVat||d.fromReg){
        doc.setDrawColor(245,158,11);doc.setLineWidth(0.5);doc.line(20,y+2,195,y+2);y+=8;
        doc.setFontSize(7);doc.setTextColor(100);
        if(d.fromVat)doc.text(t.vatNum+': '+d.fromVat,20,y);
        if(d.fromReg)doc.text(t.regNum+': '+d.fromReg,d.fromVat?100:20,y);
      }
      return doc;
    }

    // ============================================================
    // TEMPLATE 5 — Bold (colored header + geometric accent)
    // ============================================================
    function renderBoldPDF(d){
      var doc=new(window.jspdf.jsPDF);var t=d.t;
      doc.setFillColor(79,127,255);doc.rect(0,0,210,28,'F');
      doc.setFillColor(255,255,255);doc.setGState(new doc.GState({opacity:0.15}));doc.rect(160,0,50,28,'F');doc.setGState(new doc.GState({opacity:1}));
      doc.setTextColor(255);doc.setFontSize(16);doc.setFont('helvetica','bold');doc.text(d.fromName||t.invoice,20,14);
      doc.setFontSize(10);doc.setFont('helvetica','normal');doc.text(t.invoice+' #'+d.invNum,20,22);
      if(d.logo){try{doc.addImage(d.logo,'PNG',150,4,40,18);}catch(e){}}
      doc.setTextColor(0);var y=38;
      doc.setFontSize(9);doc.setTextColor(100);doc.text(t.date+': '+d.invDate+'   '+t.due+': '+d.invDue,20,y);y+=8;
      doc.setTextColor(0);doc.setFont('helvetica','bold');doc.setFontSize(10);
      doc.text(t.from,20,y);doc.text(t.to,110,y);y+=5;doc.setFont('helvetica','normal');doc.setFontSize(9);
      [d.fromName,d.fromAddress,d.fromEmail,d.fromPhone].forEach(function(l,i){doc.text(l||'',20,y);doc.text([d.toName,d.toAddress,d.toEmail,d.toPhone][i]||'',110,y);y+=4;});
      if(d.fromVat){doc.setFontSize(7);doc.setTextColor(100);doc.text(t.vatNum+': '+d.fromVat,20,y);y+=3;doc.setFontSize(9);doc.setTextColor(0);}
      y+=6;
      doc.setFillColor(79,127,255);doc.rect(18,y-12,2,60,'F');
      doc.setFillColor(248,250,252);
      var altY=y;
      doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(0);
      doc.text(t.desc,22,y);doc.text(t.qty,120,y);doc.text(t.rate,145,y);doc.text(t.amt,175,y);y+=2;
      doc.setDrawColor(79,127,255);doc.setLineWidth(0.5);doc.line(22,y,195,y);y+=6;
      doc.setFont('helvetica','normal');
      d.items.forEach(function(it,idx){if(idx%2===0){doc.setFillColor(248,250,252);doc.rect(22,y-4,173,7,'F');}doc.text((it.desc||'').substring(0,45),22,y);doc.text(it.qty,122,y);doc.text(d.cur+it.rate,145,y);doc.text(d.cur+it.amt,175,y);y+=7;if(y>260){doc.addPage();y=20;}});
      y+=4;
      doc.setFillColor(239,246,255);doc.rect(125,y-2,70,d.hasTax2?32:26,'F');
      doc.setFont('helvetica','normal');doc.setFontSize(9);
      doc.text(t.sub+':',130,y+4);doc.text(d.sub,188,y+4,{align:'right'});
      doc.text(d.tax1Label+':',130,y+10);doc.text(d.tax1Amt,188,y+10,{align:'right'});
      var off=16;if(d.hasTax2){doc.text(d.tax2Label+':',130,y+off);doc.text(d.tax2Amt,188,y+off,{align:'right'});off+=6;}
      doc.setFont('helvetica','bold');doc.setFontSize(11);doc.text(t.total+':',130,y+off);doc.text(d.total,188,y+off,{align:'right'});
      y+=off+14;doc.setFont('helvetica','normal');doc.setFontSize(9);y=pdfFooter(doc,d,y);
      return doc;
    }

    // === Download PDF — dispatch to selected template ===
    var renderers={classic:renderClassicPDF,modern:renderModernPDF,minimal:renderMinimalPDF,executive:renderExecutivePDF,bold:renderBoldPDF};
    document.getElementById('downloadPdf').addEventListener('click',function(){
      var d=getData();
      var doc=(renderers[selectedTemplate]||renderClassicPDF)(d);
      var fname=d.lang==='fr'?'facture-':'invoice-';
      doc.save(fname+d.invNum+'.pdf');
    });
  })();
  </script>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9434634079795273" crossorigin="anonymous"></script>
  <script>try{(adsbygoogle=window.adsbygoogle||[]).push({});(adsbygoogle=window.adsbygoogle||[]).push({});}catch(e){}</script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {"@type": "Question", "name": "Is the invoice generator completely free?", "acceptedAnswer": {"@type": "Answer", "text": "Yes. The AAWebTools invoice generator is 100% free with no hidden costs, no watermarks, and no limits on the number of invoices you can create. There is no signup or account required."}},
      {"@type": "Question", "name": "Can I add my company logo to the invoice?", "acceptedAnswer": {"@type": "Answer", "text": "Yes. Upload any PNG, JPG, or SVG file using the logo upload field. Your logo will appear in the header of the generated PDF. The image is processed entirely in your browser and never uploaded to any server."}},
      {"@type": "Question", "name": "What tax rates are supported?", "acceptedAnswer": {"@type": "Answer", "text": "Any tax rate you need. Add multiple tax lines with custom labels (GST, HST, VAT, PST, state tax) and set the percentage for each. The tool calculates each tax line independently against the subtotal, so it works for any country or jurisdiction."}},
      {"@type": "Question", "name": "Can I create invoices in French?", "acceptedAnswer": {"@type": "Answer", "text": "Yes. Click the language toggle to switch to French. All form labels, placeholders, and the PDF output will render in French with proper terminology. The currency defaults to EUR in French mode, supporting both Canadian French and European French invoicing."}},
      {"@type": "Question", "name": "Are my invoices stored on your servers?", "acceptedAnswer": {"@type": "Answer", "text": "No. The entire invoice generation process runs locally in your browser. Your business details, client information, and line items never leave your device. The PDF is generated client-side and downloaded directly to your computer."}}
    ]
  }
  </script>
</body>
</html>

```

## Verification command

After pasting the translated HTML into `frontend/fr/generateur-facture/index.html`, run:

```bash
node tools/translate/build.js 2>&1 | grep -A 6 "FAIL fr/invoice-generator$" || echo "PASS — page validates"
```

If it says PASS, run the lift-noindex command to mark this page as ready:

```bash
node tools/translate/quarantine.js --lift  # idempotent, only lifts pages that pass
```

Then commit:

```bash
git add frontend/fr/generateur-facture/index.html
git commit -m "Regenerate fr/invoice-generator (passes validator)"
```

The pre-commit hook will re-run the validator before allowing the commit.
