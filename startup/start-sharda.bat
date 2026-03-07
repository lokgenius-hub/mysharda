@echo off
title Sharda Palace - Local Server
color 0B
echo.
echo  ╔════════════════════════════════════════╗
echo  ║     SHARDA PALACE - Local Server       ║
echo  ║     http://localhost:3001/admin        ║
echo  ╚════════════════════════════════════════╝
echo.

:: Change to the project directory
cd /d "%~dp0.."

:: Check if node_modules exists
if not exist "node_modules" (
  echo [INFO] Installing dependencies first...
  call npm install
  echo.
)

:: Check if .env.local exists
if not exist ".env.local" (
  echo [WARNING] .env.local not found!
  echo Copy .env.local.example to .env.local and fill in your Supabase keys.
  echo.
  pause
  exit /b 1
)

echo [OK] Starting Sharda Palace server on port 3001...
echo [OK] Admin Panel: http://localhost:3001/admin
echo [OK] Public Site: http://localhost:3001
echo.
echo Press Ctrl+C to stop the server.
echo.

npm run dev
pause
