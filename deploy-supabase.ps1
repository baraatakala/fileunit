# Deploy Construction File Sharing Platform with Supabase
# Deployment script for Render.com

Write-Host "🚀 Deploying Construction File Sharing Platform with Supabase..." -ForegroundColor Green

# Navigate to project directory
Set-Location "C:\Users\isc\VS_Code\project_2\project_2\file-sharing-platform"

Write-Host "📂 Current directory: $(Get-Location)" -ForegroundColor Yellow

# Check if Supabase is configured
if (-not $env:SUPABASE_ANON_KEY -or $env:SUPABASE_ANON_KEY -eq "your-actual-key-here") {
    Write-Host "⚠️ WARNING: SUPABASE_ANON_KEY environment variable not set!" -ForegroundColor Red
    Write-Host "   Please set up your Supabase environment variables before deployment." -ForegroundColor Red
    Write-Host "   See SUPABASE_SETUP.md for instructions." -ForegroundColor Red
}

# Git operations
Write-Host "📝 Adding files to git..." -ForegroundColor Cyan
git add .

$commitMessage = "Deploy: Supabase file storage integration - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
Write-Host "💬 Committing with message: $commitMessage" -ForegroundColor Cyan
git commit -m $commitMessage

Write-Host "🔄 Pushing to GitHub..." -ForegroundColor Cyan
git push origin main

Write-Host "" -ForegroundColor Green
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "" -ForegroundColor Green
Write-Host "🌐 Your platform will be available at:" -ForegroundColor Green
Write-Host "   https://fileunit-1.onrender.com" -ForegroundColor Blue
Write-Host "" -ForegroundColor Green
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Set up Supabase project (see SUPABASE_SETUP.md)" -ForegroundColor White
Write-Host "   2. Add SUPABASE_ANON_KEY to Render environment variables" -ForegroundColor White
Write-Host "   3. Create 'construction-files' bucket in Supabase Storage" -ForegroundColor White
Write-Host "   4. Run database setup SQL in Supabase SQL Editor" -ForegroundColor White
Write-Host "" -ForegroundColor Green
Write-Host "🎉 Files will now persist permanently in Supabase!" -ForegroundColor Green
