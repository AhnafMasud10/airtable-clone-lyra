#!/usr/bin/env bash
# Migrate database from local PostgreSQL to Neon
# Usage: ./scripts/migrate-to-neon.sh
#
# Prerequisites:
# - Local Postgres running with data
# - NEON_DATABASE_URL set (your Neon connection string)
# - pg_dump and psql in PATH (from Postgres client tools)

set -e

LOCAL_URL="${DATABASE_URL:-postgresql://postgres:password@localhost:5432/lyra-airtable-6}"
NEON_URL="${NEON_DATABASE_URL}"

if [ -z "$NEON_URL" ]; then
  echo "Error: NEON_DATABASE_URL is not set."
  echo "Get it from https://console.neon.tech → your project → Connection details"
  echo ""
  echo "Example:"
  echo "  export NEON_DATABASE_URL='postgresql://user:pass@ep-xxx.pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'"
  exit 1
fi

echo "→ Migrating from local DB to Neon..."
echo "  Local:  ${LOCAL_URL%%@*}@***"
echo "  Neon:   ${NEON_URL%%@*}@***"
echo ""

# 1. Apply Prisma migrations to Neon (creates schema)
echo "1/3 Applying schema to Neon..."
DATABASE_URL="$NEON_URL" bunx prisma migrate deploy

# 2. Dump data only from local (no schema)
echo "2/3 Dumping data from local DB..."
pg_dump "$LOCAL_URL" \
  --data-only \
  --no-owner \
  --no-privileges \
  -f /tmp/lyra-data.sql

# 3. Restore data to Neon
echo "3/3 Restoring data to Neon..."
psql "$NEON_URL" -f /tmp/lyra-data.sql

rm -f /tmp/lyra-data.sql
echo ""
echo "✓ Migration complete! Update your .env DATABASE_URL to use Neon."
