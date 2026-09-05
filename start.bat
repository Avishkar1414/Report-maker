@echo off
echo ========================================
echo  RSSB Kesnand Satsang Report Maker
echo  Starting Backend Server...
echo ========================================
echo.

REM Check if .env exists
if not exist .env (
    echo WARNING: .env file not found!
    echo Please copy .env.example to .env and configure your database connection.
    echo.
)

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    npm install
    echo.
)

echo Starting server on http://localhost:3000
echo Open index.html in your browser or visit http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

node server.js

pause