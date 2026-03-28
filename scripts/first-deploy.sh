#!/usr/bin/env bash
# first-deploy.sh — Fresh VPS setup for aawebtools.com
# Run as root on a fresh Hostinger VPS (Ubuntu 22.04+)
set -e

echo "=== aawebtools.com — First Deployment ==="
echo ""

# 1. System updates
echo "[1/7] Updating system..."
apt update -y && apt upgrade -y

# 2. Install Docker
echo "[2/7] Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi
echo "Docker: $(docker --version)"

# 3. Install Docker Compose plugin (if not included)
if ! docker compose version &> /dev/null; then
    apt install -y docker-compose-plugin
fi
echo "Compose: $(docker compose version)"

# 4. Install Certbot
echo "[3/7] Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# 5. Install and configure Fail2ban
echo "[4/7] Installing Fail2ban..."
apt install -y fail2ban
systemctl enable fail2ban

# 6. Configure UFW firewall
echo "[5/7] Configuring firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
echo "y" | ufw enable
ufw status verbose

# 7. Check .env
echo "[6/7] Checking configuration..."
if [ ! -f .env ]; then
    echo "Creating .env from template..."
    cp .env.example .env
    echo "IMPORTANT: Edit .env with real values before continuing."
    echo "  nano .env"
    echo ""
    echo "Press Enter after editing .env, or Ctrl+C to abort."
    read -r
fi

# 8. Deploy with Fail2ban
echo "[7/7] Deploying..."
chmod +x scripts/configure-fail2ban.sh scripts/deploy.sh
./scripts/configure-fail2ban.sh
./scripts/deploy.sh

# 9. SSL certificate
echo ""
echo "=== Getting SSL certificate ==="
echo "Run this command manually:"
echo "  certbot --nginx -d aawebtools.com -d monitor.aawebtools.com -d netdata.aawebtools.com -d analytics.aawebtools.com"
echo ""
echo "=== First deployment complete ==="
