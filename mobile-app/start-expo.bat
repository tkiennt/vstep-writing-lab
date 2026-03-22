@echo off
REM Tắt CI để Expo hiện mã QR trong terminal
set CI=
set CI_ENV=
set EXPO_NO_INTERACTIVE=
cd /d "%~dp0"
echo Starting Expo (LAN)...
call npx expo start --clear --lan
