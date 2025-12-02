-- Init script for PostgreSQL
-- This file will be executed automatically when the container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create migrations table for TypeORM
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    timestamp BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL
);

-- Create index on timestamp for better performance
CREATE INDEX IF NOT EXISTS idx_migrations_timestamp ON migrations(timestamp);
