# VibeCheck Dashboard - Environment Diagnostic
# Run in PowerShell: .\check-environment.ps1

Write-Host "=== VibeCheck Dashboard - Environment Check ===" -ForegroundColor Cyan
Write-Host ""

function Test-Command {
    param([string]$Cmd, [string]$Label, [string]$InstallUrl)
    $exists = Get-Command $Cmd -ErrorAction SilentlyContinue
    if ($exists) {
        $version = & $Cmd --version 2>&1 | Select-Object -First 1
        Write-Host "[OK]   $Label : $version" -ForegroundColor Green
        return $true
    } else {
        Write-Host "[MISS] $Label : not installed" -ForegroundColor Red
        Write-Host "       Install: $InstallUrl" -ForegroundColor Yellow
        return $false
    }
}

$docker      = Test-Command "docker"  "Docker"  "https://www.docker.com/products/docker-desktop/"
$dockerCompose = $false
if ($docker) {
    $cv = docker compose version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK]   Docker Compose : $cv" -ForegroundColor Green
        $dockerCompose = $true
    } else {
        Write-Host "[MISS] Docker Compose plugin missing (update Docker Desktop)" -ForegroundColor Red
    }
}

$python = Test-Command "python" "Python"  "https://www.python.org/downloads/ (check 'Add to PATH' during install)"
$node   = Test-Command "node"   "Node.js" "https://nodejs.org/ (LTS version)"
$npm    = Test-Command "npm"    "npm"     "(comes with Node.js)"

Write-Host ""
Write-Host "=== Verdict ===" -ForegroundColor Cyan

if ($docker -and $dockerCompose) {
    Write-Host "RECOMMENDED: Use Docker (one command):" -ForegroundColor Green
    Write-Host "  docker compose up --build" -ForegroundColor White
} elseif ($python -and $node -and $npm) {
    Write-Host "OK without Docker. Run:" -ForegroundColor Green
    Write-Host "  .\start-local.ps1" -ForegroundColor White
} else {
    Write-Host "Action required:" -ForegroundColor Yellow
    Write-Host "  Easiest path: install Docker Desktop, then run 'docker compose up --build'" -ForegroundColor White
    Write-Host "  Manual path:  install Python 3.11+ AND Node.js 20+, then run '.\start-local.ps1'" -ForegroundColor White
}
Write-Host ""
