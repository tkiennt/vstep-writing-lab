# Bật QR code: tắt chế độ CI / non-interactive
$env:CI = $null
$env:CI_ENV = $null
$env:EXPO_NO_INTERACTIVE = $null

Set-Location $PSScriptRoot
Write-Host "Starting Expo (LAN mode - same WiFi as phone)..." -ForegroundColor Green
npx expo start --clear --lan
