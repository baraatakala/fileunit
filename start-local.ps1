Write-Host "Starting Construction File Sharing Platform (Local Storage)..." -ForegroundColor Green
Write-Host ""

# Define Node.js paths
$nodePath = "C:\Program Files\nodejs\node.exe"

# Test Node.js installation
Write-Host "Testing Node.js installation..." -ForegroundColor Yellow

if (-not (Test-Path $nodePath)) {
    Write-Host "ERROR: Node.js not found at: $nodePath" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

try {
    $nodeVersion = & $nodePath --version
    Write-Host "SUCCESS: Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Error running Node.js: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Starting Construction File Sharing Platform..." -ForegroundColor Green
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Files will be stored locally in: backend/uploads/" -ForegroundColor Cyan
Write-Host "No Firebase configuration required" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Change to backend directory
$backendPath = "c:\Users\isc\VS_Code\project_2\project_2\file-sharing-platform\backend"
Write-Host "Changing to directory: $backendPath" -ForegroundColor Gray
Set-Location $backendPath

# Verify we're in the right directory
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Gray
if (-not (Test-Path "server-local.js")) {
    Write-Host "server-local.js not found in: $(Get-Location)" -ForegroundColor Red
    Write-Host "Available files:" -ForegroundColor Yellow
    Get-ChildItem -Name
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "Starting server..." -ForegroundColor Green

# Start the server
try {
    & $nodePath "server-local.js"
} catch {
    Write-Host "Error starting server: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
