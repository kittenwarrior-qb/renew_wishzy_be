#!/bin/sh
set -e

echo "Waiting for PostgreSQL to be ready..."
until nc -z postgres 5432; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - syncing migrations"

# Sync migrations to database (mark existing migrations as run)
npm run sync:migrations || echo "Sync migrations failed, continuing..."

echo "Running pending migrations"

# Run any new migrations
npm run migration:run || echo "No pending migrations"

echo "Migrations completed - starting application"

# Start the application
exec node dist/main
