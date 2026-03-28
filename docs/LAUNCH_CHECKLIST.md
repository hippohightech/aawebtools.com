# Launch Checklist — aawebtools.com

## Pre-Launch Verification

### Tools — End-to-End Testing
- [ ] TikTok Downloader: paste URL, get download link
- [ ] Twitter Downloader: paste URL, get download link
- [ ] Invoice Generator: fill form, download PDF, verify all fields
- [ ] Invoice Generator: switch to FR, download PDF, verify French labels
- [ ] AI Detector: paste AI text, score > 70; paste human text, score < 40
- [ ] AI Humanizer: paste text, get rewritten result, copy button works
- [ ] Pay Stub Generator: select each country, verify deductions change
- [ ] Pay Stub Generator: download PDF for USA, UK, France — verify layouts

### PDF Generation
- [ ] Invoice PDF: all 5 templates render correctly
- [ ] Invoice PDF: logo appears when uploaded
- [ ] Invoice PDF: signature appears when drawn
- [ ] Invoice PDF: multi-tax lines appear correctly
- [ ] Pay Stub PDF: all 3 templates render correctly
- [ ] Pay Stub PDF: currency symbol matches selected country
- [ ] Pay Stub PDF: YTD section appears when filled

### Language Toggle
- [ ] EN/FR toggle works on all pages (nav + mobile)
- [ ] Invoice: all labels switch to French
- [ ] Invoice: PDF output uses French labels in FR mode
- [ ] Pay Stub: all labels switch to French
- [ ] Pay Stub: Quebec deductions appear in FR mode

### Performance
- [ ] Lighthouse ≥ 90 on all pages (mobile, production)
- [ ] All pages load < 2 seconds on throttled 4G
- [ ] CLS < 0.1 on all pages
- [ ] No render-blocking JS (all deferred or async)

### SEO
- [ ] robots.txt accessible at /robots.txt
- [ ] sitemap.xml accessible at /sitemap.xml
- [ ] sitemap.xml submitted to Google Search Console
- [ ] Google Search Console verification code in homepage
- [ ] All pages have canonical tags
- [ ] All pages have OG + Twitter Card meta tags
- [ ] All pages have schema markup (SoftwareApplication)

### Security
- [ ] SSL certificate active (https://aawebtools.com)
- [ ] SSL auto-renewal configured (certbot cron)
- [ ] HTTP → HTTPS redirect working (301)
- [ ] HSTS header present
- [ ] CSP header present
- [ ] X-Frame-Options header present
- [ ] .env file NOT in git repository
- [ ] Attack paths blocked (wp-admin, .env, .git return 444)
- [ ] Fail2ban running with 3 jails active
- [ ] Rate limiting active (429 on abuse)

### Monitoring
- [ ] Uptime Kuma: 8 monitors configured and green
- [ ] Telegram: DOWN alert received (test by stopping nginx)
- [ ] Telegram: RECOVERED alert received (restart nginx)
- [ ] Netdata: dashboard accessible, shows CPU/RAM/disk
- [ ] Netdata: Telegram alerts configured
- [ ] Health endpoint: /api/health returns success JSON
- [ ] Health endpoint: all 3 services show status

### Monetization
- [ ] PropellerAds: account approved
- [ ] PropellerAds: zone IDs in .env for TikTok + Twitter pages
- [ ] AdSense: application submitted (after 2 weeks of traffic)
- [ ] Ad containers visible on all 6 tool pages
- [ ] Tools still work when ads fail to load

### Infrastructure
- [ ] All 7 Docker containers running (docker compose ps)
- [ ] All containers have restart: always
- [ ] UFW firewall: only ports 22, 80, 443 open
- [ ] Gzip compression working
- [ ] Static assets return Cache-Control: immutable, 1y

---

## Post-Launch Actions (Week 1)

- [ ] Submit to ProductHunt
- [ ] Post in r/webdev
- [ ] Post in r/SideProject
- [ ] Post in r/entrepreneur
- [ ] Submit to AlternativeTo.net (vs ssstik.io, invoice-generator.com)
- [ ] Submit to GitHub awesome-selfhosted list
- [ ] Submit to Hacker News (Show HN)
- [ ] Apply for PropellerAds (with live downloader pages)
- [ ] Apply for AdSense (after 2 weeks with invoice page live)
- [ ] Target: 30 natural backlinks in week 1
