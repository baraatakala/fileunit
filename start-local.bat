@echo off
echo Starting Construction File Sharing Platform (Local Storage)...
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

echo Starting server with local file storage...
echo.
echo The application will be available at: http://localhost:3000
echo Files will be stored in: backend/uploads/
echo Press Ctrl+C to stop the server
echo.

REM Start the application with local server
call node server-local.js

pause
