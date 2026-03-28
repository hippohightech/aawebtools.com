# PRD — aawebtools.com
**Version:** 1.0  
**Date:** March 2026  
**Status:** Ready for build  
**Build method:** GSD repo + Claude Code, one section at a time  
**Test environment:** Docker (local) → Hostinger VPS (production)

---

## GROUND RULES FOR GSD

- Read this entire PRD before writing a single line of code
- Build exactly what is specified — no additions, no creative interpretation
- When a section says "nothing else", that means nothing else
- Every section ends with a clear deliverable — build that deliverable only
- Do not proceed to the next section until the current one is confirmed working in Docker
- All code must be production-ready, not prototype quality

---

## SECTION 0 — Security Architecture

### 0.1 UFW Firewall (Hostinger VPS)
Only three ports open:
- 22 (SSH)
- 80 (HTTP — Nginx redirects to HTTPS)
- 443 (HTTPS)

All other ports closed. Docker internal networking handles container-to-container communication. No Docker container exposes ports directly to the internet except through Nginx.

### 0.2 SSL
Let's Encrypt certificate for aawebtools.com and all subdomains (*.aawebtools.com). Auto-renewal via certbot in a cron job. All HTTP traffic redirects to HTTPS with 301 permanent redirect in Nginx config.

### 0.3 Nginx Rate Limiting
Rate limits defined in nginx.conf:

```nginx
limit_req_zone $binary_remote_addr zone=general:10m rate=30r/m;
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/m;
limit_req_zone $binary_remote_addr zone=download:10m rate=5r/m;
```

- General pages: 30 requests per minute per IP
- API endpoints: 10 requests per minute per IP  
- Download endpoints: 5 requests per minute per IP
- Exceeded limits return 429 with a JSON error message
- Burst allowance: 5 requests before rate limiting kicks in

### 0.4 Fail2ban
Monitors Nginx access logs. Rules:
- 5 or more 429 responses from same IP in 10 minutes → ban for 1 hour
- 10 or more 404 responses from same IP in 5 minutes → ban for 30 minutes
- Any request to common attack paths (wp-admin, .env, etc.) → ban for 24 hours
- On ban: send Telegram notification to owner (Telegram bot token and chat ID stored in .env)

### 0.5 Content Security Policy Headers
Set in Nginx for all tool pages:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com; frame-src https://googleads.g.doubleclick.net;
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 0.6 CORS Policy
Node.js API (Express) only accepts requests from https://aawebtools.com. All other origins receive 403. Configuration:

```javascript
const cors = require('cors');
app.use(cors({
  origin: 'https://aawebtools.com',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
```

### 0.7 Input Sanitization
All user inputs in the downloader tools must be validated server-side before processing:
- URL inputs: must match exact regex for TikTok or Twitter/X domains only
- Text inputs: strip all HTML tags, limit character counts per tool
- Reject any input containing script tags, SQL keywords, or path traversal patterns
- Silently reject (return generic error) rather than exposing validation logic

### 0.8 Environment Variables
All secrets stored in a single .env file at project root. Never committed to any repository. Variables:
- TELEGRAM_BOT_TOKEN
- TELEGRAM_CHAT_ID
- NODE_ENV
- UMAMI_SITE_ID
- PROPELLERADS_ZONE_ID
- ADSENSE_PUBLISHER_ID

**Section 0 deliverable:** nginx.conf with security headers and rate limits, docker-compose.yml skeleton with UFW rules documented, .env.example file with all variable names (no values), fail2ban jail configuration file.

---

## SECTION 1 — Project Scaffold + Docker Compose

### 1.1 Folder Structure

```
aawebtools-project/
├── PRD.md
├── .env
├── .env.example
├── .gitignore
├── docker-compose.yml
├── nginx/
│   ├── nginx.conf
│   └── conf.d/
│       └── aawebtools.conf
├── frontend/
│   ├── index.html
│   ├── tools.json
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── assets/
│   │   ├── css/
│   │   │   └── main.css
│   │   ├── js/
│   │   │   └── core.js
│   │   └── img/
│   │       ├── logo.svg
│   │       ├── favicon.ico
│   │       └── og-default.png
│   ├── tiktok-downloader/
│   │   └── index.html
│   ├── twitter-video-downloader/
│   │   └── index.html
│   ├── invoice-generator/
│   │   └── index.html
│   ├── ai-detector/
│   │   └── index.html
│   ├── ai-humanizer/
│   │   └── index.html
│   ├── paystub-generator/
│   │   └── index.html
│   └── 404.html
├── api/
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   ├── routes/
│   │   ├── tiktok.js
│   │   ├── twitter.js
│   │   └── health.js
│   └── utils/
│       ├── validator.js
│       └── downloader.js
├── python-api/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── main.py  (empty FastAPI skeleton — ready for future tools)
├── monitoring/
│   ├── uptime-kuma/
│   └── netdata/
└── analytics/
    └── umami/
```

### 1.2 Docker Compose Services

Seven containers total:

```yaml
version: '3.8'
services:

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./frontend:/var/www/aawebtools
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    depends_on:
      - node-api
    restart: always

  node-api:
    build: ./api
    environment:
      - NODE_ENV=${NODE_ENV}
    env_file: .env
    expose:
      - "3000"
    restart: always

  python-api:
    build: ./python-api
    expose:
      - "8000"
    restart: always

  uptime-kuma:
    image: louislam/uptime-kuma:1
    volumes:
      - ./monitoring/uptime-kuma:/app/data
    expose:
      - "3001"
    restart: always

  netdata:
    image: netdata/netdata
    expose:
      - "19999"
    cap_add:
      - SYS_PTRACE
    security_opt:
      - apparmor:unconfined
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    restart: always

  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    expose:
      - "3002"
    environment:
      DATABASE_URL: postgresql://umami:umami@umami-db:5432/umami
      DATABASE_TYPE: postgresql
      APP_SECRET: ${UMAMI_APP_SECRET}
    depends_on:
      - umami-db
    restart: always

  umami-db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: umami
      POSTGRES_USER: umami
      POSTGRES_PASSWORD: umami
    volumes:
      - ./analytics/umami:/var/lib/postgresql/data
    restart: always
```

