@echo off
echo ========================================
echo  RSSB Kesnand Satsang Report Maker
echo  Local server + Cloudflare Tunnel
echo ========================================
echo.

if not exist .env (
    echo WARNING: .env file not found!
    echo Copy .env.example to .env and set MONGODB_URI.
    echo.
)

if not exist node_modules (
    echo Installing dependencies...
    npm install
    echo.
)

echo Starting API server on http://localhost:3000
start "Report Maker Server" cmd /k node server.js

timeout /t 3 /nobreak >nul

echo Starting Cloudflare Tunnel for internet access...
echo Use the https://*.trycloudflare.com URL printed below.
echo.

npx cloudflared tunnel --url http://localhost:3000

pause
