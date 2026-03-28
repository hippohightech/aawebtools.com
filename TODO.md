# TODO — Section Build Tracker
**Project:** aawebtools.com  
**Build method:** GSD + Claude Code, one section at a time  
**Rule:** Check off each section only after Docker test passes locally

---

## Build Progress

- [x] **Section 0** — Security architecture
  - [x] nginx.conf with rate limits + security headers
  - [x] .env.example with all variables
  - [x] fail2ban jail configuration
  - [x] UFW rules documented
  - [x] Docker networking rules

- [x] **Section 1** — Project scaffold + Docker Compose
  - [x] Full folder structure created
  - [x] docker-compose.yml with all 7 containers
  - [x] All Dockerfiles written
  - [x] tools.json registry created
  - [x] `docker-compose up` runs without errors
  - [x] All containers show healthy status

- [x] **Section 2** — Design system
  - [x] main.css with all CSS variables
  - [x] All component styles
  - [x] Animation system (scroll reveal, hover states)
  - [x] Responsive breakpoints (mobile-first)
  - [x] core.js with Intersection Observer only
  - [x] Lighthouse score ≥ 90 confirmed on a test page

- [x] **Section 3** — Shared components
  - [x] HTML template (head structure)
  - [x] Navigation (desktop + mobile)
  - [x] Footer
  - [x] 404.html
  - [x] Error state component
  - [x] robots.txt
  - [x] sitemap.xml
  - [x] Google Search Console meta tag placeholder

- [x] **Section 4** — Homepage
  - [x] index.html complete
  - [x] Hero section with animations
  - [x] Tools grid reading from tools.json
  - [x] Stats bar section
  - [x] Schema markup
  - [x] All links work
  - [x] Lighthouse ≥ 90 on mobile

- [x] **Section 5** — TikTok Downloader
  - [x] tiktok-downloader/index.html complete
  - [x] Three tabs (Video, Photo, Profile Picture)
  - [x] api/routes/tiktok.js complete
  - [x] yt-dlp installed in Dockerfile
  - [x] Health check endpoint working
  - [x] Telegram alert on API failure tested
  - [x] PropellerAds placeholders in place
  - [x] FAQ section with correct keywords
  - [x] Schema markup

- [x] **Section 6** — Twitter Video Downloader
  - [x] twitter-video-downloader/index.html complete
  - [x] api/routes/twitter.js complete
  - [x] Same health check pattern as TikTok
  - [x] PropellerAds placeholders in place
  - [x] Schema markup

- [x] **Section 7** — Invoice Generator
  - [x] invoice-generator/index.html complete
  - [x] Full form (From, To, line items, tax, totals)
  - [x] PDF generation working (jsPDF)
  - [x] EN/FR language toggle working
  - [x] PDF output correct in both languages
  - [x] AdSense placeholder divs in place
  - [x] FAQ with correct keywords
  - [x] Schema markup

- [x] **Section 8** — AI Detector + AI Humanizer
  - [x] ai-detector/index.html complete
  - [x] Perplexity scoring working in browser
  - [x] Results display (percentage circle, highlighted text)
  - [x] ai-humanizer/index.html complete
  - [x] api/routes/humanizer.js complete
  - [x] Claude API integration working
  - [x] 1,000 character limit enforced
  - [x] Both tools cross-link to each other
  - [x] AdSense placeholders in place
  - [x] Schema markup for both

- [x] **Section 9** — Pay Stub Generator
  - [x] paystub-generator/index.html complete
  - [x] Full form (employee, employer, earnings, deductions)
  - [x] Calculations correct (gross, deductions, net)
  - [x] PDF generation working
  - [x] EN/FR toggle working
  - [x] Canadian French terminology correct
  - [x] AdSense placeholders in place
  - [x] Schema markup

- [x] **Section 10** — SEO Layer
  - [x] All pages: canonical tags correct
  - [x] All pages: OG tags correct
  - [x] All pages: Twitter card tags correct
  - [x] All pages: Schema markup validated
  - [x] Internal linking pattern verified
  - [x] Google Search Console verification code added

- [x] **Section 11** — Ad Placement
  - [x] PropellerAds code added to tools 1 and 2
  - [x] AdSense code added to tools 3, 4, 5, 6
  - [x] All ad scripts loading async (after page content)
  - [x] Ad containers have min-height (no CLS)
  - [x] Tools still function if ad script fails to load

- [x] **Section 12** — Monitoring Stack
  - [x] Uptime Kuma accessible at monitor.aawebtools.com
  - [x] All 8 monitors configured in Uptime Kuma
  - [x] Telegram notifications tested (forced downtime test)
  - [x] Netdata accessible at netdata.aawebtools.com
  - [x] Netdata alerts configured (CPU, RAM, disk)
  - [x] Health endpoint returning correct JSON
  - [x] Umami accessible at analytics.aawebtools.com

- [x] **Section 13** — Nginx Final Config
  - [x] Complete nginx.conf deployed
  - [x] All URLs route correctly
  - [x] Gzip compression working
  - [x] Static asset caching working (1 year)
  - [x] SSL certificate active
  - [x] HTTP → HTTPS redirect working
  - [x] Monitoring subdomains IP-restricted

---

## Launch Checklist (after all sections complete)

- [ ] All 6 tools work end-to-end
- [ ] PDF generation works for invoice and paystub
- [ ] TikTok downloads working
- [ ] Twitter downloads working
- [ ] AI detector scoring text
- [ ] AI humanizer rewriting text
- [ ] EN/FR toggle works on invoice and paystub
- [ ] Lighthouse ≥ 90 on all pages
- [ ] All pages load < 2 seconds on throttled 4G
- [ ] SSL active and auto-renewal configured
- [ ] robots.txt accessible
- [ ] sitemap.xml submitted to Google Search Console
- [ ] Uptime Kuma monitoring all URLs
- [ ] Telegram alerts tested and working
- [ ] Netdata dashboard accessible
- [ ] .env file not in git
- [ ] All error states tested

---

## Post-Launch Actions (Week 1)

- [ ] Submit to ProductHunt
- [ ] Post in r/webdev
- [ ] Post in r/SideProject
- [ ] Post in r/entrepreneur
- [ ] Submit to AlternativeTo.net
- [ ] Submit to Hacker News (Show HN)
- [ ] Submit to GitHub awesome-selfhosted list
- [ ] Apply for PropellerAds (tools 1 and 2 live)
- [ ] Apply for AdSense (after 2 weeks with tool 3 live)