### 1.3 Nginx Routing

```
https://aawebtools.com/              → frontend/index.html
https://aawebtools.com/[tool]/       → frontend/[tool]/index.html
https://aawebtools.com/api/tiktok    → node-api:3000/tiktok
https://aawebtools.com/api/twitter   → node-api:3000/twitter
https://aawebtools.com/api/health    → node-api:3000/health
https://monitor.aawebtools.com/      → uptime-kuma:3001
https://netdata.aawebtools.com/      → netdata:19999
https://analytics.aawebtools.com/    → umami:3002
```

monitor, netdata, and analytics subdomains are protected by IP allowlist — only accessible from owner's IP address.

### 1.4 tools.json — Tool Registry

The homepage reads this file to render tool cards. Adding a new tool = add one object here:

```json
[
  {
    "id": "tiktok-downloader",
    "title": "TikTok Downloader",
    "title_fr": "Téléchargeur TikTok",
    "description": "Download TikTok videos without watermark in HD",
    "description_fr": "Téléchargez des vidéos TikTok sans filigrane en HD",
    "icon": "tiktok",
    "category": "downloader",
    "path": "/tiktok-downloader/",
    "badge": "Most Popular",
    "monetization": "propellerads"
  },
  {
    "id": "twitter-video-downloader",
    "title": "Twitter Video Downloader",
    "title_fr": "Téléchargeur Vidéo Twitter",
    "description": "Download Twitter/X videos and GIFs for free",
    "description_fr": "Téléchargez des vidéos et GIFs Twitter/X gratuitement",
    "icon": "twitter",
    "category": "downloader",
    "path": "/twitter-video-downloader/",
    "badge": null,
    "monetization": "propellerads"
  },
  {
    "id": "invoice-generator",
    "title": "Invoice Generator",
    "title_fr": "Générateur de Facture",
    "description": "Create professional invoices free — no sign up required",
    "description_fr": "Créez des factures professionnelles gratuitement — sans inscription",
    "icon": "invoice",
    "category": "generator",
    "path": "/invoice-generator/",
    "badge": "Free PDF",
    "monetization": "adsense"
  },
  {
    "id": "ai-detector",
    "title": "AI Content Detector",
    "title_fr": "Détecteur de Contenu IA",
    "description": "Detect AI-generated text from ChatGPT, Claude, and more",
    "description_fr": "Détectez le texte généré par l'IA de ChatGPT, Claude, etc.",
    "icon": "detector",
    "category": "ai",
    "path": "/ai-detector/",
    "badge": null,
    "monetization": "adsense"
  },
  {
    "id": "ai-humanizer",
    "title": "AI Text Humanizer",
    "title_fr": "Humanisateur de Texte IA",
    "description": "Make AI-written text sound natural and human",
    "description_fr": "Rendez le texte écrit par l'IA naturel et humain",
    "icon": "humanizer",
    "category": "ai",
    "path": "/ai-humanizer/",
    "badge": null,
    "monetization": "adsense"
  },
  {
    "id": "paystub-generator",
    "title": "Pay Stub Generator",
    "title_fr": "Générateur de Bulletin de Paie",
    "description": "Create professional pay stubs free — instant PDF download",
    "description_fr": "Créez des bulletins de paie professionnels — PDF instantané",
    "icon": "paystub",
    "category": "generator",
    "path": "/paystub-generator/",
    "badge": "Free PDF",
    "monetization": "adsense"
  }
]
```

**Section 1 deliverable:** Complete folder structure created, docker-compose.yml, all Dockerfiles, nginx.conf, .env.example, tools.json. Everything starts and runs with `docker-compose up`. No tool HTML yet — just the scaffold.

---

## SECTION 2 — Design System

### 2.1 Design Philosophy

Modern dark tech aesthetic — inspired by Linear.app and Vercel.com visual language. Dark background with electric blue accents. Subtle animations on scroll and interaction. Clean, fast, zero visual noise. The tool interface itself uses a white/light card on the dark background for maximum usability contrast.

### 2.2 Color System (CSS Variables)

```css
:root {
  /* Backgrounds */
  --bg-primary: #0a0e1a;       /* Main page background — deep navy */
  --bg-secondary: #111827;     /* Card backgrounds */
  --bg-tertiary: #1a2234;      /* Input fields, hover states */
  --bg-card: #0f172a;          /* Tool interface card */
  
  /* Tool interface (light area inside dark page) */
  --tool-bg: #ffffff;
  --tool-bg-secondary: #f8fafc;
  --tool-border: #e2e8f0;
  --tool-text: #0f172a;
  --tool-text-secondary: #64748b;

  /* Accent colors */
  --accent-blue: #4f7fff;      /* Primary CTA, links, active states */
  --accent-blue-hover: #6b94ff;
  --accent-blue-glow: rgba(79, 127, 255, 0.15);
  --accent-green: #10b981;     /* Success states */
  --accent-red: #ef4444;       /* Error states */
  --accent-yellow: #f59e0b;    /* Warning states */

  /* Text */
  --text-primary: #f1f5f9;     /* Main text on dark bg */
  --text-secondary: #94a3b8;   /* Muted text on dark bg */
  --text-tertiary: #64748b;    /* Placeholder, labels */
  
  /* Borders */
  --border-primary: #1e2d45;
  --border-secondary: #2d3f5c;
  --border-accent: #4f7fff;
  
  /* Gradients */
  --gradient-hero: linear-gradient(135deg, #0a0e1a 0%, #111827 50%, #0f1f3d 100%);
  --gradient-glow: radial-gradient(ellipse at 50% 0%, rgba(79,127,255,0.12) 0%, transparent 70%);
  --gradient-card: linear-gradient(145deg, #111827 0%, #0f172a 100%);
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 40px;
  --space-2xl: 64px;
  --space-3xl: 96px;
  
  /* Typography */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 32px;
  --text-4xl: 48px;
  --text-5xl: 60px;
  
  /* Borders radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.4);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.5);
  --shadow-glow: 0 0 40px rgba(79,127,255,0.15);
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms ease;
}
```

