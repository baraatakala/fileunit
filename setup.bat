@echo off
echo Setting up Construction File Sharing Platform...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js first.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js is installed

REM Navigate to backend directory
cd /d "%~dp0backend"

echo.
echo Installing dependencies...
call npm install

if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo ✓ Dependencies installed

REM Check if .env file exists
if not exist ".env" (
    echo.
    echo Creating .env file from template...
    copy .env.template .env
    echo ✓ .env file created
    echo.
    echo IMPORTANT: Please edit the .env file with your Firebase configuration!
    echo Open .env file and replace 'your-project-id' with your actual Firebase project ID
    echo.
) else (
    echo ✓ .env file already exists
)

REM Check if Firebase service account file exists
if not exist "..\config\firebase-service-account.json" (
    echo.
    echo IMPORTANT: Firebase service account file is missing!
    echo Please:
    echo 1. Go to Firebase Console > Project Settings > Service Accounts
    echo 2. Generate a new private key
    echo 3. Save it as 'firebase-service-account.json' in the 'config' folder
    echo.
)

echo.
echo ========================================
echo  Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Configure Firebase (see README.md)
echo 2. Edit .env file with your project details
echo 3. Run: npm start
echo.
echo The app will be available at: http://localhost:3000
echo.
pause
