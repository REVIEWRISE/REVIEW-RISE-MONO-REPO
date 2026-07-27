# Quick Fix Commands - Run on VPS

## Current Issue: Nginx failing due to missing SSL certificates

### Step 1: Fix SSL Certificate Symlinks

```bash
# SSH into VPS
ssh deploy@your-vps-ip

# Navigate to project
cd ~/review-rise-monorepo

# Run the fix script
bash scripts/fix-ssl-symlinks.sh
```

### Step 2: Verify Nginx is Running

```bash
# Check nginx status
docker compose -f docker-compose.prod.yml ps nginx

# Should show "Up" status, not "Restarting"
```

### Step 3: Test All Domains

```bash
# Test HTTP (should work)
curl -I http://vyntrise.com
curl -I http://www.vyntrise.com
curl -I http://seo-analyzer.vyntrise.com
curl -I http://app.vyntrise.com
curl -I http://crm.vyntrise.com

# Test HTTPS (should work after fix)
curl -I https://vyntrise.com
curl -I https://www.vyntrise.com
curl -I https://seo-analyzer.vyntrise.com
curl -I https://app.vyntrise.com
curl -I https://crm.vyntrise.com
```

### Step 4: Get Database Credentials for CRM

```bash
# View database connection strings
grep DATABASE_URL .env.production

# Example output:
# DATABASE_URL="postgresql://reviewrise_app:abc123@postgres:5432/reviewrise_db?sslmode=disable"
# DATABASE_ADMIN_URL="postgresql://reviewrise_admin:xyz789@postgres:5432/reviewrise_db?sslmode=disable"
```

### Step 5: Check Service Status

```bash
# View all running services
docker compose -f docker-compose.prod.yml ps

# Check specific service logs
docker compose -f docker-compose.prod.yml logs nginx --tail 50
docker compose -f docker-compose.prod.yml logs vyntrize-crm --tail 50
docker compose -f docker-compose.prod.yml logs vyntrize-website --tail 50
```

## Alternative: Manual SSL Fix

If the script doesn't work, run these commands manually:

```bash
# List existing certificates
docker compose -f docker-compose.prod.yml run --rm --entrypoint "ls -la /etc/letsencrypt/live/" certbot

# Create symlink for vyntrise.com (adjust -0002 to match your version)
docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  sh -c 'cd /etc/letsencrypt/live && \
         rm -f vyntrise.com && \
         ln -sf vyntrise.com-0002 vyntrise.com && \
         ls -la vyntrise.com'" certbot

# Create symlink for seo-analyzer.vyntrise.com (if needed)
docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  sh -c 'cd /etc/letsencrypt/live && \
         rm -f seo-analyzer.vyntrise.com && \
         ln -sf seo-analyzer.vyntrise.com-0002 seo-analyzer.vyntrise.com && \
         ls -la seo-analyzer.vyntrise.com'" certbot

# Create symlink for app.vyntrise.com (if needed)
docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  sh -c 'cd /etc/letsencrypt/live && \
         rm -f app.vyntrise.com && \
         ln -sf app.vyntrise.com-0001 app.vyntrise.com && \
         ls -la app.vyntrise.com'" certbot

# Restart nginx
docker compose -f docker-compose.prod.yml restart nginx

# Wait and check status
sleep 5
docker compose -f docker-compose.prod.yml ps nginx
```

## If Nginx Still Won't Start

```bash
# Check nginx logs for specific error
docker logs reviewrise-nginx --tail 100

# Test nginx configuration
docker compose -f docker-compose.prod.yml exec nginx nginx -t

# If nginx container is not running, try to start it
docker compose -f docker-compose.prod.yml up -d nginx

# Watch logs in real-time
docker compose -f docker-compose.prod.yml logs -f nginx
```

## Create Missing CRM Certificate

If `crm.vyntrise.com` certificate doesn't exist:

```bash
# Request certificate for CRM domain
docker compose -f docker-compose.prod.yml run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    --email support@vyntrise.com \
    -d crm.vyntrise.com \
    --rsa-key-size 4096 \
    --agree-tos \
    --cert-name crm.vyntrise.com \
    --non-interactive" certbot

# Restart nginx
docker compose -f docker-compose.prod.yml restart nginx
```

## Verify Everything is Working

```bash
# All services should be "Up" and "healthy"
docker compose -f docker-compose.prod.yml ps

# Test main app
curl -I https://app.vyntrise.com

# Test SEO landing
curl -I https://seo-analyzer.vyntrise.com

# Test Vyntrize website
curl -I https://vyntrise.com

# Test CRM
curl -I https://crm.vyntrise.com
```

## Expected Output

After successful fix, you should see:

```
✓ vyntrise.com certificate accessible
✓ seo-analyzer.vyntrise.com certificate accessible
✓ app.vyntrise.com certificate accessible
✓ crm.vyntrise.com certificate accessible

Nginx configuration is valid
✓ SSL symlinks fixed successfully!
```

## Next Steps After Fix

1. **Configure CRM database** - See `DATABASE_CREDENTIALS.md`
2. **Test all domains** in browser
3. **Monitor logs** for any errors
4. **Set up certificate auto-renewal** (already configured with certbot)

## Rollback (If Needed)

If something goes wrong:

```bash
# Stop all services
docker compose -f docker-compose.prod.yml down

# Check backups
ls -la backups/

# Restore from backup (use timestamp from backup files)
# Example: backups/env_20260430_080512.backup
cp backups/env_TIMESTAMP.backup .env.production

# Start services again
docker compose -f docker-compose.prod.yml up -d
```