### 2.3 Typography

Single font: Inter from Google Fonts. Load with `display=swap` async to never block rendering.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Font weight usage:
- 400 — body text, descriptions, labels
- 500 — UI elements, navigation, badges
- 600 — section headings, card titles
- 700 — hero H1 only

Line heights: 1.5 for body, 1.2 for headings, 1.0 for buttons and badges.

### 2.4 Animation System

All animations are CSS-only. No JavaScript animation libraries. No GSAP, no Framer Motion. Animations must never cause layout shift (CLS = 0).

**Scroll reveal animation:** Elements fade in and slide up 20px when they enter the viewport. Implemented via Intersection Observer API in core.js (minimal JS, no library). Elements start with `opacity: 0; transform: translateY(20px)` and transition to `opacity: 1; transform: translateY(0)`.

**Hover animations:**
- Buttons: scale(1.02) + box-shadow glow, 150ms ease
- Tool cards: scale(1.01) + border-color change to accent-blue, 250ms ease
- Navigation links: color change to accent-blue + underline slide-in, 150ms ease

**Loading animation:** When a download or generation is processing, show a pulsing spinner made of CSS only — no GIF, no library. Color: accent-blue.

**Page entrance:** No full-page entrance animation. Only section-level scroll reveals.

**Reduced motion:** All animations wrapped in `@media (prefers-reduced-motion: no-preference)`. Users with reduced motion preference see no animations.

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 2.5 Component Library

**Primary Button:**
```css
.btn-primary {
  background: var(--accent-blue);
  color: #ffffff;
  padding: 12px 24px;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  letter-spacing: 0.02em;
}
.btn-primary:hover {
  background: var(--accent-blue-hover);
  transform: scale(1.02);
  box-shadow: var(--shadow-glow);
}
```

**Tool Card (homepage):**
Dark card with icon, title, description, arrow indicator. Hover scales up and shows accent border.

**Tool Interface Card (on each tool page):**
White/light card on dark page background. This is where users actually interact with the tool. Contains inputs, action button, and output area. Maximum width 800px, centered, with padding 40px.

**Input Field (inside tool card):**
```css
.tool-input {
  background: var(--tool-bg-secondary);
  border: 1.5px solid var(--tool-border);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  font-size: var(--text-base);
  color: var(--tool-text);
  width: 100%;
  transition: border-color var(--transition-fast);
}
.tool-input:focus {
  outline: none;
  border-color: var(--accent-blue);
  box-shadow: 0 0 0 3px var(--accent-blue-glow);
}
```

**Badge:**
Small pill labels (Most Popular, Free PDF, etc.). Background: accent-blue with 15% opacity, text: accent-blue, border-radius: full, padding: 4px 10px, font-size: 11px, font-weight: 600.

**Section Label:**
Small uppercase label above section headings. Color: accent-blue, font-size: 12px, letter-spacing: 0.1em, font-weight: 600.

### 2.6 Performance Budget

Hard targets — GSD must build to these numbers:

| Metric | Target |
|---|---|
| Lighthouse Performance | ≥ 90 on mobile |
| LCP (Largest Contentful Paint) | < 2.5 seconds |
| CLS (Cumulative Layout Shift) | < 0.1 |
| FID (First Input Delay) | < 100ms |
| Page weight (HTML + CSS + JS) | < 200KB uncompressed |
| Time to Interactive | < 3 seconds on 4G |
| CSS file size | < 25KB |
| JS bundle size | < 50KB |

Rules to achieve these targets:
- No JavaScript frameworks (no React, Vue, Angular)
- No CSS frameworks (no Bootstrap, Tailwind)
- Images: WebP format, lazy-loaded, explicit width/height attributes
- Fonts: async load with display=swap
- Ad scripts: async attribute, loaded after page content
- No render-blocking resources above the fold
- Critical CSS inlined in `<head>` for above-the-fold content

**Section 2 deliverable:** Complete main.css file with all variables, all component styles, all animations, responsive breakpoints (mobile-first, breakpoints at 640px, 768px, 1024px, 1280px). Plus core.js with Intersection Observer for scroll reveals only.

---

## SECTION 3 — Shared Components

### 3.1 HTML Template (used by every page)

Every page shares this exact `<head>` structure:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- SEO — unique per page, values defined in each section below -->
  <title>[PAGE_TITLE] | AAWebTools</title>
  <meta name="description" content="[META_DESCRIPTION]">
  <link rel="canonical" href="https://aawebtools.com[PAGE_PATH]">
  
  <!-- Open Graph — for social sharing previews -->
  <meta property="og:title" content="[PAGE_TITLE] | AAWebTools">
  <meta property="og:description" content="[META_DESCRIPTION]">
  <meta property="og:image" content="https://aawebtools.com/assets/img/og-[TOOL_ID].png">
  <meta property="og:url" content="https://aawebtools.com[PAGE_PATH]">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="AAWebTools">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="[PAGE_TITLE] | AAWebTools">
  <meta name="twitter:description" content="[META_DESCRIPTION]">
  <meta name="twitter:image" content="https://aawebtools.com/assets/img/og-[TOOL_ID].png">
  
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/assets/img/favicon.svg">
  <link rel="icon" type="image/x-icon" href="/assets/img/favicon.ico">
  
  <!-- Fonts — async -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- CSS -->
  <link rel="stylesheet" href="/assets/css/main.css">
  
  <!-- Schema Markup — unique per page, defined in each section below -->
  <script type="application/ld+json">
  [SCHEMA_JSON]
  </script>
  
  <!-- Google Search Console verification — homepage only -->
  <!-- Umami Analytics — async, privacy-first -->
  <script async defer src="https://analytics.aawebtools.com/script.js" 
          data-website-id="[UMAMI_SITE_ID]"></script>
