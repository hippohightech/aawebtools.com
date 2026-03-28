#!/usr/bin/env bash
# deploy.sh — Deploy or update aawebtools.com
set -e

echo "=== aawebtools.com deployment ==="
echo ""

# Check .env exists
if [ ! -f .env ]; then
    echo "ERROR: .env file not found. Copy .env.example to .env and fill in values."
    exit 1
fi

# Pull latest images and build
echo "Pulling images and building..."
docker compose pull --quiet
docker compose up -d --build

# Wait for containers
echo "Waiting for containers to start..."
sleep 15

# Show status
echo ""
echo "=== Container Status ==="
docker compose ps
echo ""

# Test health endpoint
echo "=== Health Check ==="
if curl -sf http://localhost/api/health > /dev/null 2>&1; then
    echo "OK: API health endpoint responding"
    curl -s http://localhost/api/health | python3 -m json.tool 2>/dev/null || true
else
    echo "WARNING: API health check failed (may need more time to start)"
fi

echo ""
echo "=== Deployment complete ==="
echo ""
echo "Site:      https://aawebtools.com"
echo "Monitor:   https://monitor.aawebtools.com"
echo "Analytics: https://analytics.aawebtools.com"
echo "Netdata:   https://netdata.aawebtools.com"
echo ""
echo "Next steps:"
echo "1. Verify .env has all real values"
echo "2. Run: sudo certbot --nginx -d aawebtools.com -d '*.aawebtools.com'"
echo "3. Import Uptime Kuma config: monitoring/uptime-kuma/config.json"
echo "4. Submit sitemap: https://aawebtools.com/sitemap.xml to Google Search Console"
echo "5. Run: ./scripts/configure-fail2ban.sh"
