# Monitoring Stack — aawebtools.com

## Overview

Three monitoring tools run as Docker containers, all IP-restricted to the owner's IP address.

| Tool | URL | Purpose | Port (internal) |
|------|-----|---------|----------------|
| Uptime Kuma | https://monitor.aawebtools.com | Uptime monitoring + alerts | 3001 |
| Netdata | https://netdata.aawebtools.com | Server performance dashboard | 19999 |
| Umami | https://analytics.aawebtools.com | Privacy-first web analytics | 3000 |

All dashboards are accessible only from the IP address set in `OWNER_IP` in `.env`.

---

## Uptime Kuma

### First Login
1. Navigate to https://monitor.aawebtools.com
2. Create your admin account on first visit
3. Set a strong password (Uptime Kuma stores it locally)

### Import Monitors
1. Go to Settings > Backup > Import
2. Upload `monitoring/uptime-kuma/config.json`
3. This creates all 8 monitors + Telegram notification

### Configure Telegram Notifications
1. Go to Settings > Notifications
2. Edit "Telegram - AAWebTools"
3. Replace `${TELEGRAM_BOT_TOKEN}` with your real bot token
4. Replace `${TELEGRAM_CHAT_ID}` with your real chat ID
5. Click "Test" to verify
6. Save

### 8 Monitors Configured
| # | Name | URL | Type | Interval |
|---|------|-----|------|----------|
| 1 | Homepage | https://aawebtools.com/ | HTTP | 60s |
| 2 | TikTok Downloader | https://aawebtools.com/tiktok-downloader/ | HTTP | 60s |
| 3 | Twitter Downloader | https://aawebtools.com/twitter-video-downloader/ | HTTP | 60s |
| 4 | Invoice Generator | https://aawebtools.com/invoice-generator/ | HTTP | 60s |
| 5 | AI Detector | https://aawebtools.com/ai-detector/ | HTTP | 60s |
| 6 | AI Humanizer | https://aawebtools.com/ai-humanizer/ | HTTP | 60s |
| 7 | Pay Stub Generator | https://aawebtools.com/paystub-generator/ | HTTP | 60s |
| 8 | API Health | https://aawebtools.com/api/health | Keyword "success" | 60s |

### Adding a New Monitor
1. Click "+ Add New Monitor"
2. Set type: HTTP(s)
3. Enter the URL
4. Set interval to 60 seconds
5. Enable notification group "Telegram - AAWebTools"
6. Save

---

## Netdata

### Access
Navigate to https://netdata.aawebtools.com (IP-restricted).
No login required — dashboard is read-only.

### What It Monitors
- CPU usage per core
- RAM usage
- Disk I/O and space
- Network bandwidth
- Docker container stats

### Alert Configuration
Alerts are defined in `monitoring/netdata/alerts.conf`:

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| CPU usage | > 85% for 5 min | > 95% | Telegram alert |
| RAM usage | > 90% | > 95% | Telegram alert |
| Disk space | > 80% | > 90% | Telegram alert |

### Deploy Alert Config
```bash
# Copy to Netdata config directory
sudo cp monitoring/netdata/alerts.conf /etc/netdata/health.d/aawebtools.conf
sudo cp monitoring/netdata/health_alarm_notify.conf /etc/netdata/health_alarm_notify.conf

# Replace placeholders with real values
sudo sed -i "s/\${TELEGRAM_BOT_TOKEN}/YOUR_BOT_TOKEN/" /etc/netdata/health_alarm_notify.conf
sudo sed -i "s/\${TELEGRAM_CHAT_ID}/YOUR_CHAT_ID/" /etc/netdata/health_alarm_notify.conf

# Restart Netdata
sudo systemctl restart netdata
```

---

## Umami Analytics

### First Login
1. Navigate to https://analytics.aawebtools.com
2. Default login: `admin` / `umami`
3. Change the password immediately
4. Create a website entry for aawebtools.com
5. Copy the Website ID into `.env` as `UMAMI_SITE_ID`

### What It Tracks
- Page views per tool
- Visitor count (unique)
- Referrer sources
- Country breakdown
- Device types
- No cookies, GDPR-compliant

---

## Health Endpoint

### URL
```
GET https://aawebtools.com/api/health
```

### Response Format
```json
{
  "success": true,
  "timestamp": "2026-03-27T10:00:00.000Z",
  "services": {
    "tiktok_api": { "status": "ok", "message": "yt-dlp available" },
    "twitter_api": { "status": "ok", "message": "yt-dlp available" },
    "humanizer_api": { "status": "ok", "message": "Claude API configured" }
  },
  "uptime_seconds": 86400,
  "ytdlp_version": "2026.03.17"
}
```

### Service Statuses
| Service | Status | Meaning |
|---------|--------|---------|
| tiktok_api | `ok` | yt-dlp is installed and responding |
| tiktok_api | `degraded` | yt-dlp failed 3+ consecutive checks |
| twitter_api | `ok` / `degraded` | Same as tiktok (shared yt-dlp) |
| humanizer_api | `ok` | ANTHROPIC_API_KEY is set in .env |
| humanizer_api | `no_key` | ANTHROPIC_API_KEY not configured |

### Automated Monitoring
- yt-dlp is checked every 5 minutes
- After 3 consecutive failures, Telegram alert fires
- On recovery, another Telegram alert confirms restoration

---

## Testing Telegram Alerts

### Manual Test
```bash
# Replace with your real values
TOKEN="your-bot-token"
CHAT_ID="your-chat-id"

curl -s -X POST "https://api.telegram.org/bot${TOKEN}/sendMessage" \
  -d chat_id="${CHAT_ID}" \
  -d text="Test alert from aawebtools.com monitoring"
```

### Verify Bot Token
```bash
curl -s "https://api.telegram.org/bot${TOKEN}/getMe" | python3 -m json.tool
```
Should return `"ok": true` with bot username.

### Force Downtime Test
1. Stop the nginx container: `docker compose stop nginx`
2. Wait 60-90 seconds for Uptime Kuma to detect
3. Verify Telegram receives DOWN alert
4. Restart: `docker compose start nginx`
5. Verify Telegram receives RECOVERED alert