</head>
```

### 3.2 Navigation

Sticky top navigation. Dark background with slight blur (backdrop-filter). Logo left, tool links center (hidden on mobile — hamburger menu), language toggle right.

Navigation links:
- Downloader Tools (dropdown: TikTok Downloader, Twitter Downloader)
- Generator Tools (dropdown: Invoice Generator, Pay Stub Generator)
- AI Tools (dropdown: AI Detector, AI Humanizer)

Language toggle: EN | FR — small pill toggle, top right. Switches all page text client-side via JavaScript. Stores preference in localStorage.

Mobile: hamburger icon opens a full-width slide-down menu. All links visible. Language toggle at bottom of mobile menu.

### 3.3 Footer

Three-column footer on dark background. Columns:
1. Logo + tagline ("Free tools for everyone, worldwide") + copyright
2. Tools list (links to all 6 tools)
3. Legal (Privacy Policy, Terms of Service — static pages, minimal content for AdSense compliance)

Bottom bar: "Made with ❤️ | Free forever | No signup required"

### 3.4 404 Page

Dark page with animated illustration (CSS-only — abstract shapes). Large "404" in accent-blue. Subtext: "This page doesn't exist." Below it: a grid of all tool cards (same as homepage). Helps users find tools instead of bouncing.

### 3.5 Error State Component

Used inside tools when something fails. Shows:
- Icon (warning triangle, CSS-only)
- Title: "Something went wrong"
- For downloader tools specifically: "We're fixing this. Check back in 2 hours."
- Button: "Try Another Tool" → links back to homepage

No stack traces, no technical errors shown to users.

### 3.6 robots.txt

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /analytics/
Disallow: /monitor/
Disallow: /netdata/

User-agent: GPTBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: CCBot
Disallow: /

Sitemap: https://aawebtools.com/sitemap.xml
```

### 3.7 sitemap.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://aawebtools.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://aawebtools.com/tiktok-downloader/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://aawebtools.com/twitter-video-downloader/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://aawebtools.com/invoice-generator/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://aawebtools.com/ai-detector/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://aawebtools.com/ai-humanizer/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://aawebtools.com/paystub-generator/</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

**Section 3 deliverable:** HTML template file, navigation component (HTML + CSS + JS), footer component, 404.html, robots.txt, sitemap.xml.

---

## SECTION 4 — Homepage

### 4.1 Page Identity

- URL: https://aawebtools.com/
- Title: "Free Online Tools — No Signup Required | AAWebTools"
- Meta description: "Free web tools for everyone. TikTok downloader, invoice generator, AI detector and more. No login, no limits, instant results."
- Canonical: https://aawebtools.com/

### 4.2 Hero Section

Full-width dark section. Background: gradient-hero + gradient-glow overlay (radial glow from top center). Height: 100vh on desktop, auto on mobile.

Content centered:
- Section label: "FREE ONLINE TOOLS"
- H1: "The tools you need. Free. Forever." (font-size: 60px desktop, 36px mobile, font-weight: 700)
- Subheading: "Download videos, generate invoices, detect AI content — no sign up required." (font-size: 20px, color: text-secondary)
- Two buttons side by side: "Explore Tools" (primary blue button, scrolls to tools grid) | "TikTok Downloader →" (ghost button, links to /tiktok-downloader/)
- Below buttons: small trust badges — "✓ No Login" | "✓ Free Forever" | "✓ Works Worldwide"

Background animation: Subtle floating dots/particles — pure CSS animated, not JavaScript. Maximum 12 dots, each moving slowly in random directions. Opacity 0.15 so they don't compete with text. Must not cause CLS.

### 4.3 Tools Grid Section

Section heading: "All Tools" (H2, left-aligned)
Sub-label: "Everything you need, nothing you don't"

Grid: 3 columns desktop, 2 columns tablet, 1 column mobile. Gap: 20px.

Each tool card reads from tools.json and renders:
- Category badge top-left (Downloader / Generator / AI)
- Tool badge top-right if not null (Most Popular, Free PDF)
- Icon (SVG, 32px)
- Tool title (H3, font-size: 18px, font-weight: 600)
- Description (font-size: 14px, color: text-secondary)
- "Use Tool →" link at bottom (color: accent-blue)
- Hover: card scales 1.01, border becomes accent-blue, slight shadow

### 4.4 Stats Bar Section

Dark section with 4 stats displayed horizontally:
- "6 Free Tools"
- "No Signup Required"
- "Works in 190+ Countries"
- "100% Free Forever"

Clean, minimal. Numbers in large font (32px, font-weight: 700, color: accent-blue). Labels below in small text.

### 4.5 Schema Markup

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "AAWebTools",
  "url": "https://aawebtools.com",
  "description": "Free online tools for everyone — no signup required",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://aawebtools.com/?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

**Section 4 deliverable:** Complete homepage index.html reading from tools.json, fully responsive, all animations working, Lighthouse score ≥ 90.

---

## SECTION 5 — Tool 1: TikTok Downloader

### 5.1 Page Identity

- URL: https://aawebtools.com/tiktok-downloader/
- H1: "TikTok Video Downloader — No Watermark"
- Title tag: "TikTok Video Downloader — No Watermark, Free & Fast | AAWebTools"
- Meta description: "Download TikTok videos without watermark in HD quality. Free, no login, works on iPhone, Android & PC. Paste the link and download instantly."
- First target keyword: "tiktok profile picture downloader" (KD 5)
- Second target keyword: "tiktok photo downloader" (KD 24)

