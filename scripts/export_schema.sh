#!/bin/bash

# Ensure we're in the project root
cd "$(dirname "$0")/.."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: Supabase CLI is not installed."
    echo "Please install it via npm: npm install -g supabase"
    echo "Or follow instructions at: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Load .env file
if [ -f .env ]; then
    export $(cat .env | xargs)
else
    echo "Error: .env file not found."
    exit 1
fi

# Check for Project ID
if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "Error: VITE_SUPABASE_URL not found in .env"
    exit 1
fi

# Extract Project ID from URL (e.g., https://<project_id>.supabase.co)
PROJECT_ID=$(echo $VITE_SUPABASE_URL | sed -E 's/https:\/\/([a-z0-9]+)\.supabase\.co/\1/')

if [ -z "$PROJECT_ID" ]; then
    echo "Error: Could not extract Project ID from VITE_SUPABASE_URL"
    exit 1
fi

echo "Exporting schema for project: $PROJECT_ID"

# Ensure supabase directory exists
mkdir -p supabase

# Login check (basic check if logged in)
supabase projects list &> /dev/null
if [ $? -ne 0 ]; then
    echo "You are not logged in to Supabase CLI."
    echo "Please run: supabase login"
    exit 1
fi

# Link project (defines which project 'db dump' targets)
# This may ask for your database password
echo "Linking to Supabase project..."
# We use || true because if it's already linked or fails, we want to try dumping anyway (if previously linked)
# But strictly speaking, 'link' is needed for a fresh setup.
supabase link --project-ref "$PROJECT_ID"

# Check if Docker is available and running
if command -v docker &> /dev/null && docker info &> /dev/null; then
    # Docker is available, use Supabase CLI
    echo "Dumping schema using Supabase CLI (Docker)..."
    if supabase db dump > supabase/schema.sql; then
        echo "Schema exported successfully to supabase/schema.sql"
        exit 0
    fi
    echo "Supabase CLI dump failed. Trying fallback..."
fi

# Fallback to pg_dump if Docker is missing or failed
if command -v pg_dump &> /dev/null; then
    echo "Docker not detected or failed. Falling back to native pg_dump."
    
    # Check for password in .env or prompt
    if [ -z "$SUPABASE_DB_PASSWORD" ]; then
        echo "Please enter your Supabase Database Password (connection string construction):"
        read -s -p "Password: " DB_PASSWORD
        echo ""
    else
        echo "Using SUPABASE_DB_PASSWORD from .env"
        DB_PASSWORD="$SUPABASE_DB_PASSWORD"
    fi

    if [ -z "$DB_PASSWORD" ]; then
        echo "Error: Password cannot be empty."
        exit 1
    fi

    # Determine DB URL
    # If SUPABASE_DB_URL is set in .env, use it (allows IPv4 override)
    if [ -n "$SUPABASE_DB_URL" ]; then
        echo "Using SUPABASE_DB_URL from .env"
        DB_URL="$SUPABASE_DB_URL"
    else
        # Construct connection string
        # Host format: db.<project_ref>.supabase.co
        # Note: This host is often IPv6 only. If you have network issues, set SUPABASE_DB_URL in .env
        # using the Connection Pooler string (IPv4 compatible).
        DB_URL="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_ID}.supabase.co:5432/postgres"
    fi

    echo "Dumping schema via pg_dump..."
    # Capture output to check for specific error messages
    OUTPUT=$(pg_dump "$DB_URL" --schema-only 2>&1)
    EXIT_CODE=$?

    if [ $EXIT_CODE -eq 0 ]; then
        echo "$OUTPUT" > supabase/schema.sql
        echo "Schema exported successfully to supabase/schema.sql"
    else
        echo "$OUTPUT"
        echo ""
        echo "Error dumping schema with pg_dump."
        echo "Possible reasons:"
        
        # Check for version mismatch
        if echo "$OUTPUT" | grep -q "server version mismatch"; then
            echo "1. VERSION MISMATCH: Your local 'pg_dump' is older than the Supabase server."
            echo "   - Server: 17.x, You: 16.x (or older)"
            echo "   - Solution: Install PostgreSQL 17 client tools."
        else
            echo "1. Incorrect password."
            echo "2. Network issues (IPv6/IPv4). Ensure SUPABASE_DB_URL uses port 6543 (pooler)."
        fi
        exit 1
    fi
else
    echo "Error: Neither Docker (for 'supabase db dump') nor 'pg_dump' (native) were found/usable."
    echo "Please install Docker Desktop OR PostgreSQL client tools (pg_dump)."
    exit 1
fi
