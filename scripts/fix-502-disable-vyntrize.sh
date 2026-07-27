#!/bin/bash

# ==============================================================================
# Fix 502 Error by Temporarily Disabling Vyntrize Services
# ==============================================================================
# This script rebuilds nginx without vyntrize-website and vyntrize-crm
# Run this to get ReviewRise (app.vyntrise.com) working immediately
# ==============================================================================

set -e

COMPOSE_FILE="docker-compose.prod.yml"

echo "==================================="
echo "Fixing 502 Error"
echo "==================================="
echo ""

echo "Step 1: Checking current nginx status..."
docker compose -f "$COMPOSE_FILE" ps nginx
echo ""

echo "Step 2: Rebuilding nginx image with updated config..."
docker compose -f "$COMPOSE_FILE" build nginx
echo ""

echo "Step 3: Restarting nginx..."
docker compose -f "$COMPOSE_FILE" up -d --force-recreate nginx
echo ""

echo "Step 4: Waiting for nginx to start..."
sleep 5
echo ""

echo "Step 5: Testing nginx configuration..."
if docker compose -f "$COMPOSE_FILE" exec nginx nginx -t 2>&1; then
    echo "✓ Nginx configuration is valid"
else
    echo "✗ Nginx configuration has errors"
    exit 1
fi
echo ""

echo "Step 6: Checking nginx status..."
docker compose -f "$COMPOSE_FILE" ps nginx
echo ""

echo "Step 7: Testing working domains..."
echo "-----------------------------------"
for domain in app.vyntrise.com seo-analyzer.vyntrise.com; do
    echo -n "Testing https://$domain... "
    if curl -s -o /dev/null -w "%{http_code}" "https://$domain" | grep -q "200\|301\|302"; then
        echo "✓ OK"
    else
        echo "✗ FAILED"
    fi
done
echo ""

echo "==================================="
echo "Fix Complete!"
echo "==================================="
echo ""
echo "✓ Working domains:"
echo "  - https://app.vyntrise.com (ReviewRise App)"
echo "  - https://seo-analyzer.vyntrise.com (SEO Landing)"
echo ""
echo "⚠️ Temporarily disabled (will show 404):"
echo "  - https://vyntrise.com (Vyntrize Website)"
echo "  - https://crm.vyntrise.com (Vyntrize CRM)"
echo ""
echo "To enable vyntrize domains:"
echo "1. Deploy vyntrize-website and vyntrize-crm from their repos"
echo "2. Uncomment the server blocks in nginx/nginx.conf"
echo "3. Rebuild and restart nginx"