### 5.2 Page Layout

**Section A — Hero (dark):**
Section label: "TIKTOK DOWNLOADER"
H1 as defined above
Subtext: "Paste any TikTok link below — video, photo, slideshow, or profile picture. Free, HD quality, no watermark."

**Section B — Tool Interface Card (white card on dark page):**
Max-width: 800px, centered, border-radius: 16px, background: white, padding: 40px.

Inside the white card:
1. Tab bar: "Video" | "Photo/Slideshow" | "Profile Picture" — tabs switch the input placeholder text and API endpoint
2. URL input field: large, full-width, placeholder "Paste TikTok link here..."
3. "Download" button: full-width, primary blue, large (padding: 16px)
4. Loading state: spinner animation while processing
5. Output area: appears below button after successful processing. Shows video thumbnail, title, and download options:
   - "Download MP4 (HD)" button
   - "Download MP3 (Audio)" button
   - "Download without watermark" — primary option highlighted

**Ad placement (PropellerAds):**
- Ad unit 1: Below the tool card (728x90 desktop, 320x50 mobile)
- Ad unit 2: Right sidebar on desktop (300x250), hidden on mobile

**Section C — How to Use (dark background):**
H2: "How to Download TikTok Videos"
Three steps as numbered cards:
1. Copy the TikTok video link
2. Paste it in the box above
3. Click Download and save your file

**Section D — FAQ (dark background):**
H2: "Frequently Asked Questions"
Five Q&A items using HTML details/summary elements (accordion). Questions target the low-KD keywords from SEMrush data:
- "How do I download a TikTok profile picture?" (targets KD 5 keyword)
- "Can I download TikTok photos and slideshows?" (targets KD 24 keyword)
- "How do I download TikTok videos without watermark?"
- "Does this work on iPhone and Android?"
- "Is it free to download TikTok videos?"

**Section E — Related Tools:**
"You might also need:" → links to Twitter Downloader and Invoice Generator with small cards.

### 5.3 Backend API — Node.js

File: api/routes/tiktok.js

Endpoints:
- POST /api/tiktok/video — accepts {url: string}, returns download link
- POST /api/tiktok/photo — accepts {url: string}, returns photo URLs
- POST /api/tiktok/profile — accepts {username: string}, returns profile picture URL
- GET /api/health — returns {status: "ok", timestamp: Date}

Validation in validator.js:
- URL must match: /^https?:\/\/(www\.|vm\.|vt\.)?tiktok\.com\//
- URL length: max 500 characters
- Rate limit: 5 requests per minute per IP (enforced by Nginx, double-checked in Express)

Downloader library: use yt-dlp as subprocess called from Node.js. yt-dlp is installed in the Docker container. When yt-dlp fails or returns an error, return the error state (do not expose the actual error message to the frontend — return generic "Service temporarily unavailable").

Error response always returns:
```json
{
  "success": false,
  "message": "We're fixing this. Check back in 2 hours.",
  "code": "SERVICE_UNAVAILABLE"
}
```

Health check endpoint pings yt-dlp with a test URL every 5 minutes. If it fails 3 times in a row, sends Telegram alert.

