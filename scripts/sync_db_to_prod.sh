#!/bin/bash

# Ensure we're in the project root
cd "$(dirname "$0")/.."

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "Error: psql is not installed."
    exit 1
fi

# Load .env file
if [ -f .env ]; then
    export $(cat .env | xargs)
else
    echo "Error: .env file not found."
    exit 1
fi

# Determine DB URL
if [ -n "$SUPABASE_DB_URL" ]; then
    echo "Using SUPABASE_DB_URL from .env"
    DB_URL="$SUPABASE_DB_URL"
else
    # Fallback to constructing it
    if [ -z "$VITE_SUPABASE_URL" ]; then
        echo "Error: VITE_SUPABASE_URL not found in .env"
        exit 1
    fi
    if [ -z "$SUPABASE_DB_PASSWORD" ]; then
        echo "Error: SUPABASE_DB_PASSWORD not found in .env"
        exit 1
    fi

    # Extract Project ID from URL
    PROJECT_ID=$(echo $VITE_SUPABASE_URL | sed -E 's/https:\/\/([a-z0-9]+)\.supabase\.co/\1/')
    
    if [ -z "$PROJECT_ID" ]; then
        echo "Error: Could not extract Project ID from VITE_SUPABASE_URL"
        exit 1
    fi
    
    DB_URL="postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.${PROJECT_ID}.supabase.co:5432/postgres"
fi

echo "Syncing data to remote DB..."
echo "Target: ${DB_URL//@*:*/@*******:****}" # Mask password in output

# Truncate tables to ensure clean state for data sync
# We truncate auth.users CASCADE to clear profiles/identities/sessions etc.
# We truncate public tables that might not be linked to users as well.
echo "Truncating remote tables..."
psql "$DB_URL" -c "TRUNCATE TABLE auth.users, public.store_settings, public.products, public.orders, public.order_items, public.reviews, public.addresses CASCADE;"

if [ $? -ne 0 ]; then
    echo "Error truncating tables. Aborting."
    exit 1
fi

echo "Applying seed.sql..."
psql "$DB_URL" -f supabase/seed.sql

if [ $? -eq 0 ]; then
    echo "Database sync completed successfully."
else
    echo "Error applying seed.sql"
    exit 1
fi
