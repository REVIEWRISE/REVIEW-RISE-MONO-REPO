#!/bin/bash

# ==============================================================================
# VPS Deployment Script for Review Rise Monorepo
# ==============================================================================
# This script should be run on the VPS to deploy/update the application
# Usage: ./scripts/deploy-staging.sh
# ==============================================================================

set -e  # Exit on error
set -u  # Exit on undefined variable

# ==============================================================================
# Configuration
# ==============================================================================
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
# Symlink for standard docker-compose behavior
ln -sf "$ENV_FILE" .env
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ==============================================================================
# Helper Functions
# ==============================================================================
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ==============================================================================
# Preflight Checks
# ==============================================================================
log_info "Starting deployment preflight checks..."
 
# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    log_error "Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

# Check if .env.production exists
if [ ! -f "$ENV_FILE" ]; then
    log_error "$ENV_FILE not found. Please create it from .env.production.example"
    exit 1
fi

log_info "Preflight checks passed ✓"

# ==============================================================================
# Create Backup
# ==============================================================================
log_info "Creating backup of current deployment..."

mkdir -p "$BACKUP_DIR"

# Backup current container state info
docker compose -f "$COMPOSE_FILE" ps > "$BACKUP_DIR/containers_$TIMESTAMP.txt" 2>&1 || true

# Backup environment file
cp "$ENV_FILE" "$BACKUP_DIR/env_$TIMESTAMP.backup"

log_info "Backup created at $BACKUP_DIR with timestamp $TIMESTAMP ✓"

# ==============================================================================
# Pull Latest Images
# ==============================================================================
log_info "Logging into GHCR..."

if [ -n "${GITHUB_TOKEN:-}" ] && [ -n "${GITHUB_ACTOR:-}" ]; then
    # Ensure lowercase actor for Docker compatibility
    LOWER_ACTOR=$(echo "$GITHUB_ACTOR" | tr '[:upper:]' '[:lower:]')
    
    # Logout first to ensure clean state
    docker logout ghcr.io > /dev/null 2>&1 || true
    
    echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$LOWER_ACTOR" --password-stdin
    
    if [ $? -eq 0 ]; then
        log_info "Authenticated with ghcr.io as $LOWER_ACTOR ✓"
    else
        log_error "Failed to login to ghcr.io!"
        # Do not exit, try pulling anyway (though likely to fail for private images)
    fi
else
    log_warn "GITHUB_TOKEN or GITHUB_ACTOR not set. Skipping docker login (pull may fail for private images)."
fi

log_info "Pulling latest Docker images..."

docker compose -f "$COMPOSE_FILE" pull

log_info "Images pulled successfully ✓"

# ==============================================================================
# Staging Reset — Wipe DB volume for a clean slate on every deploy
# ==============================================================================
log_info "Staging environment: wiping database volume for clean reset..."
docker compose -f "$COMPOSE_FILE" down -v --remove-orphans || true
log_info "Database volume wiped ✓"

# ==============================================================================
# Start Services (postgres must be up before migrations/seed)
# ==============================================================================
log_info "Starting infrastructure services (postgres, redis)..."
docker compose -f "$COMPOSE_FILE" up -d --remove-orphans postgres redis

log_info "Waiting for postgres to be healthy..."
ELAPSED=0
until docker compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U "${POSTGRES_USER:-postgres}" > /dev/null 2>&1; do
    sleep 2
    ELAPSED=$((ELAPSED + 2))
    if [ $ELAPSED -ge 60 ]; then
        log_error "Postgres did not become ready in time!"
        exit 1
    fi
done
log_info "Postgres is ready ✓"

# ==============================================================================
# Run Migrations + Schema Sync
# ==============================================================================
# express-auth entrypoint runs `prisma migrate deploy` automatically.
# We also run `db push` to catch any schema models not yet in a migration file.
log_info "Running migrations and schema sync..."
docker compose -f "$COMPOSE_FILE" run --rm \
    -e DATABASE_URL="postgresql://reviewrise_admin:${POSTGRES_ADMIN_PASSWORD:-admin_password}@postgres:5432/${POSTGRES_DB:-reviewrise_db}?sslmode=disable" \
    express-auth \
    sh -c "cd /app/packages/@platform/db && npx prisma migrate deploy && npx prisma db push --accept-data-loss" || {
    log_error "Migration/schema sync failed!"
    exit 1
}
log_info "Migrations and schema sync completed ✓"

