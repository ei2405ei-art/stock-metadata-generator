@echo off
chcp 65001 >nul
node "%~dp0phone-server.js"
if errorlevel 1 (
  echo.
  echo Node.js not found. Install from https://nodejs.org/ and try again.
  pause
)
