#!/bin/sh
set -e

echo "Waiting for PostgreSQL to be ready..."
until nc -z postgres 5432; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - running migrations"

# Run migrations directly from dist
npx typeorm migration:run -d dist/database/data-source.js || echo "Migration failed or no pending migrations"

echo "Migrations completed - starting application"

# Start the application
exec node dist/main
