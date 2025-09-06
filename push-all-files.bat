@echo off
echo Pushing ALL files to GitHub...
echo.

cd "C:\Users\isc\VS_Code\project_2\project_2\file-sharing-platform"

echo Current directory: %CD%
echo.

echo Checking git status...
git status

echo.
echo Adding all files...
git add .

echo.
echo Committing files...
git commit -m "Complete deployment: Add server.js, frontend files, package.json with all dependencies"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo Done! Check GitHub repository now.
pause
