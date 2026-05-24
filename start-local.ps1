# VibeCheck Dashboard - Local launcher (no Docker)
# Opens two PowerShell windows: backend on :8000, frontend on :3000

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "=== Starting VibeCheck Dashboard locally ===" -ForegroundColor Cyan

# --- Backend setup ---
$backend = Join-Path $root "backend"
Write-Host ""
Write-Host "[1/3] Installing Python dependencies..." -ForegroundColor Yellow
Push-Location $backend
python -m pip install -r requirements.txt
Pop-Location

# --- Frontend deps ---
$frontend = Join-Path $root "frontend"
if (-not (Test-Path (Join-Path $frontend "node_modules"))) {
    Write-Host ""
    Write-Host "[2/3] Installing npm dependencies (first run, takes a minute)..." -ForegroundColor Yellow
    Push-Location $frontend
    npm install
    Pop-Location
} else {
    Write-Host "[2/3] node_modules already present, skipping npm install." -ForegroundColor Green
}

# --- Launch in separate windows ---
Write-Host ""
Write-Host "[3/3] Launching backend and frontend in separate windows..." -ForegroundColor Yellow

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backend'; python -m uvicorn main:app --reload"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontend'; `$env:NEXT_PUBLIC_API_URL='http://localhost:8000'; npm run dev"

Write-Host ""
Write-Host "Done. Open http://localhost:3000 in your browser." -ForegroundColor Green
Write-Host "Close the two PowerShell windows to stop the servers." -ForegroundColor Gray
