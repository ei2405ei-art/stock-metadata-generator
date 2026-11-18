@echo off
cd /d "%~dp0."
start "ImageModeratorServer" /min node phone-server.js
timeout /t 2 /nobreak >nul
start "" "http://localhost:8080/image-moderation-checker.html"
exit /b
