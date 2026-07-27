# Fix 502 Bad Gateway Error

## Problem
All URLs are returning 502 Bad Gateway errors.

## Root Cause
Nginx is configured to proxy requests to `vyntrize_website` and `vyntrize_crm` services, but these services **don't exist** in the docker-compose stack. They're from separate repositories that haven't been deployed yet.

When nginx tries to proxy requests to non-existent upstreams, it returns 502 errors.

## Solution: Two Options

### Option 1: Quick Fix - Disable Vyntrize Domains (Recommended)

This will get your ReviewRise app working immediately.

**Run on VPS:**

```bash
cd ~/review-rise-monorepo

# Pull latest code with fixed nginx config
git pull origin main

# Rebuild and restart nginx
bash scripts/fix-502-disable-vyntrize.sh
```

**Result:**
- ✅ `https://app.vyntrise.com` - ReviewRise App (WORKING)
- ✅ `https://seo-analyzer.vyntrise.com` - SEO Landing (WORKING)
- ⚠️ `https://vyntrise.com` - Vyntrize Website (404 - disabled)
- ⚠️ `https://crm.vyntrise.com` - Vyntrize CRM (404 - disabled)

### Option 2: Deploy Vyntrize Services (Complete Solution)

To enable all domains, you need to deploy the vyntrize-website and vyntrize-crm services.

#### Step 1: Add Services to docker-compose.prod.yml

Add these services to your `docker-compose.prod.yml`:

```yaml
  vyntrize-website:
    image: ghcr.io/reviewrise/vyntrize-website-project/vyntrize-website:latest
    container_name: deploy-vyntrize-website-1
    restart: unless-stopped
    networks:
      - reviewrise-network
    environment:
      - NODE_ENV=production
      - PORT=3013
      - DATABASE_URL=${VYNTRIZE_DATABASE_URL}
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3013/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  vyntrize-crm:
    image: ghcr.io/reviewrise/vyntrize-website-project/vyntrize-crm:latest
    container_name: deploy-vyntrize-crm-1
    restart: unless-stopped
    networks:
      - reviewrise-network
    environment:
      - NODE_ENV=production
      - PORT=3014
      - DATABASE_URL=${CRM_DATABASE_URL}
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3014/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
```

#### Step 2: Add Environment Variables

Add to `.env.production`:

```bash
# Vyntrize Website Database
VYNTRIZE_DATABASE_URL="postgresql://reviewrise_app:YOUR_PASSWORD@postgres:5432/reviewrise_db?sslmode=disable"

# Vyntrize CRM Database
CRM_DATABASE_URL="postgresql://reviewrise_app:YOUR_PASSWORD@postgres:5432/vyntrize_db?sslmode=disable"
```

#### Step 3: Deploy Services

```bash
# Pull the images
docker compose -f docker-compose.prod.yml pull vyntrize-website vyntrize-crm

# Start the services
docker compose -f docker-compose.prod.yml up -d vyntrize-website vyntrize-crm

# Check status
docker compose -f docker-compose.prod.yml ps
```

#### Step 4: Enable Nginx Server Blocks

Uncomment the vyntrize server blocks in `nginx/nginx.conf` and rebuild:

```bash
# Edit nginx/nginx.conf and uncomment the vyntrize sections
# Then rebuild nginx
docker compose -f docker-compose.prod.yml build nginx
docker compose -f docker-compose.prod.yml up -d --force-recreate nginx
```

## Quick Diagnostic Commands

```bash
# Check which services are running
docker compose -f docker-compose.prod.yml ps

# Check nginx logs
docker logs reviewrise-nginx --tail 50

# Test if backend services are reachable
docker compose -f docker-compose.prod.yml exec nginx wget -O- http://next-web:3000/api/health

# Run full diagnostics
bash scripts/diagnose-502.sh
```

## Manual Fix (If Scripts Don't Work)

```bash
# 1. Stop nginx
docker compose -f docker-compose.prod.yml stop nginx

# 2. Edit nginx config to comment out vyntrize upstreams
# Edit nginx/nginx.conf and comment out:
#   - upstream vyntrize_website { ... }
#   - upstream vyntrize_crm { ... }
#   - server blocks for vyntrise.com
#   - server blocks for crm.vyntrise.com

# 3. Rebuild nginx image
docker compose -f docker-compose.prod.yml build nginx

# 4. Start nginx
docker compose -f docker-compose.prod.yml up -d nginx

# 5. Test
curl -I https://app.vyntrise.com
```

## Verification

After applying the fix:

```bash
# All these should return 200 or 30x (not 502)
curl -I https://app.vyntrise.com
curl -I https://seo-analyzer.vyntrise.com

# These will return 404 if vyntrize services are disabled
curl -I https://vyntrise.com
curl -I https://crm.vyntrise.com
```

## Why This Happened

1. Nginx config was updated to include vyntrize domains
2. Nginx was deployed with these configurations
3. But vyntrize-website and vyntrize-crm services were never deployed
4. Nginx tries to proxy to non-existent services → 502 error
5. This affects ALL domains because nginx fails to start properly

## Prevention

Before adding new domains to nginx:
1. Ensure the backend service exists in docker-compose
2. Deploy the service first
3. Then add the nginx configuration
4. Or comment out the nginx config until the service is ready

## Next Steps

1. **Immediate**: Run Option 1 to get ReviewRise working
2. **Later**: Deploy vyntrize services and enable their domains
3. **Monitor**: Check logs regularly: `docker compose -f docker-compose.prod.yml logs -f`
