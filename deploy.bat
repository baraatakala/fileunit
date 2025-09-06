@echo off
echo Starting GitHub deployment...

REM Navigate to the project directory
cd /d "C:\Users\isc\VS_Code\project_2\project_2\file-sharing-platform"

REM Check if .git directory exists
if exist .git (
    echo Git repository already initialized.
) else (
    echo Initializing Git repository...
    git init
    if errorlevel 1 (
        echo Error: Git initialization failed
        pause
        exit /b 1
    )
)

REM Configure Git user if not already configured
git config user.name "baraatakala" 2>nul
git config user.email "your-email@example.com" 2>nul

REM Add all files
echo Adding files to Git...
git add .
if errorlevel 1 (
    echo Error: Failed to add files
    pause
    exit /b 1
)

REM Commit changes
echo Creating commit...
git commit -m "Initial commit: Construction File Sharing Platform"
if errorlevel 1 (
    echo Note: No changes to commit or commit failed
)

REM Add remote if not exists
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo Adding GitHub remote...
    git remote add origin https://github.com/baraatakala/file-tracking.git
    if errorlevel 1 (
        echo Error: Failed to add remote
        pause
        exit /b 1
    )
)

REM Push to GitHub
echo Pushing to GitHub...
echo Note: You may need to authenticate with GitHub
git push -u origin main
if errorlevel 1 (
    echo Error: Failed to push to GitHub
    echo Please check your GitHub credentials and repository access
    pause
    exit /b 1
)

echo.
echo Deployment completed successfully!
echo Your project is now available at: https://github.com/baraatakala/file-tracking
pause
