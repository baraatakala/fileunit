Write-Host "Starting Construction File Sharing Platform (Local Storage)..." -ForegroundColor Green
Write-Host ""

# Define Node.js path
$nodePath = "C:\Program Files\nodejs\node.exe"

# Test Node.js installation
Write-Host "Testing Node.js installation..." -ForegroundColor Yellow

if (-not (Test-Path $nodePath)) {
    Write-Host "Node.js not found at: $nodePath" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

try {
    $nodeVersion = & $nodePath --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error running Node.js: $_" -ForegroundColor Red
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
$backendPath = "C:\Users\isc\VS_Code\project_2\project_2\file-sharing-platform\backend"
Write-Host "Changing to directory: $backendPath" -ForegroundColor Gray

# Verify the backend directory exists
if (-not (Test-Path $backendPath)) {
    Write-Host "Backend directory not found: $backendPath" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

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

# Check if port 3000 is already in use
$portCheck = netstat -ano | findstr ":3000"
if ($portCheck) {
    Write-Host "Port 3000 is already in use. Checking for existing Node.js processes..." -ForegroundColor Yellow
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Host "Found existing Node.js processes. You may need to stop them first." -ForegroundColor Yellow
        Write-Host "Processes:" -ForegroundColor Gray
        $nodeProcesses | Format-Table Id, ProcessName, CPU -AutoSize
        $response = Read-Host "Do you want to kill existing Node.js processes? (y/n)"
        if ($response -eq "y" -or $response -eq "Y") {
            $nodeProcesses | Stop-Process -Force
            Write-Host "Stopped existing Node.js processes." -ForegroundColor Green
            Start-Sleep 2
        } else {
            Write-Host "Server startup cancelled." -ForegroundColor Yellow
            Read-Host "Press Enter to exit"
            exit 0
        }
    }
}

# Start the server
try {
    Write-Host "Executing: & `"$nodePath`" `"server-local.js`"" -ForegroundColor Gray
    & $nodePath "server-local.js"
} catch {
    Write-Host "Error starting server: $_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