### 5.4 Schema Markup

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "TikTok Video Downloader",
  "applicationCategory": "UtilitiesApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "Download TikTok videos without watermark in HD quality. Free, no login required.",
  "url": "https://aawebtools.com/tiktok-downloader/"
}
```

### 5.5 Monetization

PropellerAds script loaded async after page content. Two ad zones as specified in 5.2. PropellerAds zone IDs stored in .env and injected server-side by Nginx or as a global JS variable.

**Section 5 deliverable:** Complete tiktok-downloader/index.html (frontend), api/routes/tiktok.js (backend), yt-dlp installed in api/Dockerfile, health check running, Telegram alert on failure.

---

## SECTION 6 — Tool 2: Twitter/X Video Downloader

### 6.1 Page Identity

- URL: https://aawebtools.com/twitter-video-downloader/
- H1: "Twitter Video Downloader — Download X Videos Free"
- Title tag: "Twitter Video Downloader — Download X Videos & GIFs Free | AAWebTools"
- Meta description: "Download Twitter and X videos, GIFs and images for free. No login, works on all devices. Paste the tweet link and download instantly."

### 6.2 Page Layout

Same structure as TikTok downloader (Section 5.2) with these differences:
- Input accepts Twitter/X URLs only
- Tabs: "Video" | "GIF" | "Image"
- Output shows: video thumbnail, duration, "Download MP4" and "Download GIF" options
- FAQ targets Twitter-specific keywords: "how to download twitter videos on iphone", "save twitter gif", "download x video"

### 6.3 Backend API

File: api/routes/twitter.js

Endpoints:
- POST /api/twitter/video — accepts {url: string}, returns download link

Validation:
- URL must match: /^https?:\/\/(www\.|mobile\.)?twitter\.com\/|^https?:\/\/x\.com\//
- Same rate limits as TikTok

Uses same yt-dlp subprocess. Twitter/X has no DRM so this is more stable than TikTok downloads. Same error handling and Telegram alerts.

**Section 6 deliverable:** Complete twitter-video-downloader/index.html, api/routes/twitter.js.

---

## SECTION 7 — Tool 3: Invoice Generator

### 7.1 Page Identity

- URL: https://aawebtools.com/invoice-generator/
- H1: "Free Invoice Generator — No Sign Up Required"
- Title tag: "Free Invoice Generator — No Sign Up, Instant PDF Download | AAWebTools"
- Meta description: "Create professional invoices free online. No registration, no watermark. Download PDF instantly. Supports English and French."
- Primary keyword: "free invoice generator no sign up" (KD 30, CPC $4.26)
- Secondary keywords: "free invoice generator" (KD 52, CPC $5.70), "free online invoice generator" (KD 52, CPC $5.60)

### 7.2 Language Toggle

EN/FR toggle at top of tool card. Switches:
- All labels in the form (From, To, Invoice Number, Date, Due Date, Item, Quantity, Rate, Amount, Tax, Total, Notes, Payment Terms)
- Button text
- Currency defaults ($ for EN, € for FR — but user can change)
- PDF output language

All translations stored in a translations object in the page's JavaScript. No server call for language switch.

### 7.3 Page Layout

**Section A — Hero (dark):**
H1 as above.
Subtext: "Create and download professional invoices in seconds. Free forever, no account needed."
Trust badge row: "✓ No Watermark" | "✓ Instant PDF" | "✓ No Login" | "✓ EN/FR Support"

**Section B — Invoice Tool Card (white, max-width 960px):**
Language toggle top-right of card (EN | FR pill toggle).

Invoice form columns:
- Left: From (your business details — name, address, email, phone)
- Right: To (client details — same fields)

Invoice details row:
- Invoice Number (auto-increments, user can edit)
- Issue Date (date picker)
- Due Date (date picker)

Line items table:
- Columns: Description | Qty | Rate | Amount (auto-calculated)
- "Add Item" button adds new row
- "Remove" button on each row
- Tax rate input (percentage)
- Subtotal, Tax, Total auto-calculated and displayed

Footer fields:
- Notes (textarea — "Thank you for your business")
- Payment Terms (textarea — "Payment due within 30 days")

Signature field: upload an image or draw with mouse (HTML Canvas) — optional.

Logo field: upload business logo — appears in PDF top-right.

Action buttons:
- "Download PDF" (primary — generates and downloads PDF client-side using jsPDF)
- "Preview" (shows a modal with the rendered invoice)
- "Reset" (clears form)

**Ad placement (AdSense):**
- Ad unit 1: Below the tool card
- Ad unit 2: Right sidebar (300x250 desktop only)

**Section C — How It Works:**
Three steps. Same structure as TikTok downloader.

**Section D — FAQ:**
- "How do I create a free invoice online?" (targets main keyword)
- "Can I create an invoice without signing up?" (targets "no sign up" keyword, KD 30)
- "Is there a French invoice generator?" (targets French audience)
- "Can I add my logo to the invoice?"
- "How do I download the invoice as PDF?"

### 7.4 PDF Generation

100% client-side using jsPDF library (loaded from CDN via `<script>` tag). No data ever sent to server for invoice tools. The PDF generation function:
- Reads all form fields
- Draws invoice layout using jsPDF
- Includes logo if uploaded (converted to base64)
- Adds all line items with proper formatting
- Calculates and displays totals
- Triggers browser download with filename: "invoice-[invoice-number].pdf"

### 7.5 Schema Markup

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Free Invoice Generator",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "Create professional invoices free online. No signup required. Instant PDF download.",
  "url": "https://aawebtools.com/invoice-generator/",
  "inLanguage": ["en", "fr"]
}
```

**Section 7 deliverable:** Complete invoice-generator/index.html with full form, jsPDF integration, EN/FR toggle, PDF generation working locally. AdSense placeholder divs in place (actual code added in Section 11).

---

## SECTION 8 — Tools 4+5: AI Detector + AI Humanizer

### 8.1 Strategy

Both tools live on separate pages but are cross-linked prominently. Users who detect AI content immediately need to humanize it — this is the natural flow. Internal link placement: "After detecting AI content → Try our AI Humanizer" and vice versa. This doubles page views and RPM per session.

### 8.2 AI Detector Page Identity

- URL: https://aawebtools.com/ai-detector/
- H1: "Free AI Content Detector"
- Title tag: "Free AI Content Detector — Check ChatGPT, Claude & More | AAWebTools"
- Meta description: "Detect AI-generated text instantly. Works with ChatGPT, Claude, Gemini and all AI writers. Free, no login, paste your text below."
- Primary keyword: "crossplag ai content detector" (KD 16)
- Secondary: "writer.com ai content detector" (KD 21), "free ai content detector" (KD 92 — long-term)

### 8.3 AI Detector — How It Works

The detection uses statistical analysis of text properties — no external API, zero cost:

1. **Perplexity scoring:** Measures how "predictable" the text is. AI text has lower perplexity (more predictable). Implemented using a pre-built word frequency map loaded as a JSON file.

2. **Burstiness scoring:** Human writing has variable sentence lengths (high burstiness). AI writing tends toward uniform sentence lengths (low burstiness).

3. **Combined score:** Weighted combination of perplexity and burstiness produces a 0–100 score. Under 30 = likely human. 30–70 = mixed/uncertain. Over 70 = likely AI.

The accuracy will not match GPTZero or Turnitin. This is acceptable. The page is honest about this: "This tool provides a statistical estimate. For high-stakes decisions, use multiple tools."

Character limit: 5,000 characters per analysis (free). Shown with a live character counter. No premium tier — it's all free.

### 8.4 AI Detector Page Layout

**Tool card:**
- Large textarea: "Paste your text here..." (5,000 char limit, counter shown)
- "Detect AI Content" button (primary)
- Results area: appears after analysis
  - Large percentage circle (CSS-only, animated fill): shows AI probability %
  - Label: "Likely AI Generated" / "Possibly AI / Mixed" / "Likely Human"
  - Short explanation of the score
  - Highlighted sentences that triggered the detection (shown in the textarea with color coding)
  - CTA: "Want to make this text sound more human? Try our AI Humanizer →"

**Ad placement:** Same as invoice generator.

### 8.5 AI Humanizer Page Identity

- URL: https://aawebtools.com/ai-humanizer/
- H1: "AI Text Humanizer — Make AI Writing Sound Natural"
- Title tag: "Free AI Text Humanizer — Make AI Content Undetectable | AAWebTools"
- Meta description: "Transform AI-generated text into natural human writing. Free tool, no login, works with ChatGPT and all AI writers. Paste text below."

