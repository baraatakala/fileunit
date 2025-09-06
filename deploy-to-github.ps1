# Git Deployment Script for Construction File Sharing Platform
Write-Host "🚀 Deploying Construction File Sharing Platform to GitHub..." -ForegroundColor Green
Write-Host ""

# Set project directory
$projectPath = "C:\Users\isc\VS_Code\project_2\project_2\file-sharing-platform"
Set-Location $projectPath

Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# Initialize Git repository
Write-Host "🔧 Initializing Git repository..." -ForegroundColor Yellow
git init

# Add remote repository
Write-Host "🔗 Adding GitHub remote..." -ForegroundColor Yellow
git remote add origin https://github.com/baraatakala/file-tracking.git

# Add all files
Write-Host "📦 Adding files to Git..." -ForegroundColor Yellow
git add .

# Create initial commit
Write-Host "💾 Creating initial commit..." -ForegroundColor Yellow
git commit -m "🎉 Initial commit: Construction File Sharing Platform

✨ Features:
- File upload with drag & drop (up to 500MB)
- Version control system
- Support for construction files (PDF, DWG, DXF, images)
- Search and tag functionality
- Professional UI with Arabic support
- Security features (CSP, rate limiting)
- Local file storage
- Production-ready platform

🏗️ Perfect for construction companies and project management"

# Set main branch
Write-Host "🌳 Setting main branch..." -ForegroundColor Yellow
git branch -M main

# Push to GitHub
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main

Write-Host ""
Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌐 Repository URL: https://github.com/baraatakala/file-tracking" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor White
Write-Host "1. Visit the GitHub repository" -ForegroundColor Gray
Write-Host "2. Update the README.md if needed" -ForegroundColor Gray
Write-Host "3. Set up GitHub Pages or deploy to cloud platform" -ForegroundColor Gray
Write-Host "4. Add collaborators if needed" -ForegroundColor Gray

Read-Host "Press Enter to continue"
