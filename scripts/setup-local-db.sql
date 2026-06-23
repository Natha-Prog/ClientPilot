# ClientPilot local PostgreSQL setup
# Run as superuser (postgres) against your local PostgreSQL instance.
#
# PowerShell:
#   psql -U postgres -h localhost -f scripts/setup-local-db.sql
#
# Or use the helper script:
#   .\scripts\setup-local-db.ps1

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'clientpilot') THEN
    CREATE USER clientpilot WITH PASSWORD 'clientpilot';
    RAISE NOTICE 'User clientpilot created';
  ELSE
    RAISE NOTICE 'User clientpilot already exists';
  END IF;
END
$$;

SELECT 'CREATE DATABASE clientpilot OWNER clientpilot'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'clientpilot')\gexec

GRANT ALL PRIVILEGES ON DATABASE clientpilot TO clientpilot;
