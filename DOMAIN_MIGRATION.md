# Domain Migration Summary

## Changes Made

### Old Configuration
- **SEO Landing Page**: `vyntrise.com`, `www.vyntrise.com`
- **Main Web App**: `app.vyntrise.com`
- **SSL Certificate**: Single wildcard cert for `vyntrise.com`

### New Configuration
- **SEO Landing Page**: `seo-analyzer.vyntrise.com`
- **Main Web App**: `app.vyntrise.com` (unchanged)
- **SSL Certificates**: Separate certs for each subdomain

## Files Updated

### 1. Nginx Configuration (`nginx/nginx.conf`)
- Changed SEO landing server block from `vyntrise.com www.vyntrise.com` → `seo-analyzer.vyntrise.com`
- Updated SSL certificate paths for both domains to use separate certs
- `app.vyntrise.com` now uses `/etc/letsencrypt/live/app.vyntrise.com/`
- `seo-analyzer.vyntrise.com` uses `/etc/letsencrypt/live/seo-analyzer.vyntrise.com/`

### 2. SSL Initialization Script (`scripts/init-ssl.sh`)
- Updated domains array: `(seo-analyzer.vyntrise.com app.vyntrise.com)`
- Changed to request **separate certificates** for each domain instead of a single multi-domain cert
- Each domain now gets its own cert directory

### 3. Deploy Script (`scripts/deploy-staging.sh`)
- Updated SSL cert path checks to use `seo-analyzer.vyntrise.com`
- Updated cleanup commands to remove both old domain certs

### 4. Deploy SSL Script (`scripts/deploy-ssl.sh`)
- Updated success message to show new domain

### 5. Frontend Components
- `apps/next-web/src/components/layout/horizontal/FooterContent.tsx`
- `apps/next-web/src/components/layout/vertical/FooterContent.tsx`
- Changed footer links from `https://vyntrise.com/` → `https://seo-analyzer.vyntrise.com/`

## What Stays the Same

- `app.vyntrise.com` — main web application (no changes)
- All API endpoints under `app.vyntrise.com/api/*`
- Backend service URLs (internal Docker network)
- Database configuration
- All other infrastructure

## Deployment Steps

### On VPS (Manual - One Time)

1. **Update DNS Records**
   ```
   Add A record: seo-analyzer.vyntrise.com → VPS IP
   Keep existing: app.vyntrise.com → VPS IP
   ```

2. **Pull Latest Code**
   ```bash
   cd /home/deploy/review-rise-monorepo
   git pull origin staging
   ```

3. **Clean Old SSL Certificates**
   ```bash
   docker compose -f docker-compose.prod.yml run --rm --entrypoint "sh -c 'rm -rf /etc/letsencrypt/live/vyntrise.com* && rm -rf /etc/letsencrypt/archive/vyntrise.com* && rm -rf /etc/letsencrypt/renewal/vyntrise.com*.conf'" certbot
   ```

4. **Request New SSL Certificates**
   ```bash
   chmod +x ./scripts/init-ssl.sh
   ./scripts/init-ssl.sh
   ```

5. **Restart Services**
   ```bash
   docker compose -f docker-compose.prod.yml up -d --force-recreate nginx
   ```

### Future Deploys (Automated)

All future pushes to `staging` branch will automatically:
- Use the new domain configuration
- Maintain SSL certificates via auto-renewal
- No manual intervention needed

## Testing

After deployment, verify:
- ✅ `https://seo-analyzer.vyntrise.com` → SEO Landing Page
- ✅ `https://app.vyntrise.com` → Main Web App
- ✅ SSL certificates valid for both domains
- ✅ `vyntrise.com` and `www.vyntrise.com` are now free for other projects

## Rollback (if needed)

If issues occur, revert the changes:
```bash
git revert <commit-hash>
git push origin staging
```

Then re-run SSL initialization with the old domains.
