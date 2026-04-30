# SSL Certificate Fix Guide

## Problem
Nginx is failing to start because it cannot find the SSL certificate at `/etc/letsencrypt/live/vyntrise.com/fullchain.pem`. The certificate was created with a version suffix (e.g., `vyntrise.com-0002`) due to previous certificate requests, but nginx expects it at the base path.

## Root Cause
When Let's Encrypt creates a certificate for a domain that already has certificates, it adds a suffix like `-0001`, `-0002`, etc. Nginx configuration references the base path without the suffix, causing the startup failure.

## Solution

### Quick Fix (Run on VPS Now)

1. **SSH into your VPS:**
   ```bash
   ssh deploy@your-vps-ip
   cd ~/review-rise-monorepo
   ```

2. **Run the fix script:**
   ```bash
   bash scripts/fix-ssl-symlinks.sh
   ```

   This script will:
   - Find all versioned certificates (e.g., `vyntrise.com-0002`)
   - Create symlinks from base names to versioned names
   - Restart nginx
   - Verify the configuration

3. **Verify nginx is running:**
   ```bash
   docker compose -f docker-compose.prod.yml ps nginx
   ```

4. **Test the domains:**
   ```bash
   curl -I http://vyntrise.com
   curl -I https://vyntrise.com
   curl -I https://crm.vyntrise.com
   ```

### Manual Fix (Alternative)

If the script doesn't work, you can manually create the symlinks:

```bash
# Check what certificates exist
docker compose -f docker-compose.prod.yml run --rm --entrypoint "ls -la /etc/letsencrypt/live/" certbot

# For each domain with a versioned certificate, create a symlink
# Example for vyntrise.com-0002:
docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  sh -c 'cd /etc/letsencrypt/live && \
         rm -f vyntrise.com && \
         ln -sf vyntrise.com-0002 vyntrise.com && \
         ls -la vyntrise.com'" certbot

# Repeat for other domains if needed (seo-analyzer.vyntrise.com, app.vyntrise.com, crm.vyntrise.com)

# Restart nginx
docker compose -f docker-compose.prod.yml restart nginx
```

### Verify Certificates

```bash
# Check if certificates are accessible
for domain in vyntrise.com seo-analyzer.vyntrise.com app.vyntrise.com crm.vyntrise.com; do
  echo "Checking $domain..."
  docker compose -f docker-compose.prod.yml run --rm --entrypoint "test -f /etc/letsencrypt/live/$domain/fullchain.pem" certbot && echo "  ✓ OK" || echo "  ✗ MISSING"
done
```

### Test HTTPS

```bash
# Test each domain
curl -I https://vyntrise.com
curl -I https://www.vyntrise.com
curl -I https://seo-analyzer.vyntrise.com
curl -I https://app.vyntrise.com
curl -I https://crm.vyntrise.com
```

## Prevention

The updated `init-ssl.sh` script now automatically creates these symlinks during SSL initialization. Future deployments will handle this automatically.

## Troubleshooting

### Nginx still won't start

1. **Check nginx logs:**
   ```bash
   docker logs reviewrise-nginx --tail 50
   ```

2. **Test nginx configuration:**
   ```bash
   docker compose -f docker-compose.prod.yml exec nginx nginx -t
   ```

3. **Check certificate files:**
   ```bash
   docker compose -f docker-compose.prod.yml run --rm --entrypoint "ls -la /etc/letsencrypt/live/" certbot
   ```

### Certificate doesn't exist at all

If a certificate truly doesn't exist (not just a symlink issue), you need to request it:

```bash
# Run the SSL initialization script
bash scripts/init-ssl.sh --non-interactive
```

### CRM certificate missing

The CRM domain (`crm.vyntrise.com`) is new and may not have a certificate yet. The `init-ssl.sh` script will create one, or you can request it manually:

```bash
docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --email support@vyntrise.com \
    -d crm.vyntrise.com \
    --rsa-key-size 4096 \
    --agree-tos \
    --cert-name crm.vyntrise.com \
    --non-interactive" certbot
```

## Next Steps

After fixing the SSL certificates:

1. Verify all domains are accessible via HTTPS
2. Check that the vyntrize-website and vyntrize-crm containers are running
3. Configure the CRM database connection (see context transfer for details)
