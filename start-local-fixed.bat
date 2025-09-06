@echo off
echo Setting up Node.js PATH and starting local server...
echo.

REM Add Node.js to PATH for this session
set PATH=%PATH%;C:\Program Files\nodejs

REM Navigate to backend directory
cd /d "c:\Users\isc\VS_Code\project_2\project_2\file-sharing-platform\backend"

REM Test if Node.js is accessible
echo Testing Node.js installation...
node -v
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js not found in C:\Program Files\nodejs
    echo Please check your Node.js installation
    pause
    exit /b 1
)

npm -v
if %ERRORLEVEL% neq 0 (
    echo ERROR: npm not found
    pause
    exit /b 1
)

echo.
echo ✅ Node.js and npm are working
echo.

echo Starting Construction File Sharing Platform (Local Storage)...
echo.
echo 🌐 Frontend will be available at: http://localhost:3000
echo 💾 Files will be stored in: backend/uploads/
echo 📁 No Firebase required - using local file storage
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the local server
node server-local.js

pause
