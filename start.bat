@echo off
echo Starting Construction File Sharing Platform...
echo.

REM Navigate to backend directory
cd /d "%~dp0backend"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Dependencies not installed. Installing now...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if .env file exists
if not exist ".env" (
    echo ERROR: .env file not found. Please run setup.bat first.
    pause
    exit /b 1
)

REM Check if Firebase config exists
if not exist "..\config\firebase-service-account.json" (
    echo WARNING: Firebase service account file not found.
    echo The application may not work properly without Firebase configuration.
    echo Please see README.md for setup instructions.
    echo.
)

echo Starting server...
echo.
echo The application will be available at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.

REM Start the application
call npm start

pause
