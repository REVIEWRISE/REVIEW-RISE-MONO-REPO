#!/bin/sh
set -e

echo "=== DB Migrate & Seed ==="
echo "DATABASE_URL: ${DATABASE_URL:0:40}..."

cd /app/packages/@platform/db

# Locate prisma binary in pnpm store
PRISMA=$(find /app/node_modules/.pnpm -path "*/prisma/build/index.js" 2>/dev/null | head -1)
if [ -z "$PRISMA" ]; then
  echo "ERROR: prisma binary not found in pnpm store"
  exit 1
fi
echo "Prisma: $PRISMA"

# Run migrations
echo "Running prisma migrate deploy..."
node "$PRISMA" migrate deploy
echo "Migrations complete."

# Locate tsx binary
TSX=$(find /app/node_modules/.pnpm -name "tsx" -path "*/bin/tsx" 2>/dev/null | head -1)
if [ -z "$TSX" ]; then
  # fallback: look for cli.mjs
  TSX_MJS=$(find /app/node_modules/.pnpm -path "*/tsx/dist/cli.mjs" 2>/dev/null | head -1)
  if [ -n "$TSX_MJS" ]; then
    echo "TSX (mjs): $TSX_MJS"
    echo "Running seed..."
    node "$TSX_MJS" scripts/seed-all.ts
  else
    # Last resort: check if dist/scripts/seed-all.js exists (pre-compiled)
    if [ -f "/app/packages/@platform/db/dist/scripts/seed-all.js" ]; then
      echo "Running compiled seed..."
      node /app/packages/@platform/db/dist/scripts/seed-all.js
    else
      echo "WARNING: tsx not found and no compiled seed. Installing tsx globally..."
      npm install -g tsx
      tsx scripts/seed-all.ts
    fi
  fi
else
  echo "TSX: $TSX"
  echo "Running seed..."
  "$TSX" scripts/seed-all.ts
fi

echo "=== Done ==="
