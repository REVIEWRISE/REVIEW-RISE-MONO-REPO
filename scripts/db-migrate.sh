#!/bin/sh
set -e

echo "=== DB Migrate & Seed ==="
echo "DATABASE_URL: ${DATABASE_URL:0:50}..."

DB_PKG=/app/packages/@platform/db

# ── Locate prisma binary in pnpm virtual store ────────────────────────────
PRISMA=$(find /app/node_modules/.pnpm -path "*/prisma/build/index.js" 2>/dev/null | head -1)
if [ -z "$PRISMA" ]; then
  echo "ERROR: prisma binary not found in pnpm store"
  exit 1
fi
echo "Prisma binary: $PRISMA"

# ── Run migrations ────────────────────────────────────────────────────────
echo "Running prisma migrate deploy..."
cd "$DB_PKG"
node "$PRISMA" migrate deploy
echo "✓ Migrations complete"

# ── Generate Prisma client ────────────────────────────────────────────────
# The generated client (.prisma/client) must exist before seed scripts run.
# In the db-migrate container the source is mounted but generate hasn't run.
echo "Generating Prisma client..."
node "$PRISMA" generate
echo "✓ Prisma client generated"

# ── Run seed ──────────────────────────────────────────────────────────────
# Prefer pre-compiled JS (built by tsc -p tsconfig.scripts.json during CI)
COMPILED_SEED="$DB_PKG/dist-scripts/seed-all.js"

if [ -f "$COMPILED_SEED" ]; then
  echo "Running compiled seed: $COMPILED_SEED"
  node "$COMPILED_SEED"
else
  # Fallback: find tsx in pnpm store
  echo "Compiled seed not found, looking for tsx..."
  TSX=$(find /app/node_modules/.pnpm -name "tsx" -path "*/bin/tsx" 2>/dev/null | head -1)
  if [ -z "$TSX" ]; then
    TSX_MJS=$(find /app/node_modules/.pnpm -path "*/tsx/dist/cli.mjs" 2>/dev/null | head -1)
    if [ -n "$TSX_MJS" ]; then
      echo "Running seed via tsx mjs: $TSX_MJS"
      node "$TSX_MJS" "$DB_PKG/scripts/seed-all.ts"
    else
      echo "ERROR: No compiled seed and tsx not found. Run 'pnpm --filter @platform/db build:scripts' locally and commit dist-scripts/"
      exit 1
    fi
  else
    echo "Running seed via tsx: $TSX"
    "$TSX" "$DB_PKG/scripts/seed-all.ts"
  fi
fi

echo "✓ Seed complete"
echo "=== Done ==="
