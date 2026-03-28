#!/bin/sh
# Shell script to apply all migrations in alphabetical order

set -e

# Wait for postgres to be ready (assuming this is run inside a container with pg_isready)
# or just execute files
echo "Running migrations..."

for f in /docker-entrypoint-initdb.d/migrations/*.sql; do
    echo "Applying $f..."
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$f"
done

echo "Migrations completed!"
