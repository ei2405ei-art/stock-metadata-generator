@echo off
cd /d "%~dp0."
start "VideoModeratorServer" /min node phone-server.js
timeout /t 2 /nobreak >nul
start "" "http://localhost:8080/video-moderation-checker.html"
exit /b
