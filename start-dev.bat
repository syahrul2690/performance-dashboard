@echo off
REM ============================================================
REM  PUSMANPRO Performance Dashboard - Start Dev Servers
REM  Menyalakan API (NestJS :3000) dan Web (Vite :5173)
REM  di dua jendela terpisah. Tutup jendela untuk menghentikan.
REM ============================================================
setlocal

REM Pastikan Node & pnpm ada di PATH
set "PATH=C:\Program Files\nodejs;%APPDATA%\npm;%PATH%"

REM Pindah ke folder skrip ini (root repo), apa pun lokasinya
cd /d "%~dp0"

echo.
echo  Menjalankan PUSMANPRO Dashboard...
echo  - API : http://localhost:3000/api
echo  - WEB : http://localhost:5173
echo.

start "PUSMANPRO API" cmd /k "pnpm dev:api"
start "PUSMANPRO WEB" cmd /k "pnpm dev:web"

echo  Dua jendela terminal terbuka. Tunggu ~10 detik lalu buka:
echo     http://localhost:5173
echo.
echo  Untuk berhenti: tutup kedua jendela tersebut.
timeout /t 6 >nul
start "" "http://localhost:5173"
endlocal
