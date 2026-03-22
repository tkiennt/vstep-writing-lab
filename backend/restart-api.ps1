# Dừng mọi instance API (cổng + process), rồi chạy lại.
# PowerShell:  cd ...\backend   ;  .\restart-api.ps1
#
# Lỗi "address already in use" / "file locked by VstepWritingLab.API":
# → Còn process cũ. Chạy script này HOẶC: Task Manager → End task "VstepWritingLab.API" / "dotnet"

$ErrorActionPreference = 'SilentlyContinue'
$ports = @(5260, 5288, 7133)

Write-Host "=== Dung VstepWritingLab.API (neu co) ===" -ForegroundColor Yellow
Get-Process -Name 'VstepWritingLab.API' -ErrorAction SilentlyContinue | ForEach-Object {
  Write-Host "  Stop VstepWritingLab.API PID $($_.Id)"
  Stop-Process -Id $_.Id -Force
}

Write-Host "`n=== Dung listener tren cong: $($ports -join ', ') ===" -ForegroundColor Yellow
foreach ($port in $ports) {
  Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
    ForEach-Object {
      $owningPid = $_.OwningProcess
      $p = Get-Process -Id $owningPid -ErrorAction SilentlyContinue
      Write-Host "  Stop PID $owningPid (port $port) [$($p.ProcessName)]"
      Stop-Process -Id $owningPid -Force -ErrorAction SilentlyContinue
    }
}

Start-Sleep -Seconds 2

$apiDir = Join-Path $PSScriptRoot 'VstepWritingLab.API'
if (-not (Test-Path $apiDir)) {
  Write-Host "Khong tim thay: $apiDir" -ForegroundColor Red
  exit 1
}
Set-Location $apiDir
Write-Host "`n=== dotnet run --launch-profile http ===`n" -ForegroundColor Green
dotnet run --launch-profile http