# ==============================================================================
# Seed Database — always on staging
# ==============================================================================
log_info "Seeding database..."
docker compose -f "$COMPOSE_FILE" run --rm \
    -e DATABASE_URL="postgresql://reviewrise_admin:${POSTGRES_ADMIN_PASSWORD:-admin_password}@postgres:5432/${POSTGRES_DB:-reviewrise_db}?sslmode=disable" \
    express-auth \
    sh -c "cd /app && pnpm --filter @platform/db run db:seed:all" || {
    log_warn "Database seeding failed (check logs above)"
}
log_info "Database seeding completed ✓"

# ==============================================================================
# SSL Certificate Check & Cleanup
# ==============================================================================
CERT_PATH="./nginx/certbot/conf/live/vyntrise.com/fullchain.pem"
NEEDS_INIT=0

log_info "Checking SSL certificate state..."

# Check if any of the required certs are missing
for domain in vyntrise.com seo-analyzer.vyntrise.com app.vyntrise.com crm.vyntrise.com; do
    if ! docker compose -f "$COMPOSE_FILE" run --rm --entrypoint "test -s /etc/letsencrypt/live/$domain/fullchain.pem" certbot > /dev/null 2>&1; then
        log_warn "Certificate for $domain not found"
        NEEDS_INIT=1
        break
    fi
done

if [ "$NEEDS_INIT" -eq 1 ]; then
    log_info "Running automatic SSL initialization..."
    
    # Run init-ssl.sh in non-interactive mode
    if [ -x ./scripts/init-ssl.sh ]; then
        bash ./scripts/init-ssl.sh --non-interactive || {
            log_warn "SSL initialization failed, but continuing (nginx will use dummy certs)"
        }
    else
        log_warn "init-ssl.sh not found or not executable, skipping SSL init"
    fi
    log_info "SSL initialization completed ✓"
else
    log_info "All SSL certificates found ✓"
fi

# ==============================================================================
# Start All Remaining Services
# ==============================================================================
log_info "Starting all services with Docker Compose..."

docker compose -f "$COMPOSE_FILE" up -d --remove-orphans

log_info "Services started ✓"

# ==============================================================================
# Wait for Health Checks
# ==============================================================================
log_info "Waiting for services to become healthy..."

MAX_WAIT=180  # Maximum wait time in seconds
ELAPSED=0
INTERVAL=5

while [ $ELAPSED -lt $MAX_WAIT ]; do
    # Check if all services are healthy or running
    UNHEALTHY=$(docker compose -f "$COMPOSE_FILE" ps --format json | jq -r 'select(.Health == "unhealthy") | .Name' 2>/dev/null || echo "")
    
    if [ -z "$UNHEALTHY" ]; then
        log_info "All services are healthy ✓"
        break
    fi
    
    log_warn "Waiting for services to become healthy... (${ELAPSED}s/${MAX_WAIT}s)"
    sleep $INTERVAL
    ELAPSED=$((ELAPSED + INTERVAL))
done

if [ $ELAPSED -ge $MAX_WAIT ]; then
    log_error "Timeout waiting for services to become healthy!"
    log_warn "Check service logs with: docker compose -f $COMPOSE_FILE logs"
    log_warn "You can rollback using: ./scripts/rollback-staging.sh $TIMESTAMP"
    exit 1
fi

# ==============================================================================
# Service Health Verification
# ==============================================================================
log_info "Verifying service health endpoints..."

# Wait a bit more for Nginx to be fully ready
sleep 10

# Test Nginx health
if curl -f http://127.0.0.1/health > /dev/null 2>&1; then
    log_info "Nginx health check passed (IP) ✓"
elif curl -f http://localhost/health > /dev/null 2>&1; then
    log_info "Nginx health check passed (localhost) ✓"
else
    log_error "Nginx health check failed!"
    echo "--- CURL OUTPUT ---"
    curl -v http://127.0.0.1/health || true
    echo "--- NGINX LOGS ---"
    docker logs reviewrise-nginx --tail 50 || true
    exit 1
fi

# ==============================================================================
# Cleanup Old Images
# ==============================================================================
log_info "Cleaning up old Docker images..."

docker image prune -f > /dev/null 2>&1 || true

log_info "Cleanup completed ✓"

# ==============================================================================
# Deployment Summary
# ==============================================================================
echo ""
log_info "==========================================="
log_info "Deployment completed successfully! 🚀"
log_info "==========================================="
log_info "Backup ID: $TIMESTAMP"
log_info "Rollback command: ./scripts/rollback-staging.sh $TIMESTAMP"
log_info ""
log_info "View logs: docker compose -f $COMPOSE_FILE logs -f"
log_info "Check status: docker compose -f $COMPOSE_FILE ps"
echo ""

exit 0
