@echo off
title Al-Ihkam website
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Download the LTS version from https://nodejs.org and run this file again.
  start https://nodejs.org
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing packages for the first time. This takes a minute or two...
  call npm install
  if errorlevel 1 (
    echo Package installation failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
)

echo.
echo Starting the Al-Ihkam website at http://localhost:3000
echo Keep this window open while you use the site. Close it to stop.
echo.
start "" /min cmd /c "timeout /t 8 >nul & start http://localhost:3000"
call npm run dev
pause
