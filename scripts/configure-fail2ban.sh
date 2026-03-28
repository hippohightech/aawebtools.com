#!/usr/bin/env bash
# configure-fail2ban.sh — Inject Telegram credentials into fail2ban config
#
# Reads TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID from the project .env file
# and writes the real values into fail2ban/jail.local, replacing the
# __TELEGRAM_BOT_TOKEN__ and __TELEGRAM_CHAT_ID__ placeholders.
#
# Run ONCE after docker-compose up, before starting fail2ban:
#   chmod +x scripts/configure-fail2ban.sh
#   ./scripts/configure-fail2ban.sh
#
# Idempotent — safe to run multiple times. Re-reads .env each time.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env"
JAIL_FILE="$PROJECT_ROOT/fail2ban/jail.local"

# ----------------------------------------------------------
# Preflight checks
# ----------------------------------------------------------
if [ ! -f "$ENV_FILE" ]; then
    echo "ERROR: .env file not found at $ENV_FILE"
    echo "Copy .env.example to .env and fill in values first."
    exit 1
fi

if [ ! -f "$JAIL_FILE" ]; then
    echo "ERROR: jail.local not found at $JAIL_FILE"
    exit 1
fi

# ----------------------------------------------------------
# Read values from .env (ignore comments, handle quoting)
# ----------------------------------------------------------
TELEGRAM_BOT_TOKEN="$(grep -E '^TELEGRAM_BOT_TOKEN=' "$ENV_FILE" | cut -d '=' -f 2- | tr -d '"' | tr -d "'")"
TELEGRAM_CHAT_ID="$(grep -E '^TELEGRAM_CHAT_ID=' "$ENV_FILE" | cut -d '=' -f 2- | tr -d '"' | tr -d "'")"

if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "ERROR: TELEGRAM_BOT_TOKEN is empty in $ENV_FILE"
    exit 1
fi

if [ -z "$TELEGRAM_CHAT_ID" ]; then
    echo "ERROR: TELEGRAM_CHAT_ID is empty in $ENV_FILE"
    exit 1
fi

# ----------------------------------------------------------
# Replace placeholders in jail.local
# ----------------------------------------------------------
sed -i.bak \
    -e "s|__TELEGRAM_BOT_TOKEN__|${TELEGRAM_BOT_TOKEN}|g" \
    -e "s|__TELEGRAM_CHAT_ID__|${TELEGRAM_CHAT_ID}|g" \
    "$JAIL_FILE"

rm -f "${JAIL_FILE}.bak"

echo "OK: fail2ban/jail.local updated with Telegram credentials."
echo "    Bot token: ${TELEGRAM_BOT_TOKEN:0:10}..."
echo "    Chat ID:   $TELEGRAM_CHAT_ID"
echo ""

# ----------------------------------------------------------
# Verify Telegram bot token is valid
# ----------------------------------------------------------
echo "Verifying Telegram bot token..."
VERIFY_RESULT=$(curl -s "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe" 2>/dev/null)

if echo "$VERIFY_RESULT" | grep -q '"ok":true'; then
    BOT_NAME=$(echo "$VERIFY_RESULT" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
    echo "OK: Telegram bot verified — @${BOT_NAME}"
else
    echo "WARNING: Telegram bot token may be invalid."
    echo "         Fail2ban alerts will NOT be delivered."
    echo "         Verify your TELEGRAM_BOT_TOKEN in .env"
    echo "         Test manually: curl https://api.telegram.org/bot\${TOKEN}/getMe"
fi

echo ""
echo "Next: deploy fail2ban configs on the host."
echo "    sudo cp fail2ban/jail.local /etc/fail2ban/jail.local"
echo "    sudo cp fail2ban/filter.d/* /etc/fail2ban/filter.d/"
echo "    sudo cp fail2ban/action.d/* /etc/fail2ban/action.d/"
echo "    sudo systemctl restart fail2ban"
