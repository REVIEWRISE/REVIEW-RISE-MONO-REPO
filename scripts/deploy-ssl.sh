#!/bin/bash

# ==============================================================================
# Deploy SSL Certificates with Let's Encrypt
# ==============================================================================
# Run this on your VPS to get valid SSL certificates
# ==============================================================================

set -e

echo "🔒 Setting up Let's Encrypt SSL Certificates"
echo "=============================================="
echo ""

# Navigate to project directory
cd "$(dirname "$0")/.."

# Run the SSL initialization script
echo "📋 Step 1: Initializing SSL certificates..."
chmod +x scripts/init-ssl.sh
./scripts/init-ssl.sh

echo ""
echo "✅ SSL certificates obtained!"
echo ""

# Verify certificates
echo "🔍 Step 2: Verifying certificates..."
docker compose -f docker-compose.prod.yml run --rm certbot certificates

echo ""
echo "🎉 Success! Your site is now secure with Let's Encrypt!"
echo ""
echo "🌐 Visit your sites:"
echo "   • https://seo-analyzer.vyntrise.com"
echo "   • https://app.vyntrise.com"
echo ""
echo "🔄 Auto-renewal (recommended):"
echo "   Run: crontab -e"
echo "   Add: 0 0,12 * * * cd $(pwd) && docker compose -f docker-compose.prod.yml run --rm certbot renew --quiet && docker compose -f docker-compose.prod.yml exec nginx nginx -s reload"
echo ""
