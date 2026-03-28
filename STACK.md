# STACK — Technical Constraints
**Status:** Locked. Every decision here is final.  
**For:** GSD + Claude Code  
**Rule:** If a technology is not listed here as approved, it is not allowed.

---

## Approved Technologies — Frontend

| Layer | Technology | Version | Notes |
|---|---|---|---|
| HTML | HTML5 | Latest standard | Semantic elements required |
| CSS | Vanilla CSS3 | Latest standard | CSS variables, no preprocessors |
| JavaScript | Vanilla ES6+ | Native browser | No frameworks, no bundlers |
| Fonts | Google Fonts — Inter | 400, 500, 600, 700 | async load only |
| PDF generation | jsPDF | Latest CDN | Client-side only |
| Charts | None | — | Not needed at this stage |

**Explicitly banned on frontend:**
- React, Vue, Angular, Svelte — any JS framework
- Bootstrap, Tailwind, Bulma — any CSS framework
- jQuery — any DOM library
- GSAP, Framer Motion, Anime.js — any animation library
- Webpack, Vite, Parcel — any bundler
- TypeScript — use plain JavaScript

---

## Approved Technologies — Backend (Node.js API)

| Layer | Technology | Notes |
|---|---|---|
| Runtime | Node.js 20 LTS | Alpine Docker image |
| Framework | Express 4.x | Minimal, no decorators |
| CORS | cors npm package | Domain-locked to aawebtools.com |
| Rate limiting | express-rate-limit | Applied per route |
| Process management | Docker restart policy | Not PM2 |
| Video download | yt-dlp | Subprocess, not npm package |
| HTTP client | node-fetch or axios | For external API calls |
| Environment | dotenv | .env file, never hardcoded |

**API uses Claude for AI humanizer only:**
- Model: claude-haiku-4-5-20251001
- SDK: @anthropic-ai/sdk
- Called from backend only — API key never exposed to frontend

---

## Approved Technologies — Python API

| Layer | Technology | Notes |
|---|---|---|
| Runtime | Python 3.11 | Slim Docker image |
| Framework | FastAPI | Async, minimal |
| ASGI server | uvicorn | Production server |
| Package manager | pip with requirements.txt | No poetry, no conda |

The Python API container is created empty (skeleton only) in Section 1. 
No Python tools are built until a future phase requires them.

---

## Approved Technologies — Infrastructure

| Layer | Technology | Notes |
|---|---|---|
| Reverse proxy | Nginx Alpine | Static files + proxy |
| Containerization | Docker + Docker Compose | Compose v3.8 |
| SSL | Let's Encrypt + Certbot | Auto-renewal cron |
| Firewall | UFW | 3 ports only |
| Intrusion prevention | Fail2ban | Nginx log monitoring |
| Process isolation | Docker networks | Internal only |

---

## Approved Technologies — Monitoring Stack

| Tool | Purpose | Port (internal) |
|---|---|---|
| Uptime Kuma | Uptime monitoring + alerts | 3001 |
| Netdata | Server performance dashboard | 19999 |
| Umami | Privacy-first web analytics | 3002 |
| PostgreSQL 15 | Umami database | 5432 (internal) |

All monitoring tools run as Docker containers.
All monitoring dashboards are IP-restricted (owner IP only).
All alerts go to Telegram via bot token in .env.

---

## File Naming Conventions

```
HTML files:     lowercase, hyphen-separated (index.html, not Index.html)
CSS files:      main.css only (one file for all pages)
JS files:       core.js (shared), [tool-name].js (tool-specific)
API routes:     [tool-name].js (tiktok.js, twitter.js, humanizer.js)
Docker files:   Dockerfile (capital D, no extension)
Config files:   lowercase with extensions (.env, nginx.conf)
```

---

## Import Rules

**CDN allowed list (these only):**
- fonts.googleapis.com (Inter font)
- fonts.gstatic.com (Inter font files)
- cdnjs.cloudflare.com (jsPDF only)
- unpkg.com (only if cdnjs not available for a specific package)

**No other external resources.** No images from external URLs. No scripts from unknown CDNs.

---

## Code Quality Rules

- No console.log in production code (use only during development, remove before commit)
- No commented-out code blocks in final files
- No TODO comments in final files — TODOs go in TODO.md only
- All async functions use try/catch with proper error handling
- All API endpoints return consistent JSON: `{success: bool, data: any, message: string}`
- All user-facing error messages are generic — never expose stack traces or internal errors

---

## Docker Rules

- All containers use specific version tags — never `latest` tag
  - Exception: louislam/uptime-kuma:1 (Uptime Kuma official)
- All containers have `restart: always` policy
- No container exposes ports directly — only through Nginx
- Secrets only via .env file and Docker environment variables
- No secrets in Dockerfiles or docker-compose.yml values (use ${VARIABLE} syntax)

---

## Environment Variables — Complete List

All variables defined in .env.example. All required unless marked optional.

```
# Server
NODE_ENV=production

# Telegram alerts
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Analytics
UMAMI_SITE_ID=
UMAMI_APP_SECRET=

# Monetization
PROPELLERADS_ZONE_TIKTOK=
PROPELLERADS_ZONE_TWITTER=
ADSENSE_PUBLISHER_ID=

# AI API (for humanizer tool)
ANTHROPIC_API_KEY=

# Monitoring (optional — IP to allowlist for monitoring dashboards)
OWNER_IP=
```

---

## Performance Rules — Non-negotiable

Every page must achieve:
- Lighthouse Performance score ≥ 90 on mobile
- LCP < 2.5 seconds
- CLS = 0 (all images have explicit width + height attributes)
- Page total weight < 200KB uncompressed
- Zero render-blocking resources except main.css

To achieve this:
- main.css loaded in `<head>` (only render-blocking resource — kept under 25KB)
- All JS loaded with `defer` attribute
- All ad scripts loaded with `async` attribute, after page content
- All fonts loaded with `display=swap`
- No images without explicit width and height attributes
- No layout shift from ads (ad containers have min-height set before ad loads)
