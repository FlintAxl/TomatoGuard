# PowerShell script to start FastAPI backend with Ngrok
# Usage: .\start-ngrok.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TomatoGuard - Ngrok Startup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if ngrok is installed
$ngrokPath = Get-Command ngrok -ErrorAction SilentlyContinue
if (-not $ngrokPath) {
    Write-Host "❌ Ngrok not found in PATH!" -ForegroundColor Red
    Write-Host "Please install Ngrok from https://ngrok.com/download" -ForegroundColor Yellow
    Write-Host "Or add ngrok.exe to your PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Ngrok found: $($ngrokPath.Source)" -ForegroundColor Green
Write-Host ""

# Check if backend directory exists
if (-not (Test-Path "backend")) {
    Write-Host "❌ Backend directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the TomatoGuard root directory" -ForegroundColor Yellow
    exit 1
}

# Check if virtual environment exists
$venvPath = "venv"
if (-not (Test-Path $venvPath)) {
    Write-Host "⚠️  Virtual environment not found. Creating one..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "🔧 Activating virtual environment..." -ForegroundColor Cyan
& "$venvPath\Scripts\Activate.ps1"

# Install/update dependencies
Write-Host "📦 Checking dependencies..." -ForegroundColor Cyan
Set-Location backend
pip install -q -r requirements.txt
Set-Location ..

Write-Host ""
Write-Host "🚀 Starting FastAPI backend on port 8000..." -ForegroundColor Green
Write-Host "   (This will run in a new window)" -ForegroundColor Gray
Write-Host ""

# Start FastAPI in a new window
Start-Process powershell -ArgumentList @"
    -NoExit -Command `
    "cd '$PWD\backend'; `$env:VIRTUAL_ENV='$PWD\venv'; & '$PWD\venv\Scripts\python.exe' -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
"@

# Wait a bit for server to start
Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Check if backend is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/health" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Backend is running!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend might still be starting..." -ForegroundColor Yellow
    Write-Host "   If errors persist, check the backend window" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🌐 Starting Ngrok tunnel..." -ForegroundColor Green
Write-Host "   (This will run in this window)" -ForegroundColor Gray
Write-Host ""
Write-Host "📋 IMPORTANT: Copy the HTTPS URL from Ngrok output below" -ForegroundColor Yellow
Write-Host "   Then update TomatoGuardExpo/.env with:" -ForegroundColor Yellow
Write-Host "   EXPO_PUBLIC_API_URL=https://YOUR_NGROK_URL.ngrok-free.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop Ngrok" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start Ngrok
ngrok http 8000
