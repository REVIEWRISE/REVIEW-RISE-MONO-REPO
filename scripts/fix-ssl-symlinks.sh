#!/bin/bash

# ==============================================================================
# SSL Certificate Symlink Fix Script
# ==============================================================================
# This script fixes symlinks for versioned SSL certificates
# Run this on the VPS when nginx fails due to missing certificates
# ==============================================================================

set -e

COMPOSE_FILE="docker-compose.prod.yml"
domains=(vyntrise.com seo-analyzer.vyntrise.com app.vyntrise.com crm.vyntrise.com)

echo "### Fixing SSL certificate symlinks..."

for domain in "${domains[@]}"; do
  echo "Checking certificate for $domain..."
  
  # Find the actual certificate directory (may have -0001, -0002 suffix)
  ACTUAL_CERT=$(docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "sh -c 'ls -d /etc/letsencrypt/live/${domain}* 2>/dev/null | sort -V | tail -1'" certbot | tr -d '\r')
  
  if [ -z "$ACTUAL_CERT" ]; then
    echo "  ❌ No certificate found for $domain"
    continue
  fi
  
  CERT_BASENAME=$(basename "$ACTUAL_CERT")
  
  if [ "$CERT_BASENAME" = "$domain" ]; then
    echo "  ✓ Certificate for $domain is at expected location"
  else
    echo "  Found versioned certificate: $CERT_BASENAME"
    
    # Create symlink from base name to versioned name
    docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "\
      sh -c 'cd /etc/letsencrypt/live && \
             rm -f $domain && \
             ln -sf $CERT_BASENAME $domain && \
             echo \"Symlink created:\" && \
             ls -la $domain'" certbot
    
    echo "  ✓ Created symlink: $domain -> $CERT_BASENAME"
  fi
done

echo ""
echo "### Verifying certificates are accessible..."
for domain in "${domains[@]}"; do
  if docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "test -f /etc/letsencrypt/live/$domain/fullchain.pem" certbot > /dev/null 2>&1; then
    echo "  ✓ $domain certificate accessible"
  else
    echo "  ❌ $domain certificate NOT accessible"
  fi
done

echo ""
echo "### Restarting nginx..."
docker compose -f "$COMPOSE_FILE" restart nginx

echo ""
echo "### Waiting for nginx to start..."
sleep 5

echo ""
echo "### Testing nginx..."
if docker compose -f "$COMPOSE_FILE" exec nginx nginx -t 2>&1; then
  echo "✓ Nginx configuration is valid"
else
  echo "❌ Nginx configuration has errors"
  exit 1
fi

echo ""
echo "### Checking nginx status..."
docker compose -f "$COMPOSE_FILE" ps nginx

echo ""
echo "✓ SSL symlinks fixed successfully!"