### 8.6 AI Humanizer — How It Works

Uses the Claude API (claude-haiku-3-5-20251001 — cheapest model, fast). The API call is made from the Node.js backend (never expose API key to frontend).

System prompt sent to Claude:
```
Rewrite the following text to sound more natural and human-written. 
Vary sentence length, use contractions where appropriate, add slight 
imperfections in structure that humans naturally produce. 
Keep the meaning and information identical. 
Return only the rewritten text, nothing else.
```

Character limit: 1,000 characters per request (free tier) to control API costs. Rate limit: 3 requests per minute per IP.

API endpoint: POST /api/humanizer — accepts {text: string}, returns {humanized: string}.

Cost management: claude-haiku-3-5-20251001 costs $1 per 1M input tokens. At 1,000 characters (~250 tokens) per request, cost is $0.00025 per request. At 1,000 requests/day = $0.25/day. AdSense revenue from the page far exceeds this cost.

### 8.7 AI Humanizer Page Layout

**Tool card:**
- Two panels side by side (stacked on mobile):
  - Left: "Original AI Text" (input textarea, 1,000 char limit)
  - Right: "Humanized Text" (output, read-only, copy button)
- "Humanize Text" button (full-width below both panels)
- Loading: spinner, message "Rewriting your text..."
- CTA below results: "Check if it passes AI detection → Try AI Detector"

**Section 8 deliverable:** ai-detector/index.html with working perplexity analysis, ai-humanizer/index.html with Claude API integration via Node.js backend, new route api/routes/humanizer.js.

---

## SECTION 9 — Tool 6: Pay Stub Generator

### 9.1 Page Identity

- URL: https://aawebtools.com/paystub-generator/
- H1: "Free Pay Stub Generator — Instant PDF Download"
- Title tag: "Free Pay Stub Generator — No Signup, Instant PDF | AAWebTools"
- Meta description: "Create professional pay stubs free online. For freelancers, gig workers and small businesses. No login required. English and French."

### 9.2 Page Layout

Same structure as invoice generator with these field differences:

**Employee section:** Name, Address, Social Security (last 4 digits only — privacy), Employee ID (optional)

**Employer section:** Company name, Address, EIN/Business Number (optional)

**Pay period:** Pay period start/end dates, Pay date, Pay period type (Weekly/Bi-weekly/Semi-monthly/Monthly)

**Earnings table:**
- Regular hours (rate × hours = amount)
- Overtime hours (optional, rate × 1.5 × hours)
- Additional earnings rows (bonus, commission, tips)

**Deductions table:**
- Federal tax (calculated or manual entry)
- Provincial/State tax (calculated or manual entry)
- CPP/Social Security (optional)
- EI/Unemployment Insurance (optional)
- Other deductions (custom rows)

**Calculated totals:**
- Gross Pay
- Total Deductions
- Net Pay

