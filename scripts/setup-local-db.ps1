# ClientPilot — setup local PostgreSQL (Windows)
# Creates user + database for development without Docker.
#
# Usage:
#   .\scripts\setup-local-db.ps1
#   .\scripts\setup-local-db.ps1 -PostgresUser postgres -PsqlPath "C:\pgsql\bin\psql.exe"

param(
  [string]$PostgresUser = "postgres",
  [string]$Host = "localhost",
  [string]$PsqlPath = ""
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$sqlFile = Join-Path $PSScriptRoot "setup-local-db.sql"

if (-not $PsqlPath) {
  $found = Get-Command psql -ErrorAction SilentlyContinue
  if ($found) {
    $PsqlPath = $found.Source
  } else {
    $candidates = @(
      "C:\pgsql\bin\psql.exe",
      "C:\Program Files\PostgreSQL\16\bin\psql.exe",
      "C:\Program Files\PostgreSQL\15\bin\psql.exe"
    )
    foreach ($c in $candidates) {
      if (Test-Path $c) { $PsqlPath = $c; break }
    }
  }
}

if (-not $PsqlPath -or -not (Test-Path $PsqlPath)) {
  Write-Error "psql not found. Install PostgreSQL or pass -PsqlPath."
}

Write-Host "Using psql: $PsqlPath"
Write-Host "Creating user and database via $sqlFile ..."

& $PsqlPath -U $PostgresUser -h $Host -f $sqlFile

if ($LASTEXITCODE -ne 0) {
  Write-Error "setup-local-db.sql failed (exit $LASTEXITCODE)"
}

Write-Host ""
Write-Host "Done. Next steps:"
Write-Host "  cd $root"
Write-Host "  npm run db:migrate"
Write-Host "  npm run db:seed"
Write-Host "  npm run dev"
