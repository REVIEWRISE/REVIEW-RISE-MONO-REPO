#!/bin/bash

# ==============================================================================
# 502 Bad Gateway Diagnostic Script
# ==============================================================================

set -e

COMPOSE_FILE="docker-compose.prod.yml"

echo "==================================="
echo "502 Bad Gateway Diagnostics"
echo "==================================="
echo ""

echo "1. Checking service status..."
echo "-----------------------------------"
docker compose -f "$COMPOSE_FILE" ps
echo ""

echo "2. Checking for unhealthy services..."
echo "-----------------------------------"
UNHEALTHY=$(docker compose -f "$COMPOSE_FILE" ps --format json 2>/dev/null | jq -r 'select(.Health == "unhealthy" or .State == "restarting" or .State == "exited") | "\(.Name): \(.State) - \(.Health)"' 2>/dev/null || echo "")

if [ -z "$UNHEALTHY" ]; then
    echo "✓ All services appear healthy"
else
    echo "⚠️ Unhealthy services found:"
    echo "$UNHEALTHY"
fi
echo ""

echo "3. Checking nginx upstream connectivity..."
echo "-----------------------------------"
# Test if nginx can reach backend services
for service in next-web:3000 next-seo-landing:3001 express-auth:3010; do
    SERVICE_NAME=$(echo $service | cut -d: -f1)
    echo -n "Testing $service... "
    if docker compose -f "$COMPOSE_FILE" exec -T nginx wget -q -O- --timeout=2 "http://$service/health" > /dev/null 2>&1 || \
       docker compose -f "$COMPOSE_FILE" exec -T nginx wget -q -O- --timeout=2 "http://$service/api/health" > /dev/null 2>&1; then
        echo "✓ OK"
    else
        echo "✗ FAILED"
    fi
done
echo ""

echo "4. Checking vyntrize services..."
echo "-----------------------------------"
if docker compose -f "$COMPOSE_FILE" ps | grep -q "vyntrize-website"; then
    echo "✓ vyntrize-website container exists"
    docker compose -f "$COMPOSE_FILE" ps | grep vyntrize-website
else
    echo "✗ vyntrize-website container NOT FOUND"
    echo "  This service is from a separate repo and needs to be deployed"
fi

if docker compose -f "$COMPOSE_FILE" ps | grep -q "vyntrize-crm"; then
    echo "✓ vyntrize-crm container exists"
    docker compose -f "$COMPOSE_FILE" ps | grep vyntrize-crm
else
    echo "✗ vyntrize-crm container NOT FOUND"
    echo "  This service is from a separate repo and needs to be deployed"
fi
echo ""

echo "5. Recent nginx errors..."
echo "-----------------------------------"
docker logs reviewrise-nginx --tail 30 2>&1 | grep -i "error\|warn\|fail" || echo "No recent errors found"
echo ""

echo "6. Checking database connectivity..."
echo "-----------------------------------"
if docker compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✓ PostgreSQL is ready"
else
    echo "✗ PostgreSQL is NOT ready"
fi
echo ""

echo "7. Service logs (last 10 lines each)..."
echo "-----------------------------------"
for service in next-web next-seo-landing express-auth; do
    echo "--- $service ---"
    docker compose -f "$COMPOSE_FILE" logs --tail 10 "$service" 2>&1 | tail -10
    echo ""
done

echo "==================================="
echo "Diagnostic complete"
echo "==================================="
echo ""
echo "Common fixes:"
echo "1. If services are unhealthy: docker compose -f $COMPOSE_FILE restart [service-name]"
echo "2. If vyntrize services missing: Deploy them from their respective repos"
echo "3. If database issues: Check DATABASE_URL in .env.production"
echo "4. View full logs: docker compose -f $COMPOSE_FILE logs -f [service-name]"