EN/FR toggle: switches all labels between English and French equivalents. French version uses Canadian French terminology (Relevé d'emploi, Retenues, Salaire net, etc.).

PDF generation: same jsPDF approach as invoice generator. Professional layout with employer logo option.

**Section 9 deliverable:** Complete paystub-generator/index.html with full form, jsPDF integration, EN/FR toggle, PDF download working.

---

## SECTION 10 — SEO Layer

### 10.1 Schema per Tool

Each tool page has its SoftwareApplication schema defined in its respective section above. The homepage has WebSite schema. Nothing additional needed here — schemas are already specified.

### 10.2 Internal Linking Strategy

Every tool page links to exactly 2 other tools in a "Related Tools" section at the bottom. The linking pattern:
- TikTok Downloader → Twitter Downloader, Invoice Generator
- Twitter Downloader → TikTok Downloader, Invoice Generator
- Invoice Generator → Pay Stub Generator, AI Detector
- AI Detector → AI Humanizer, Invoice Generator
- AI Humanizer → AI Detector, Pay Stub Generator
- Pay Stub Generator → Invoice Generator, AI Humanizer

Homepage links to all 6 tools. This creates a complete internal link graph that distributes domain authority to all pages from day 1.

### 10.3 Google Search Console

On the homepage `<head>`, add the GSC verification meta tag. The actual value is provided separately after the site is live and verified with Google.

```html
<!-- Google Search Console verification -->
<meta name="google-site-verification" content="[GSC_VERIFICATION_CODE]">
```

After site is deployed, submit sitemap.xml in GSC manually.

### 10.4 Page Speed Optimizations

These must be implemented in every page:
- All images have explicit `width` and `height` attributes to prevent CLS
- Images below the fold use `loading="lazy"`
- Hero images (if any) use `loading="eager"` and `fetchpriority="high"`
- CSS is the only render-blocking resource — and it is under 25KB
- No JavaScript is render-blocking — all scripts use `async` or `defer`
- Font display: swap used for Inter

**Section 10 deliverable:** Verification that all pages have correct schema, canonical tags, OG tags, and that Lighthouse scores meet targets.

---

## SECTION 11 — Ad Placement

### 11.1 PropellerAds (Tools 1 and 2 — Downloaders)

PropellerAds script loaded async after page content. Two ad formats:
- Push notification subscription prompt (opt-in — user must accept, not forced)
- Display banner below tool card

Script placement: before closing `</body>` tag with `async` attribute. Zone IDs from .env.

### 11.2 AdSense (Tools 3, 4, 5, 6)

Three ad units per page:
- Unit 1: Below hero, above tool card — Responsive (728x90 desktop, 320x50 mobile)
- Unit 2: Below tool card — Responsive (728x90 desktop, 320x100 mobile)
- Unit 3: Right sidebar — Fixed (300x250, desktop only, hidden below 1024px)

All AdSense scripts loaded with `async` attribute. Ad containers have min-height set to prevent CLS when ads load. Publisher ID from .env.

### 11.3 Ad Loading Rule

Ads must never block the tool from loading. Load order:
1. HTML and CSS (immediate)
2. Tool functionality JavaScript (deferred)
3. Analytics (async)
4. Ad scripts (async, last)

If ad script fails to load, tool still works perfectly.

**Section 11 deliverable:** Ad placement code added to all relevant tool pages with correct async loading.

---

## SECTION 12 — Monitoring Stack

### 12.1 Uptime Kuma Configuration

Accessible at: https://monitor.aawebtools.com (IP-restricted)

Monitors to configure after deployment:
1. https://aawebtools.com/ — HTTP, every 60 seconds
2. https://aawebtools.com/tiktok-downloader/ — HTTP, every 60 seconds
3. https://aawebtools.com/twitter-video-downloader/ — HTTP, every 60 seconds
4. https://aawebtools.com/invoice-generator/ — HTTP, every 60 seconds
5. https://aawebtools.com/ai-detector/ — HTTP, every 60 seconds
6. https://aawebtools.com/ai-humanizer/ — HTTP, every 60 seconds
7. https://aawebtools.com/paystub-generator/ — HTTP, every 60 seconds
8. https://aawebtools.com/api/health — HTTP/JSON, every 60 seconds

Telegram notification: configured with owner's Telegram bot token and chat ID (from .env). Alert on: site down, site recovered, SSL expiring in 14 days.

Alert message format:
```
🔴 DOWN: [tool name] is unreachable
Time: [timestamp]
URL: [url]
Site: aawebtools.com
```

Recovery message:
```
✅ RECOVERED: [tool name] is back online
Downtime: [duration]
```

### 12.2 Netdata

Accessible at: https://netdata.aawebtools.com (IP-restricted)

Monitors VPS resources in real time:
- CPU usage per core
- RAM usage
- Disk I/O
- Network bandwidth
- Per-container stats (Docker integration)

Alert thresholds (Netdata built-in alerts):
- CPU > 85% for 5 minutes → Telegram alert
- RAM > 90% → Telegram alert
- Disk > 80% → Telegram alert

### 12.3 Health Check Endpoint

Node.js route GET /api/health returns:

```json
{
  "status": "ok",
  "timestamp": "2026-03-27T10:00:00Z",
  "services": {
    "tiktok_api": "ok",
    "twitter_api": "ok",
    "humanizer_api": "ok",
    "ytdlp_version": "2026.x.x"
  },
  "uptime_seconds": 86400
}
```

If any service check fails, status returns "degraded" and Telegram alert fires.

**Section 12 deliverable:** Uptime Kuma running and accessible, Netdata running and accessible, health endpoint returning correct JSON, Telegram alerts tested and working.

---

## SECTION 13 — Nginx Final Configuration

### 13.1 Complete nginx.conf

```nginx
worker_processes auto;
worker_rlimit_nofile 65535;

events {
  worker_connections 1024;
  multi_accept on;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;
  
  # Rate limiting zones
  limit_req_zone $binary_remote_addr zone=general:10m rate=30r/m;
  limit_req_zone $binary_remote_addr zone=api:10m rate=10r/m;
  limit_req_zone $binary_remote_addr zone=download:10m rate=5r/m;
  
  # Gzip compression
  gzip on;
  gzip_vary on;
  gzip_min_length 1000;
  gzip_proxied any;
  gzip_types text/plain text/css text/xml application/json 
             application/javascript text/javascript application/xml;
  
  # Security headers
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
  
  # Cache static assets
  location ~* \.(css|js|png|jpg|svg|ico|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
  
  include /etc/nginx/conf.d/*.conf;
}
```

### 13.2 Virtual Host Configuration (aawebtools.conf)

Full HTTPS configuration with HTTP redirect, proxy to Node.js API, static file serving, and subdomain routing for monitoring tools.

### 13.3 Docker Compose Final

Complete production-ready docker-compose.yml with all 7 containers, health checks, restart policies, volume mounts, and environment variable injection.

**Section 13 deliverable:** Final nginx.conf, aawebtools.conf, and docker-compose.yml. Full stack starts with `docker-compose up -d`. All containers healthy. All URLs resolve correctly.

---

## LAUNCH CHECKLIST (after all sections complete)

Before going live, verify:

- [ ] All 6 tools work end-to-end in Docker
- [ ] PDF generation works for invoice and paystub
- [ ] TikTok and Twitter downloads work
- [ ] AI detector produces scores
- [ ] AI humanizer rewrites text
- [ ] Language toggle works for EN/FR on invoice and paystub
- [ ] Lighthouse score ≥ 90 on mobile for all pages
- [ ] All pages load in < 2 seconds on throttled 4G
- [ ] SSL certificate active and auto-renewal configured
- [ ] robots.txt accessible
- [ ] sitemap.xml submitted to Google Search Console
- [ ] Uptime Kuma monitoring all URLs
- [ ] Telegram alerts tested (force a downtime, confirm alert received)
- [ ] Netdata dashboard accessible
- [ ] PropellerAds account approved and zones live on downloader pages
- [ ] AdSense application submitted (after 2 weeks of traffic on invoice page)
- [ ] .env file not in git repository
- [ ] All error states tested (invalid URL, API failure, PDF generation failure)

---

## POST-LAUNCH ACTIONS (Week 1)

1. Submit to ProductHunt — write copy targeting developers and freelancers
2. Post in Reddit: r/webdev, r/SideProject, r/entrepreneur, r/Entrepreneur (separate post per community, written differently)
3. Submit aawebtools.com to AlternativeTo.net as alternative to ssstik.io, invoice-generator.com
4. Submit to GitHub awesome-selfhosted and awesome-tools lists
5. Post in Hacker News "Show HN" thread

Target: 30 natural backlinks in week 1.

---

*End of PRD — Version 1.0*
*Next step: Give this PRD to GSD with the prompt in the GROUND RULES section and start with Section 0 only.*
