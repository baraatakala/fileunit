@echo off
echo ======================================
echo  GitHub Deployment Script
echo ======================================

cd /d "C:\Users\isc\VS_Code\project_2\project_2\file-sharing-platform"

echo.
echo Current directory: %CD%
echo.

echo Initializing Git repository...
git init

echo.
echo Adding all files...
git add .

echo.
echo Creating commit...
git commit -m "Initial commit: Construction File Sharing Platform"

echo.
echo Adding GitHub remote...
git remote add origin https://github.com/baraatakala/file-tracking.git

echo.
echo Pushing to GitHub...
git push -u origin main

echo.
echo ======================================
echo Deployment complete!
echo Your project is now at:
echo https://github.com/baraatakala/file-tracking
echo ======================================

pause
