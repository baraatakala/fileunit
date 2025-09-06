# Quick Deploy Script for Render
# Usage: .\quick-deploy.ps1 "Your commit message"

param(
    [string]$message = "Quick update and deployment"
)

Write-Host "[DEPLOY] Starting deployment process..." -ForegroundColor Green

# Navigate to project directory
Set-Location "C:\Users\isc\VS_Code\project_2\project_2\file-sharing-platform"

# Add all changes
Write-Host "[*] Adding files..." -ForegroundColor Yellow
git add .

# Commit with provided message
Write-Host "[*] Committing changes..." -ForegroundColor Yellow
git commit -m $message

# Push to GitHub (triggers Render deployment)
Write-Host "[*] Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "[SUCCESS] Deployment initiated! Check Render dashboard for progress." -ForegroundColor Green
Write-Host "[URL] Your site: https://file-tracking-1.onrender.com" -ForegroundColor Cyan
