@echo off
title AI Video Studio — Proxy Server
cd /d "C:\Users\User\Documents\New OpenCode Project"
echo ============================================
echo   AI Video Studio Server
echo   http://localhost:3000/video-generator.html
echo   Ctrl+C to stop
echo ============================================
node proxy-server.js
pause
