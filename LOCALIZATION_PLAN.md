# Content Localization Plan -- aawebtools.com
**Version:** 1.0
**Date:** March 29, 2026
**Status:** Planning -- ready for implementation review
**Scope:** Expand from 2 languages (EN, FR) to 8 languages via AI translation

---

## Table of Contents

1. [Current State Audit](#1-current-state-audit)
2. [What to Translate vs. What to Localize](#2-what-to-translate-vs-what-to-localize)
3. [Content Structure for Translation](#3-content-structure-for-translation)
4. [Translation Quality Standards](#4-translation-quality-standards)
5. [Country-Specific Content](#5-country-specific-content)
6. [Blog Content Strategy](#6-blog-content-strategy)
7. [SEO Meta Translation](#7-seo-meta-translation)
8. [Quality Review Workflow](#8-quality-review-workflow)
9. [Glossary and Terminology Database](#9-glossary-and-terminology-database)
10. [URL Structure and Routing](#10-url-structure-and-routing)
11. [Technical Implementation Sequence](#11-technical-implementation-sequence)
12. [Risk Register](#12-risk-register)

---

## Target Languages

| Code  | Language   | Script | Direction | Locale Examples     | Priority |
|-------|-----------|--------|-----------|---------------------|----------|
| `en`  | English    | Latin  | LTR       | en-US, en-CA, en-GB | Existing |
| `fr`  | French     | Latin  | LTR       | fr-FR, fr-CA        | Existing |
| `es`  | Spanish    | Latin  | LTR       | es-ES, es-MX, es-AR | High     |
| `pt`  | Portuguese | Latin  | LTR       | pt-BR, pt-PT        | High     |
| `de`  | German     | Latin  | LTR       | de-DE, de-AT        | Medium   |
| `hi`  | Hindi      | Devanagari | LTR  | hi-IN               | Medium   |
| `ar`  | Arabic     | Arabic | **RTL**   | ar-SA, ar-EG        | Medium   |
| `ja`  | Japanese   | CJK    | LTR*      | ja-JP               | Medium   |

*Japanese web content is rendered LTR horizontally, but requires special typography handling.

---

## 1. Current State Audit

### What exists today

**Two localization approaches are in use simultaneously -- this is a problem.**

**Approach A: Inline data attributes (tool pages on EN URLs)**
Tool pages like `/tiktok-downloader/` use `data-en` and `data-fr` attributes on HTML elements. The JavaScript in `core.js` reads `localStorage('lang')` and swaps visible text client-side. The `<html lang>` attribute is overwritten by JS.

Strengths: Simple, one HTML file per tool.
Weaknesses: Search engines only see the default English text. French content on `/tiktok-downloader/` is invisible to Google. Not scalable beyond 2 languages -- adding `data-es`, `data-pt`, `data-de`, `data-hi`, `data-ar`, `data-ja` to every element makes the HTML unreadable. Client-side language switching does not produce crawlable translated pages.

**Approach B: Separate `/fr/` directory (French-specific pages)**
French tool pages (`/fr/telechargeur-tiktok/`, `/fr/generateur-facture/`, etc.) and French blog posts (`/fr/blog/...`) exist as fully independent HTML files with `<html lang="fr">`, French meta tags, French hreflang, and French schema markup. These are properly crawlable.

Strengths: Correct SEO. Each page is a distinct URL with proper hreflang. Google indexes French content independently.
Weaknesses: Every change to the English page must be manually replicated in the French version. Content drift is inevitable.

### Existing page inventory

| Category | EN Pages | FR Pages | Notes |
|----------|----------|----------|-------|
| Homepage | 1 | 1 | Separate files |
| Tool pages | 7 | 7 | FR pages in `/fr/` directory |
| Blog posts | 6 | 4 | Not all EN posts have FR equivalents |
| Blog index | 1 | 1 | Separate files |
| Static pages | 4 (about, contact, privacy, terms) | 0 | EN only, no FR versions |
| Country pages | 5 (CA, US, UK, AU, FR) | 0 | EN only |
| **Total** | **24** | **13** | |

### Architecture decision: Approach B is the only viable path forward

The inline `data-*` attribute approach (Approach A) must be abandoned for multilingual expansion. Reasons:

1. Google cannot index client-side swapped text effectively
2. 8 data attributes per element creates unmaintainable HTML
3. hreflang tags cannot point to the same URL for different languages
4. RTL support (Arabic) requires page-level `dir="rtl"` and different CSS, impossible with JS toggles
5. Japanese and Hindi require different font stacks loaded at page level

**Recommendation:** Adopt the `/fr/` directory model for all languages. Each language gets its own URL prefix, its own HTML files, and its own hreflang cross-references. Remove `data-en`/`data-fr` attributes from tool pages once dedicated language directories exist.

---

## 2. What to Translate vs. What to Localize

"Translation" means converting text from English to another language. "Localization" goes further -- adapting content to cultural context, legal requirements, local conventions, and market expectations. Some content needs translation. Some needs localization. Some needs neither.

### 2.1 Content that needs TRANSLATION

These items can be translated directly by the Claude API with high confidence:

| Content Type | Examples | Volume per Language |
|---|---|---|
| Tool interface labels | "Download Video", "Paste TikTok video link here..." | ~40 strings per tool page |
| Section headings | "How It Works", "Frequently Asked Questions" | ~15 per tool page |
| Navigation items | "Downloaders", "Generators", "AI Tools", "All Tools" | ~20 strings (shared) |
| Footer text | "Free tools for everyone, worldwide" | ~10 strings (shared) |
| FAQ questions and answers | 5 per tool page | ~35 FAQs total |
| HowTo step text | 3 steps per tool | ~21 steps total |
| Blog post body content | Full articles | 6 EN articles |
| Error messages | "Something went wrong", "We're fixing this." | ~8 strings |
| 404 page | Title, description, tool cards | ~10 strings |

### 2.2 Content that needs LOCALIZATION (not just translation)

| Content Type | Why Localization, Not Translation | Example |
|---|---|---|
| Meta titles | Must include local search keywords, not literal translations | EN: "TikTok Video Downloader" / ES: "Descargar Videos de TikTok" (verb-first, matching search intent in Spanish) |
| Meta descriptions | Must match local search behavior and character limits | Rewrite to include local keyword variations |
| Pay stub terminology | "Pay stub" is a North American term with no universal equivalent | See terminology table in Section 9 |
| Date formats | US uses MM/DD/YYYY, Europe uses DD/MM/YYYY, Japan uses YYYY/MM/DD | Must be locale-aware in tool output |
| Currency symbols | Invoice generator defaults, pay stub defaults | USD for US, EUR for FR/DE, BRL for PT-BR, JPY for JA |
| Number formats | Decimal separators differ: US=1,000.50 / DE=1.000,50 / FR=1 000,50 | All number displays in tools |
| Legal pages (privacy, terms) | GDPR for EU, LGPD for Brazil, APPI for Japan | See Section 2.4 |
| Cultural references in blogs | "Turnitin" is US/UK-centric; "apartment application" is North American | Adapt or omit per market |
| Schema markup | FAQ answers, HowTo steps must be in the page language | Full translation required for structured data |

### 2.3 Content that must NEVER be translated

| Item | Reason |
|---|---|
| Brand name: "AAWebTools" | Proper noun, consistent globally |
| Brand name: "ScopeCove" | Parent company, proper noun |
| Person name: "Karim Narimi" | Proper noun |
| URL slugs once published | Changing URLs breaks links and SEO equity |
| Code snippets in blog posts | Technical accuracy |
| Product names: "TikTok", "Twitter", "ChatGPT", "Turnitin", "GPTZero" | Proper nouns, trademarked |
| CSS class names, HTML attributes | Technical, not user-facing |
| Analytics IDs, API endpoints | Technical infrastructure |
| Email addresses | Universal format |
| Image filenames and paths | Technical, not user-facing |
| JSON-LD `@type` and `@context` values | Schema.org vocabulary is English-only |
| The word "Blog" in navigation | Universally understood loan word (except potentially Arabic/Japanese -- see Section 9) |

### 2.4 Legal pages: Privacy Policy and Terms of Service

Legal page localization carries real risk. A poorly translated privacy policy can create legal liability.

**Recommended approach per jurisdiction:**

| Language | Legal Requirement | Action |
|---|---|---|
| English | Baseline CCPA/general compliance | Keep as-is (source of truth) |
| French | Quebec Bill 96 (French required for Quebec consumers), GDPR for France | Translate + add GDPR-specific section for EU visitors |
| Spanish | LOPD (Spain), varies by Latin American country | Translate EN privacy policy + add note: "This policy is provided in Spanish for convenience. The English version governs." |
| Portuguese | LGPD (Brazil, effective since 2020) | Translate + add LGPD-specific data subject rights section |
| German | GDPR (strict enforcement in Germany) + Impressum requirement | Translate + add Impressum section + explicit GDPR consent language |
| Hindi | India DPDP Act 2023 | Translate + add note about Indian data protection rights |
| Arabic | Varies widely by country, no unified framework | Translate + add general disclaimer that English version controls |
| Japanese | APPI (Act on Protection of Personal Information) | Translate + add APPI-specific section |

**Critical rule:** Every translated legal page must include a header stating:

> "This [Privacy Policy / Terms of Service] has been translated for your convenience. In case of any discrepancy between translations, the English version at [link] shall prevail."

This protects against translation errors creating unintended legal obligations.

---

## 3. Content Structure for Translation

### 3.1 Proposed directory structure

Abandon the current hybrid approach. Every language gets a top-level directory:

```
frontend/
  index.html                          (EN homepage)
  tiktok-downloader/index.html        (EN tool)
  blog/article-slug/index.html        (EN blog)
  ...
  fr/
    index.html                        (FR homepage)
    telechargeur-tiktok/index.html    (FR tool)
    blog/slug-fr/index.html           (FR blog)
  es/
    index.html                        (ES homepage)
    descargador-tiktok/index.html     (ES tool)
    blog/slug-es/index.html           (ES blog)
  pt/
    index.html
    baixar-tiktok/index.html
    blog/slug-pt/index.html
  de/
    index.html
    tiktok-downloader/index.html      (keep English slug -- see 3.2)
    blog/slug-de/index.html
  hi/
    index.html
    tiktok-downloader/index.html      (English slug -- Devanagari slugs are impractical)
    blog/slug-hi/index.html
  ar/
    index.html
    tiktok-downloader/index.html
    blog/slug-ar/index.html
  ja/
    index.html
    tiktok-downloader/index.html
    blog/slug-ja/index.html
```

### 3.2 URL slug strategy

| Language | Approach | Rationale |
|---|---|---|
| French | Localized slugs (`/fr/telechargeur-tiktok/`) | Already exists, FR users search in French |
| Spanish | Localized slugs (`/es/descargador-tiktok/`) | Spanish speakers search in Spanish |
| Portuguese | Localized slugs (`/pt/baixar-tiktok/`) | Brazilian users search in Portuguese |
| German | English slugs (`/de/tiktok-downloader/`) | Germans commonly search tech terms in English |
| Hindi | English slugs (`/hi/tiktok-downloader/`) | Devanagari URLs are poorly supported; Indian users search in English |
| Arabic | English slugs (`/ar/tiktok-downloader/`) | Arabic URLs have encoding issues; users search in English or transliterated |
| Japanese | English slugs (`/ja/tiktok-downloader/`) | Japanese users commonly search English tool names |

### 3.3 Translatable string organization

Create a single source of truth for all UI strings. This replaces the inline `data-en`/`data-fr` attributes.

**File:** `frontend/locales/{lang}/ui.json`

```json
{
  "_meta": {
    "language": "es",
    "locale": "es-ES",
    "direction": "ltr",
    "last_updated": "2026-03-29",
    "translator": "claude-api",
    "reviewer": "pending"
  },

  "nav": {
    "downloaders": "Descargadores",
    "generators": "Generadores",
    "ai_tools": "Herramientas IA",
    "blog": "Blog",
    "all_tools": "Todas las herramientas"
  },

  "tools": {
    "tiktok": {
      "label": "DESCARGADOR DE TIKTOK",
      "title": "Descargador de Videos TikTok -- Sin Marca de Agua",
      "subtitle": "Pega cualquier enlace de TikTok -- video, foto, presentacion o foto de perfil. Gratis, calidad HD, sin marca de agua.",
      "last_updated": "Ultima actualizacion: Marzo 2026",
      "tabs": {
        "video": "Video",
        "photo": "Foto / Presentacion",
        "profile": "Foto de Perfil"
      },
      "inputs": {
        "video_placeholder": "Pega el enlace del video de TikTok aqui...",
        "photo_placeholder": "Pega el enlace de foto/presentacion de TikTok aqui...",
        "profile_placeholder": "Ingresa el nombre de usuario de TikTok (ej. @usuario)"
      },
      "buttons": {
        "download_video": "Descargar Video",
        "download_photos": "Descargar Fotos",
        "download_profile": "Descargar Foto de Perfil"
      },
      "states": {
        "loading": "Procesando tu solicitud...",
        "error_title": "Algo salio mal",
        "error_text": "Estamos arreglando esto. Vuelve en 2 horas.",
        "error_cta": "Probar Otra Herramienta"
      }
    }
  },

  "common": {
    "how_it_works": "COMO FUNCIONA",
    "faq": "PREGUNTAS FRECUENTES",
    "faq_long": "Preguntas Frecuentes",
    "more_tools": "MAS HERRAMIENTAS",
    "you_might_need": "Tambien podrias necesitar",
    "use_tool": "Usar Herramienta",
    "read_more": "Leer mas",
    "free": "Gratis",
    "no_signup": "Sin registro"
  },

  "footer": {
    "tagline": "Herramientas gratuitas para todos, en todo el mundo",
    "tools_heading": "Herramientas",
    "company_heading": "Empresa",
    "copyright": "2026 AAWebTools. Todos los derechos reservados. Creado por"
  },

  "plurals": {
    "files": {
      "one": "{{count}} archivo",
      "other": "{{count}} archivos"
    },
    "images": {
      "one": "{{count}} imagen",
      "other": "{{count}} imagenes"
    },
    "photos": {
      "one": "{{count}} foto",
      "other": "{{count}} fotos"
    }
  },

  "formats": {
    "date": "DD/MM/YYYY",
    "date_long": "D de MMMM de YYYY",
    "number_decimal": ",",
    "number_thousands": ".",
    "currency_symbol": "$",
    "currency_code": "USD",
    "currency_position": "before"
  }
}
```

### 3.4 Pluralization rules per language

Pluralization is one of the most common AI translation failures. Different languages have different plural categories.

| Language | Plural Forms | Rules |
|---|---|---|
| English | 2 (one, other) | 1 = one, everything else = other |
| French | 2 (one, other) | 0 and 1 = one, 2+ = other |
| Spanish | 2 (one, other) | 1 = one, everything else = other |
| Portuguese | 2 (one, other) | 0 and 1 = one, 2+ = other |
| German | 2 (one, other) | 1 = one, everything else = other |
| Hindi | 2 (one, other) | 0 and 1 = one, 2+ = other |
| Arabic | **6** (zero, one, two, few, many, other) | 0 = zero, 1 = one, 2 = two, 3-10 = few, 11-99 = many, 100+ = other |
| Japanese | **1** (other) | No plural forms -- all numbers use the same word |

**Arabic pluralization example -- "files":**

```json
{
  "files": {
    "zero": "لا ملفات",
    "one": "ملف واحد",
    "two": "ملفان",
    "few": "{{count}} ملفات",
    "many": "{{count}} ملفًا",
    "other": "{{count}} ملف"
  }
}
```

**Japanese pluralization example -- "files":**

```json
{
  "files": {
    "other": "{{count}}ファイル"
  }
}
```

### 3.5 Date, number, and currency formatting

Use the `Intl` API in JavaScript rather than custom formatting. The locale JSON provides the defaults, but the runtime formatting should use the browser's built-in `Intl.NumberFormat` and `Intl.DateTimeFormat`.

```javascript
// Number formatting example
new Intl.NumberFormat('de-DE').format(1234.56)   // "1.234,56"
new Intl.NumberFormat('ja-JP').format(1234.56)   // "1,234.56"
new Intl.NumberFormat('ar-SA').format(1234.56)   // "١٬٢٣٤٫٥٦"
new Intl.NumberFormat('hi-IN').format(1234.56)   // "1,234.56"

// Currency formatting example
new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(1234.56)
// "$1,234.56"

new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(1234.56)
// "R$ 1.234,56"

new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(1234)
// "￥1,234"

// Date formatting example
new Intl.DateTimeFormat('ar-SA', { dateStyle: 'long' }).format(new Date())
// "٢٩ مارس ٢٠٢٦"
```

---

## 4. Translation Quality Standards

### 4.1 Where AI translation is "good enough" without human review

| Content Type | Confidence | Reason |
|---|---|---|
| UI labels and buttons | High | Short, unambiguous, context-clear strings |
| Error messages | High | Simple, imperative sentences |
| FAQ questions (the questions themselves) | High | Interrogative patterns are straightforward |
| HowTo step titles | High | Short imperative phrases |
| Navigation labels | High | Single words or short noun phrases |
| Footer text | High | Standard boilerplate |

### 4.2 Where AI translation needs human review

| Content Type | Risk | Specific Concerns |
|---|---|---|
| FAQ answers (full paragraphs) | Medium | Nuanced claims, accuracy of technical details |
| Blog post body text | Medium-High | Tone, cultural references, keyword accuracy |
| Meta titles and descriptions | Medium | SEO keyword accuracy, character limits |
| Legal pages | **High** | Legal liability from mistranslation |
| Pay stub / invoice field labels | Medium | Country-specific terminology (see Section 9) |
| Schema markup text | Medium | Must match visible page content exactly |

### 4.3 Common AI translation pitfalls by language

#### Spanish: Formal vs. informal "you" (tu/usted)

Spanish has two forms of "you" -- `tu` (informal) and `usted` (formal). This affects verb conjugation throughout.

**Decision for aawebtools.com: Use `tu` (informal).**

Rationale: The site's tone is casual ("Free tools for everyone", "Paste the link and download"). Tech tool sites targeting younger audiences use `tu` universally in Latin America and increasingly in Spain.

| English | Spanish (tu) | Spanish (usted) -- DO NOT USE |
|---|---|---|
| "Paste your link here" | "Pega tu enlace aqui" | "Pegue su enlace aqui" |
| "Download your video" | "Descarga tu video" | "Descargue su video" |
| "Try another tool" | "Prueba otra herramienta" | "Pruebe otra herramienta" |

**Pitfall alert:** Claude API may inconsistently switch between `tu` and `usted` within the same page. The translation prompt must explicitly specify: "Use informal `tu` form throughout. Never use `usted`."

#### German: Formal vs. informal "you" (du/Sie)

German has the same distinction. `du` is informal, `Sie` is formal (always capitalized).

**Decision for aawebtools.com: Use `du` (informal).**

Rationale: Same as Spanish -- casual tech tool site. Companies like Google, Spotify, and IKEA Germany all use `du` in their interfaces.

| English | German (du) | German (Sie) -- DO NOT USE |
|---|---|---|
| "Paste your link here" | "Fuge deinen Link hier ein" | "Fugen Sie Ihren Link hier ein" |
| "Download your video" | "Lade dein Video herunter" | "Laden Sie Ihr Video herunter" |

#### French: Formal vs. informal (already established)

The existing French translations use `vous` (formal). **Keep `vous`** for consistency with existing content.

#### Arabic: Script direction and text mixing

Arabic is RTL (right-to-left), but the site contains many LTR elements:
- Brand names ("AAWebTools", "TikTok")
- URLs
- Numbers
- Code snippets

**Required:** Use `dir="rtl"` on `<html>` for Arabic pages, with `dir="ltr"` overrides on specific elements containing English text, URLs, or numbers. The CSS must support RTL layout (flexbox `direction`, margin/padding flipping).

Example of mixed-direction content:

```html
<html lang="ar" dir="rtl">
  ...
  <h1>تحميل فيديوهات <bdi dir="ltr">TikTok</bdi> -- بدون علامة مائية</h1>
  <input type="url" dir="ltr" placeholder="...الصق رابط فيديو TikTok هنا">
```

**Pitfall alert:** URL input fields must remain LTR even on RTL pages. A user pasting `https://tiktok.com/...` into an RTL input field will see the text reversed and become confused.

#### Japanese: Politeness levels and length

Japanese has multiple politeness levels. Use `desu/masu` form (polite but not overly formal).

| English | Japanese (desu/masu) | Notes |
|---|---|---|
| "Download Video" | "動画をダウンロード" | Omit verb ending for button labels (noun-style) |
| "Paste TikTok video link here" | "TikTok動画のリンクをここに貼り付けてください" | Use "kudasai" for instructions |
| "Something went wrong" | "エラーが発生しました" | Standard error phrasing |
| "100% free, forever" | "完全無料、永久に" | Keep it concise |

**Pitfall alert:** Japanese text is typically 30-50% shorter than English in character count but may appear wider due to full-width characters. Button labels need width testing.

#### Hindi: Script rendering and English loanwords

Hindi uses Devanagari script. Many tech terms are used in English even by Hindi speakers ("download", "video", "link"). Attempting to translate these into pure Hindi sounds unnatural.

| English | Natural Hindi | Overly Pure Hindi -- DO NOT USE |
|---|---|---|
| "Download Video" | "वीडियो डाउनलोड करें" | "चलचित्र अधोभारण करें" |
| "Paste link here" | "लिंक यहाँ पेस्ट करें" | "कड़ी यहाँ चिपकाएँ" |
| "Profile Picture" | "प्रोफ़ाइल फ़ोटो" | "व्यक्तिचित्र छायाचित्र" |

**Pitfall alert:** AI translation may produce overly formal or Sanskritized Hindi that sounds alien to everyday users. The translation prompt must specify: "Use conversational Hindi as spoken by internet users. Keep English loanwords for tech terms like download, video, link, profile."

### 4.4 Character limit concerns

| Element | EN Max Length | Concern |
|---|---|---|
| Title tag | 60 chars | German translations are typically 30% longer than English |
| Meta description | 155 chars | Must convey the same info in fewer/more characters |
| Button text | ~20 chars | German compound words can overflow buttons |
| Tab labels | ~15 chars | Japanese full-width characters take 2x width |

**German title example problem:**

```
EN:  "TikTok Video Downloader -- No Watermark, Free & Fast"  (53 chars)
DE:  "TikTok-Video-Herunterlader -- Ohne Wasserzeichen, Kostenlos & Schnell"  (70 chars -- TRUNCATED in search results)
```

**Solution:** German (and other verbose languages) meta titles must be rewritten, not literally translated, to fit character limits.

---

## 5. Country-Specific Content

### 5.1 Pay stub generator: country expansion plan

The pay stub generator currently has 5 country pages. Each country page includes country-specific:
- Tax calculation rules (CPP/EI for Canada, FICA for USA, NI for UK, etc.)
- Deduction labels and terminology
- FAQ content about local payroll law
- Schema markup with local FAQ answers

**Expansion recommendation:**

| Country | Language(s) | Priority | Rationale |
|---|---|---|---|
| Canada | EN + FR | Existing | Already live. FR version needs to be created (currently EN only) |
| USA | EN + ES | Existing EN, add ES | ~42 million Spanish speakers in the US |
| UK | EN | Existing | No additional languages needed |
| Australia | EN | Existing | No additional languages needed |
| France | FR | Existing | Already live |
| Brazil | PT | **New -- High Priority** | Largest Portuguese-speaking market, "holerite" or "contracheque" is heavily searched |
| Germany | DE | **New -- Medium Priority** | "Gehaltsabrechnung" generator is a viable keyword |
| India | EN + HI | **New -- Medium Priority** | "Salary slip" is the local term; English is primary language for business tools in India |
| Japan | JA | **New -- Low Priority** | Japanese payroll is highly regulated; a generic tool may not be useful without integration with Japanese tax rates (national + municipal income tax, social insurance) |
| Spain | ES | **New -- Low Priority** | "Nomina" generator; Spain has strict payroll formatting requirements |
| Mexico | ES | **New -- Low Priority** | "Recibo de nomina" with SAT CFDI compliance requirements |

**Important:** For Brazil, Germany, and India -- these pages require **original research and localized content**, not translation of the existing US/Canada pages. Each country's payroll system is fundamentally different:

| Country | "Pay Stub" Term | Key Deductions | Currency |
|---|---|---|---|
| Canada (EN) | Pay stub | CPP, EI, Federal tax, Provincial tax | CAD |
| Canada (FR) | Bulletin de paie | RPC, AE, Impot federal, Impot provincial | CAD |
| USA | Pay stub | Federal tax, State tax, FICA (SS + Medicare) | USD |
| UK | Payslip | Income tax (PAYE), National Insurance, Student loan | GBP |
| Australia | Pay slip | PAYG tax, Superannuation | AUD |
| France | Bulletin de paie | CSG, CRDS, Cotisations sociales | EUR |
| **Brazil** | **Holerite / Contracheque** | **INSS, IRRF, FGTS, Vale-transporte** | **BRL** |
| **Germany** | **Gehaltsabrechnung / Lohnabrechnung** | **Lohnsteuer, Solidaritatszuschlag, Kirchensteuer, Sozialversicherung** | **EUR** |
| **India** | **Salary slip** | **EPF, ESI, Professional tax, TDS (Income tax)** | **INR** |
| **Japan** | **給与明細 (Kyuyo meisai)** | **Shotokuzei (income tax), Jumin-zei (resident tax), Shakai hoken (social insurance)** | **JPY** |

### 5.2 Country page language matrix

This table shows which language versions each country page needs:

| Country Page | EN | FR | ES | PT | DE | HI | AR | JA |
|---|---|---|---|---|---|---|---|---|
| `/pay-stub-generator/canada/` | Yes | **Yes (needed)** | -- | -- | -- | -- | -- | -- |
| `/pay-stub-generator/usa/` | Yes | -- | **Yes (needed)** | -- | -- | -- | -- | -- |
| `/pay-stub-generator/uk/` | Yes | -- | -- | -- | -- | -- | -- | -- |
| `/pay-stub-generator/australia/` | Yes | -- | -- | -- | -- | -- | -- | -- |
| `/pay-stub-generator/france/` | -- | Yes | -- | -- | -- | -- | -- | -- |
| `/pay-stub-generator/brazil/` | -- | -- | -- | **Yes (new)** | -- | -- | -- | -- |
| `/pay-stub-generator/germany/` | -- | -- | -- | -- | **Yes (new)** | -- | -- | -- |
| `/pay-stub-generator/india/` | **Yes (new)** | -- | -- | -- | -- | **Yes (new)** | -- | -- |

Note: India's page is primarily EN because Indian business users predominantly search in English, but a Hindi version would capture additional traffic.

---

## 6. Blog Content Strategy

### 6.1 Should all 10 blog posts be translated to all 8 languages?

**No.** Translating every post to every language wastes effort and creates thin content in markets where the topic is irrelevant.

### 6.2 Blog post relevance matrix

| Blog Post (EN) | ES | PT | DE | HI | AR | JA | Reasoning |
|---|---|---|---|---|---|---|---|
| **TikTok slideshows download 2026** | Yes | Yes | Yes | Yes | Yes | Yes | TikTok is global; universal relevance |
| **AI humanizers vs Turnitin 2026** | Yes | Yes | Yes | Partial | Partial | Partial | Turnitin is used in US/UK/AU/CA/EU. Less relevant in India (different plagiarism tools), Middle East, Japan |
| **Best free AI content detectors 2026** | Yes | Yes | Yes | Yes | Yes | Yes | AI detection is a global concern |
| **Can teachers detect ChatGPT 2026** | Yes | Yes | Yes | Yes | Partial | Yes | Relevant globally but "teachers" context varies; Arabic-speaking markets may need different framing |
| **Compress image to 100KB free** | Yes | Yes | Yes | Yes | Yes | Yes | Universal utility topic |
| **Pay stub generator self-employed** | Partial | Partial | Partial | Partial | No | No | Heavily US/Canada-centric. For ES/PT/DE, would need to be rewritten, not translated, with local freelance/tax context |

**"Partial" means:** Translate the universal parts, but rewrite sections that reference country-specific concepts. For example, the pay stub blog post references "apartment applications" and "loan approvals" -- these contexts exist globally but the specific process differs.

### 6.3 Recommended blog translation priority

**Phase 1 -- Translate to ES, PT, DE (highest ROI):**
1. TikTok slideshows download 2026 (universal)
2. Best free AI content detectors 2026 (universal)
3. Compress image to 100KB free (universal)
4. Can teachers detect ChatGPT 2026 (universal)

**Phase 2 -- Translate to HI, AR, JA:**
1. TikTok slideshows download 2026
2. Best free AI content detectors 2026
3. Compress image to 100KB free

**Phase 3 -- Create original localized blog content (not translations):**
- ES: "Generador de recibos de nomina para autonomos en Espana/Mexico"
- PT-BR: "Como gerar holerite para MEI (Microempreendedor Individual)"
- DE: "Gehaltsabrechnung erstellen: Was muss drauf?"
- HI: "फ्रीलांसर्स के लिए सैलरी स्लिप कैसे बनाएं"

### 6.4 Handling culture-specific references

| Reference | Problem | Resolution |
|---|---|---|
| "Turnitin" | Primary plagiarism tool in US/UK/AU/CA. Less known in Latin America, Middle East, Japan | ES/PT/DE: Keep Turnitin mention + add local equivalents (e.g., Compilatio in France, CopySpider in Brazil). AR/JA: Replace with "plagiarism detection tools" generically + mention Turnitin as one example |
| "Apartment application" | Concept of submitting pay stubs for apartment rental is primarily North American | ES/PT: Replace with equivalent local scenario (landlord reference, rental contract). DE: "Mietbewerbung" (rental application) -- same concept exists. AR/JA: Omit or generalize to "proof of income for contracts" |
| "Self-employed" / "1099 contractor" | US-specific tax classification | ES: "autonomo" / "trabajador independiente". PT-BR: "MEI" / "profissional autonomo". DE: "Freiberufler" / "Selbststandiger". Each carries different legal meaning |
| "IRS" / "CRA" | US/Canadian tax authorities | Replace with local authority in each translation (SAT in Mexico, Receita Federal in Brazil, Finanzamt in Germany) |

---

## 7. SEO Meta Translation

### 7.1 Title tags: Rewrite, do not translate

Title tags must be rewritten for each language to match local search intent. Literal translations produce poor-ranking titles.

**Example: TikTok Downloader page**

| Language | Title Tag | Chars | Notes |
|---|---|---|---|
| EN | `TikTok Video Downloader -- No Watermark, Free & Fast \| AAWebTools` | 63 | Current |
| ES | `Descargar Videos de TikTok Sin Marca de Agua -- Gratis \| AAWebTools` | 67 | "Descargar" (verb) matches Spanish search patterns better than noun form |
| PT | `Baixar Videos do TikTok Sem Marca d'Agua -- Gratis \| AAWebTools` | 63 | "Baixar" is the standard Brazilian Portuguese term |
| DE | `TikTok Videos Herunterladen Ohne Wasserzeichen -- Kostenlos \| AAWebTools` | 70 | At the limit; may need to drop "Kostenlos" |
| HI | `TikTok वीडियो डाउनलोड करें बिना वॉटरमार्क -- मुफ्त \| AAWebTools` | Mixed | Hindi/English mix is natural for this audience |
| AR | `تحميل فيديوهات تيك توك بدون علامة مائية -- مجاني \| AAWebTools` | 58 (Arabic chars) | Arabic chars are narrower; more room |
| JA | `TikTok動画ダウンロード -- 透かしなし・無料 \| AAWebTools` | 38 | Japanese is naturally more concise |

### 7.2 Meta descriptions: Localize with local keywords

| Language | Meta Description |
|---|---|
| EN | "Download TikTok videos without watermark in HD quality. Free, no login, works on iPhone, Android & PC. Paste the link and download instantly." |
| ES | "Descarga videos de TikTok sin marca de agua en calidad HD. Gratis, sin registro. Funciona en iPhone, Android y PC. Pega el enlace y descarga al instante." |
| PT | "Baixe videos do TikTok sem marca d'agua em qualidade HD. Gratis, sem cadastro. Funciona no iPhone, Android e PC. Cole o link e baixe na hora." |
| AR | "حمّل فيديوهات تيك توك بدون علامة مائية بجودة عالية. مجاني، بدون تسجيل. يعمل على آيفون وأندرويد والكمبيوتر." |
| JA | "TikTok動画をウォーターマークなしでHD画質ダウンロード。無料・登録不要。iPhone、Android、PCで利用可能。" |

### 7.3 OG titles and descriptions

These should match the localized title and meta description for each language version. Additionally, each language page should include `og:locale`:

```html
<!-- Spanish page -->
<meta property="og:locale" content="es_ES">
<meta property="og:locale:alternate" content="en_US">
<meta property="og:locale:alternate" content="fr_FR">
<!-- ... other languages ... -->
```

### 7.4 Hreflang implementation

Every page in every language must include hreflang tags pointing to ALL language versions. For 8 languages, this means 9 tags per page (8 languages + x-default):

```html
<!-- On the Spanish TikTok downloader page -->
<link rel="alternate" hreflang="en" href="https://aawebtools.com/tiktok-downloader/">
<link rel="alternate" hreflang="fr" href="https://aawebtools.com/fr/telechargeur-tiktok/">
<link rel="alternate" hreflang="es" href="https://aawebtools.com/es/descargador-tiktok/">
<link rel="alternate" hreflang="pt" href="https://aawebtools.com/pt/baixar-tiktok/">
<link rel="alternate" hreflang="de" href="https://aawebtools.com/de/tiktok-downloader/">
<link rel="alternate" hreflang="hi" href="https://aawebtools.com/hi/tiktok-downloader/">
<link rel="alternate" hreflang="ar" href="https://aawebtools.com/ar/tiktok-downloader/">
<link rel="alternate" hreflang="ja" href="https://aawebtools.com/ja/tiktok-downloader/">
<link rel="alternate" hreflang="x-default" href="https://aawebtools.com/tiktok-downloader/">
```

**Critical:** Hreflang must be reciprocal. If the EN page points to the ES page, the ES page must point back to the EN page. Missing reciprocal links cause Google to ignore hreflang entirely.

**Recommendation:** Generate hreflang blocks from a central manifest file rather than hand-coding them, to prevent inconsistencies as pages are added.

---

## 8. Quality Review Workflow

### 8.1 Three-tier review system

```
TIER 1: AI TRANSLATION (Claude API)
    |
    v  Automated checks (character limits, placeholder preservation, HTML tag integrity)
    |
TIER 2: AI SELF-REVIEW (second Claude API pass)
    |
    v  Review prompt: "Compare this translation against the English source.
       Flag: formality inconsistencies, untranslated strings, cultural
       inappropriateness, SEO keyword accuracy, character limit violations."
    |
TIER 3: HUMAN SPOT-CHECK (community or paid)
    |
    v  Priority: legal pages > meta tags > blog content > UI strings
    |
PUBLISHED
```

### 8.2 AI self-review prompt template

```
You are reviewing a {language} translation of a web tool page for aawebtools.com.

Source language: English
Target language: {language}
Formality level: {informal for es/de, formal-vous for fr, desu-masu for ja}

Check for:
1. FORMALITY: Is tu/du/vous/desu-masu used consistently? Flag any switches.
2. TERMINOLOGY: Are tech terms handled correctly? "Download" should be
   translated in es/pt/fr/de but kept as-is in hi (loanword).
3. PLACEHOLDERS: Are all {{variable}} placeholders preserved exactly?
4. HTML: Are all HTML tags preserved and properly nested?
5. LENGTH: Flag any translated string that exceeds the English length by 40%+.
6. BRAND NAMES: AAWebTools, TikTok, Twitter, ScopeCove must never be translated.
7. NUMBERS: Are number formats correct for the target locale?
8. CULTURAL FIT: Flag any phrase that would sound unnatural to a native speaker.

Return a JSON array of issues found, or an empty array if none.
```

### 8.3 Handling user-reported translation errors

Add a discrete feedback mechanism to every translated page:

```html
<!-- Translation feedback link in footer of every non-EN page -->
<div class="translation-feedback">
  <a href="mailto:translate@aawebtools.com?subject=Translation%20Issue%20[es]%20[page-slug]&body=Please%20describe%20the%20translation%20issue:">
    Suggest a translation improvement
  </a>
</div>
```

Localized versions of the link text:
- ES: "Sugerir una mejora en la traduccion"
- PT: "Sugerir melhoria na traducao"
- DE: "Ubersetzungsverbesserung vorschlagen"
- AR: "اقتراح تحسين الترجمة"
- JA: "翻訳の改善を提案"
- HI: "अनुवाद सुधार सुझाएं"

### 8.4 Translation error priority matrix

| Error Type | Severity | Response Time | Action |
|---|---|---|---|
| Legal page mistranslation | Critical | 24 hours | Revert to English until fixed |
| Offensive/inappropriate translation | Critical | 24 hours | Remove page, retranslate |
| Wrong formality level (entire page) | High | 72 hours | Retranslate with correct prompt |
| Individual string error | Medium | 1 week | Patch the specific string |
| Style/tone inconsistency | Low | Next batch update | Note in glossary, fix in next pass |

---

## 9. Glossary and Terminology Database

### 9.1 Core terminology across all 8 languages

**File:** `frontend/locales/glossary.json`

| English | French | Spanish | Portuguese | German | Hindi | Arabic | Japanese |
|---|---|---|---|---|---|---|---|
| Download | Telecharger | Descargar | Baixar | Herunterladen | डाउनलोड (loanword) | تحميل | ダウンロード (loanword) |
| Upload | Telecharger (envoyer) | Subir / Cargar | Enviar / Carregar | Hochladen | अपलोड (loanword) | رفع | アップロード (loanword) |
| Free | Gratuit | Gratis / Gratuito | Gratis / Gratuito | Kostenlos | मुफ्त / फ्री | مجاني | 無料 |
| No signup | Sans inscription | Sin registro | Sem cadastro | Ohne Anmeldung | बिना साइन अप | بدون تسجيل | 登録不要 |
| Watermark | Filigrane | Marca de agua | Marca d'agua | Wasserzeichen | वॉटरमार्क (loanword) | علامة مائية | 透かし / ウォーターマーク |
| Invoice | Facture | Factura | Fatura / Nota fiscal | Rechnung | इनवॉइस / चालान | فاتورة | 請求書 |
| Pay stub | Bulletin de paie | Recibo de nomina | Holerite / Contracheque | Gehaltsabrechnung | सैलरी स्लिप (loanword) | قسيمة الراتب / كشف الراتب | 給与明細 |
| AI detector | Detecteur IA | Detector de IA | Detector de IA | KI-Detektor | AI डिटेक्टर (loanword) | كاشف الذكاء الاصطناعي | AI検出ツール |
| AI humanizer | Humanisateur IA | Humanizador de IA | Humanizador de IA | KI-Humanisierer | AI ह्यूमनाइज़र (loanword) | أداة أنسنة النصوص | AIテキスト人間化ツール |
| Image toolkit | Boite a outils images | Kit de herramientas de imagenes | Kit de ferramentas de imagem | Bild-Werkzeugkasten | इमेज टूलकिट (loanword) | مجموعة أدوات الصور | 画像ツールキット |
| Compress | Compresser | Comprimir | Comprimir | Komprimieren | कंप्रेस करें | ضغط | 圧縮 |
| Resize | Redimensionner | Redimensionar | Redimensionar | Grossenandern | रीसाइज़ करें | تغيير الحجم | リサイズ |
| Paste | Coller | Pegar | Colar | Einfugen | पेस्ट करें | لصق | 貼り付け |

### 9.2 Terms that must NEVER be translated (global do-not-translate list)

```json
{
  "brand_names": [
    "AAWebTools",
    "ScopeCove",
    "TikTok",
    "Twitter",
    "X",
    "Instagram",
    "ChatGPT",
    "GPT-4",
    "Claude",
    "Turnitin",
    "GPTZero",
    "Originality.ai",
    "Copyleaks",
    "ZeroGPT",
    "Compilatio",
    "Google",
    "Apple",
    "iPhone",
    "iPad",
    "Android",
    "PDF",
    "PNG",
    "JPG",
    "JPEG",
    "SVG",
    "HD",
    "URL",
    "API"
  ],
  "technical_terms": [
    "HTML",
    "CSS",
    "JSON",
    "FICA",
    "CPP",
    "EI",
    "PAYE",
    "PAYG",
    "INSS",
    "IRRF",
    "FGTS",
    "GDPR",
    "LGPD",
    "APPI"
  ]
}
```

### 9.3 Brand voice guidelines per language

| Language | Voice | Register | Key Characteristics |
|---|---|---|---|
| English | Friendly, direct | Casual professional | Short sentences, active voice, "you" addressed directly |
| French | Helpful, clear | Formal-vous | Polite but not stiff; avoid anglicisms where good French alternatives exist |
| Spanish | Friendly, approachable | Informal-tu | Warm tone; use Latin American Spanish as baseline, avoid Spain-specific slang |
| Portuguese | Casual, helpful | Informal-voce | Brazilian Portuguese; conversational, avoid Portugal-specific terms |
| German | Clear, efficient | Informal-du | Direct, no unnecessary filler; Germans appreciate precision |
| Hindi | Friendly, conversational | Mixed Hindi-English | Natural code-switching between Hindi and English tech terms |
| Arabic | Respectful, helpful | Modern Standard Arabic | MSA for written content; avoid dialect-specific terms |
| Japanese | Polite, precise | Desu/masu | Respectful but not overly humble; standard web politeness level |

---

## 10. URL Structure and Routing

### 10.1 Complete URL map for all languages

**Tool pages:**

| Tool | EN | FR | ES | PT |
|---|---|---|---|---|
| Homepage | `/` | `/fr/` | `/es/` | `/pt/` |
| TikTok | `/tiktok-downloader/` | `/fr/telechargeur-tiktok/` | `/es/descargador-tiktok/` | `/pt/baixar-tiktok/` |
| Twitter | `/twitter-video-downloader/` | `/fr/telechargeur-twitter/` | `/es/descargador-twitter/` | `/pt/baixar-twitter/` |
| Invoice | `/invoice-generator/` | `/fr/generateur-facture/` | `/es/generador-facturas/` | `/pt/gerador-faturas/` |
| Pay Stub | `/paystub-generator/` | `/fr/generateur-bulletin-de-paie/` | `/es/generador-recibo-nomina/` | `/pt/gerador-holerite/` |
| AI Detector | `/ai-detector/` | `/fr/detecteur-ia/` | `/es/detector-ia/` | `/pt/detector-ia/` |
| AI Humanizer | `/ai-humanizer/` | `/fr/humanisateur-ia/` | `/es/humanizador-ia/` | `/pt/humanizador-ia/` |
| Image Toolkit | `/image-toolkit/` | `/fr/boite-a-outils-images/` | `/es/herramientas-imagen/` | `/pt/ferramentas-imagem/` |

| Tool | DE | HI | AR | JA |
|---|---|---|---|---|
| Homepage | `/de/` | `/hi/` | `/ar/` | `/ja/` |
| TikTok | `/de/tiktok-downloader/` | `/hi/tiktok-downloader/` | `/ar/tiktok-downloader/` | `/ja/tiktok-downloader/` |
| Twitter | `/de/twitter-downloader/` | `/hi/twitter-downloader/` | `/ar/twitter-downloader/` | `/ja/twitter-downloader/` |
| Invoice | `/de/rechnungsgenerator/` | `/hi/invoice-generator/` | `/ar/invoice-generator/` | `/ja/invoice-generator/` |
| Pay Stub | `/de/gehaltsabrechnung/` | `/hi/pay-stub-generator/` | `/ar/pay-stub-generator/` | `/ja/pay-stub-generator/` |
| AI Detector | `/de/ki-detektor/` | `/hi/ai-detector/` | `/ar/ai-detector/` | `/ja/ai-detector/` |
| AI Humanizer | `/de/ki-humanisierer/` | `/hi/ai-humanizer/` | `/ar/ai-humanizer/` | `/ja/ai-humanizer/` |
| Image Toolkit | `/de/bild-werkzeuge/` | `/hi/image-toolkit/` | `/ar/image-toolkit/` | `/ja/image-toolkit/` |

### 10.2 Static pages

| Page | EN | FR | ES | PT | DE | HI | AR | JA |
|---|---|---|---|---|---|---|---|---|
| About | `/about/` | `/fr/a-propos/` | `/es/acerca/` | `/pt/sobre/` | `/de/ueber-uns/` | `/hi/about/` | `/ar/about/` | `/ja/about/` |
| Contact | `/contact/` | `/fr/contact/` | `/es/contacto/` | `/pt/contato/` | `/de/kontakt/` | `/hi/contact/` | `/ar/contact/` | `/ja/contact/` |
| Privacy | `/privacy/` | `/fr/confidentialite/` | `/es/privacidad/` | `/pt/privacidade/` | `/de/datenschutz/` | `/hi/privacy/` | `/ar/privacy/` | `/ja/privacy/` |
| Terms | `/terms/` | `/fr/conditions/` | `/es/terminos/` | `/pt/termos/` | `/de/nutzungsbedingungen/` | `/hi/terms/` | `/ar/terms/` | `/ja/terms/` |

### 10.3 Nginx routing additions

Add to `nginx.conf` or the site's conf.d file:

```nginx
# Language directory routing
location ~ ^/(fr|es|pt|de|hi|ar|ja)/ {
    root /var/www/aawebtools;
    try_files $uri $uri/ $uri/index.html =404;
}

# Redirect bare language prefixes to trailing slash
location ~ ^/(fr|es|pt|de|hi|ar|ja)$ {
    return 301 $scheme://$host$request_uri/;
}
```

### 10.4 Language switcher redesign

The current language toggle is two buttons: `EN | FR`. With 8 languages, this must become a dropdown.

```
Current:  [EN] [FR]

Proposed: [EN v]  ← dropdown showing:
            English
            Francais
            Espanol
            Portugues
            Deutsch
            हिन्दी
            العربية
            日本語
```

Each option links to the equivalent page in that language (not a JS toggle). This ensures every language version is a real URL that Google can crawl.

---

## 11. Technical Implementation Sequence

### Phase 1: Infrastructure (Week 1-2)

1. Create `frontend/locales/` directory structure
2. Extract all translatable strings from EN tool pages into `en/ui.json`
3. Build `glossary.json` (Section 9 content)
4. Create the translation pipeline script (Claude API batch translator)
5. Build the HTML generator that takes `ui.json` + HTML template and produces localized pages
6. Add RTL CSS support (separate stylesheet or CSS logical properties)
7. Update `core.js` language toggle to become a dropdown linking to real URLs
8. Update Nginx routing

### Phase 2: Spanish + Portuguese (Week 3-4)

1. Generate `es/ui.json` and `pt/ui.json` via Claude API
2. Run AI self-review (Tier 2)
3. Generate all ES tool pages (7 pages)
4. Generate all PT tool pages (7 pages)
5. Create ES and PT homepages
6. Add hreflang tags to all existing EN and FR pages (now pointing to 4 languages)
7. Add ES and PT to sitemap.xml
8. Submit new sitemaps to Google Search Console

### Phase 3: German (Week 5)

1. Generate `de/ui.json`
2. Generate all DE tool pages (7 pages)
3. Create DE homepage, about, contact pages
4. Update hreflang everywhere (now 5 languages)

### Phase 4: Hindi + Arabic + Japanese (Week 6-8)

1. Add Hindi font support (system fonts are adequate for Devanagari on modern browsers)
2. Add Arabic RTL stylesheet (`assets/css/rtl.css`)
3. Add Japanese font support (Noto Sans JP or system fonts)
4. Generate HI, AR, JA ui.json files
5. Generate all tool pages for 3 languages (21 pages)
6. Manual review of Arabic RTL layout on all pages
7. Update hreflang everywhere (now 8 languages)

### Phase 5: Blog content (Week 9-10)

1. Translate Phase 1 blog posts (4 posts) to ES, PT, DE
2. Translate Phase 2 blog posts (3 posts) to HI, AR, JA
3. Create blog index pages for each language

### Phase 6: Country pages + legal (Week 11-12)

1. Create `/fr/pay-stub-generator/canada/` (translate existing EN version)
2. Create `/es/pay-stub-generator/usa/` (translate existing EN version)
3. Create new country pages: Brazil (PT), Germany (DE), India (EN + HI)
4. Translate privacy policy to all 7 non-EN languages with jurisdiction-specific additions
5. Translate terms of service to all 7 non-EN languages with governing-law disclaimers

### Estimated total new pages

| Phase | New Pages | Running Total |
|---|---|---|
| Current site | 0 | 37 (24 EN + 13 FR) |
| Phase 2 (ES, PT) | ~24 | 61 |
| Phase 3 (DE) | ~12 | 73 |
| Phase 4 (HI, AR, JA) | ~36 | 109 |
| Phase 5 (Blogs) | ~25 | 134 |
| Phase 6 (Country + Legal) | ~22 | 156 |
| **Final total** | | **~156 pages** |

---

## 12. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AI produces inconsistent formality within a page | High | Medium | Explicit formality instructions in every translation prompt; AI self-review pass checking for switches |
| Arabic RTL layout breaks tool interfaces | High | High | Build RTL CSS early; test with real Arabic content before translating all pages |
| German text overflows buttons and UI containers | High | Medium | Set max-width constraints; test with longest German strings; allow text wrapping in buttons |
| Japanese characters render poorly on some systems | Medium | Medium | Use system font stack with fallbacks: `"Hiragino Sans", "Yu Gothic", "Meiryo", sans-serif` |
| Hreflang tags become inconsistent as pages are added/removed | High | High | Generate hreflang blocks from a single manifest file; never hand-code them |
| Legal page translation creates liability | Medium | Critical | Always include "English version governs" disclaimer; have legal review for DE (GDPR) and PT-BR (LGPD) |
| Thin translated content penalized by Google | Medium | High | Only translate content that has genuine value in the target market (Section 6 matrix) |
| Translation maintenance burden grows with each language | High | Medium | Automate the pipeline: change English source, re-run translation, diff and review changes only |
| Hindi/Arabic users report unnatural translations | Medium | Medium | Include translation feedback link on every page; prioritize fixes based on traffic data |
| Pay stub country pages with wrong tax calculations | Low | Critical | Country pages need manual expert review, not just translation; tax calculations are not a translation problem |

---

## Appendix A: Translation API Prompt Template

Use this prompt structure for every Claude API translation call:

```
You are translating web content for aawebtools.com, a free online tools website.

SOURCE LANGUAGE: English
TARGET LANGUAGE: {language}
TARGET LOCALE: {locale}
FORMALITY: {formal/informal}
DIRECTION: {ltr/rtl}

GLOSSARY (these terms have fixed translations):
{insert relevant glossary entries}

DO NOT TRANSLATE:
{insert do-not-translate list}

RULES:
1. Use {tu/du/vous/desu-masu/informal} consistently throughout
2. Keep all {{placeholders}} exactly as they appear
3. Keep all HTML tags exactly as they appear
4. Preserve line breaks and formatting
5. For tech terms commonly used as English loanwords in {language}, keep the English term
6. Match the casual, helpful tone of the source
7. Ensure the translation reads naturally, not like a translation

INPUT FORMAT: JSON with key-value pairs
OUTPUT FORMAT: Same JSON structure with translated values only

INPUT:
{json_content}
```

---

## Appendix B: RTL CSS Strategy for Arabic

Rather than maintaining a separate stylesheet, use CSS logical properties throughout `main.css`. This makes the same CSS work for both LTR and RTL:

| Physical Property (current) | Logical Property (replace with) |
|---|---|
| `margin-left` | `margin-inline-start` |
| `margin-right` | `margin-inline-end` |
| `padding-left` | `padding-inline-start` |
| `padding-right` | `padding-inline-end` |
| `text-align: left` | `text-align: start` |
| `text-align: right` | `text-align: end` |
| `float: left` | `float: inline-start` |
| `border-left` | `border-inline-start` |

For properties that cannot use logical equivalents, create a minimal `rtl.css` override:

```css
/* rtl.css -- loaded only on Arabic pages */
[dir="rtl"] .nav__links { flex-direction: row-reverse; }
[dir="rtl"] .steps { direction: rtl; }
[dir="rtl"] .faq-item summary::after { transform: rotate(180deg); }
```

---

## Appendix C: Sitemap Strategy

Create language-specific sitemaps and a sitemap index:

```xml
<!-- sitemap-index.xml -->
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://aawebtools.com/sitemap-en.xml</loc></sitemap>
  <sitemap><loc>https://aawebtools.com/sitemap-fr.xml</loc></sitemap>
  <sitemap><loc>https://aawebtools.com/sitemap-es.xml</loc></sitemap>
  <sitemap><loc>https://aawebtools.com/sitemap-pt.xml</loc></sitemap>
  <sitemap><loc>https://aawebtools.com/sitemap-de.xml</loc></sitemap>
  <sitemap><loc>https://aawebtools.com/sitemap-hi.xml</loc></sitemap>
  <sitemap><loc>https://aawebtools.com/sitemap-ar.xml</loc></sitemap>
  <sitemap><loc>https://aawebtools.com/sitemap-ja.xml</loc></sitemap>
</sitemapindex>
```

Each language sitemap should include `xhtml:link` hreflang annotations:

```xml
<url>
  <loc>https://aawebtools.com/es/descargador-tiktok/</loc>
  <xhtml:link rel="alternate" hreflang="en" href="https://aawebtools.com/tiktok-downloader/"/>
  <xhtml:link rel="alternate" hreflang="fr" href="https://aawebtools.com/fr/telechargeur-tiktok/"/>
  <xhtml:link rel="alternate" hreflang="es" href="https://aawebtools.com/es/descargador-tiktok/"/>
  <!-- ... all 8 languages ... -->
  <xhtml:link rel="alternate" hreflang="x-default" href="https://aawebtools.com/tiktok-downloader/"/>
</url>
```

---

*End of localization plan. This document should be reviewed before implementation begins and updated as decisions are finalized.*
