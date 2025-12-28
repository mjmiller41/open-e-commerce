# Database Setup

This project uses [Supabase](https://supabase.com/) as its backend service.

## Prerequisites

To export the database schema, you need **one** of the following setups. The export script (`npm run db:export`) will automatically detect which one you have.

### Option A: Docker (Official Way)

- **Best for:** Development teams, robust local environments.
- **Requirement:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- **Supabase CLI:** `npm install -g supabase`

### Option B: PostgreSQL Client (Lightweight Way)

- **Best for:** Quick exports without installing Docker.
- **Requirement:** `pg_dump` installed.
  - **MacOS:** `brew install libpq && brew link --force libpq` (or `brew install postgresql`)
  - **Linux:** `sudo apt-get install postgresql-client`
  - **Windows:** Download [PostgreSQL Command Line Tools](https://www.postgresql.org/download/windows/)
- **Note:** This method will prompt you for your Supabase **Database Password** during the export.

## Exporting Schema

To export the current schema from the configured Supabase project (defined in `.env`), run:

```bash
npm run db:export
```

- If you have **Docker**, it will run `supabase db dump`.
- If you **don't** have Docker, it will fallback to `pg_dump` and ask for your password.

This will generate `supabase/schema.sql`.

This will generate `supabase/schema.sql`.

## Importing Schema (For New Users)

1.  **Create a new Supabase Project**: Go to the [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2.  **Get Project Credentials**:
    - Get your `Project URL` and `anon public key` from Project Settings > API.
    - Update your `.env` file with these values.
3.  **Link Project**:
    ```bash
    supabase link --project-ref <your-project-id>
    ```
    (You can find your Project ID in the Project URL: `https://<project-id>.supabase.co`)
4.  **Push Schema**:
    ```bash
    supabase db push
    ```
    This will apply the `supabase/schema.sql` to your remote database.

Alternatively, you can manually copy the contents of `supabase/schema.sql` and run it in the SQL Editor of your Supabase Dashboard.

## Troubleshooting

### "Network is unreachable" (IPv6 Issues)

If you see a `Network is unreachable` error when using `pg_dump`, it means your network environment does not support IPv6.
**Solution:** Set `SUPABASE_DB_URL` in `.env` to your **Connection Pooler URL** (port 6543) from the Supabase Dashboard.

### "server version mismatch" (pg_dump error)

If you see `aborting because of server version mismatch`, it means your local `pg_dump` is older than Supabase.
**Solution:** Upgrade your local PostgreSQL client to version 17.

**For Ubuntu/Debian:**

```bash
sudo sh -c 'echo "deb https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update
sudo apt-get install -y postgresql-client-17
```
