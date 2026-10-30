@echo off
chcp 65001 >nul
title Модератор видео Adobe Stock
cd /d "%~dp0"

rem --- Поднимаем локальный сервер в фоне (если ещё не запущен) ---
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$port=8080;" ^
  "$busy=Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue;" ^
  "if(-not $busy){ Start-Process -FilePath 'node' -ArgumentList 'phone-server.js' -WorkingDirectory '%~dp0' -WindowStyle Hidden }"

rem --- Ждём, пока сервер поднимется ---
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ok=$false; for($i=0;$i -lt 30;$i++){ try{ $r=Invoke-WebRequest -Uri 'http://localhost:8080/video-moderation-checker.html' -UseBasicParsing -TimeoutSec 1; if($r.StatusCode -eq 200){$ok=$true; break} }catch{}; Start-Sleep -Milliseconds 400 }"

rem --- Открываем приложение в браузере по умолчанию ---
start "" "http://localhost:8080/video-moderation-checker.html"
exit /b
