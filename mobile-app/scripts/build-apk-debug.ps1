# Build debug APK (no Expo Go). Needs Android Studio SDK + JDK 11+ (Android Studio JBR).
# Do NOT use subst() for this project (breaks node in settings.gradle).
#
# If CMake/Ninja fails: Windows Defender exclusions, short path C:\dev\vstep-mobile, or npm run eas:apk:preview
#
# Run from mobile-app: .\scripts\build-apk-debug.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root
$MobileRoot = (Resolve-Path $Root).Path

$Jbr = "C:\Program Files\Android\Android Studio\jbr"
if (Test-Path $Jbr) {
  $env:JAVA_HOME = $Jbr
  $env:PATH = "$Jbr\bin;$env:PATH"
} else {
  Write-Warning "Android Studio JBR not found at $Jbr. Install JDK 17+ and set JAVA_HOME."
}

$Sdk = "$env:LOCALAPPDATA\Android\Sdk"
if (Test-Path $Sdk) {
  $env:ANDROID_HOME = $Sdk
  $env:ANDROID_SDK_ROOT = $Sdk
  $env:PATH = "$Sdk\platform-tools;$env:PATH"
}

if (-not $env:NODE_ENV) {
  $env:NODE_ENV = "development"
}

# Reduce parallel native compile (helps some Windows Ninja "dirty" issues)
$env:CMAKE_BUILD_PARALLEL_LEVEL = "1"
$env:NINJA_NUM_JOBS = "1"

Write-Host "JAVA_HOME=$env:JAVA_HOME" -ForegroundColor DarkGray
Write-Host "ANDROID_HOME=$env:ANDROID_HOME" -ForegroundColor DarkGray

Write-Host "==> expo prebuild (android)..." -ForegroundColor Cyan
npx expo prebuild --platform android --clean

if (-not (Test-Path "android\gradlew.bat")) {
  Write-Error "android\gradlew.bat not found after prebuild."
}

$LocalProps = Join-Path $MobileRoot "android\local.properties"
if (Test-Path $LocalProps) {
  $lp = Get-Content $LocalProps -Raw
  if ($lp -match 'cmake[/\\]3\.22\.1') {
    Write-Warning "Only CMake 3.22.1 found. Install CMake 3.31+ (Android Studio > SDK Manager > SDK Tools) to reduce Ninja 'build.ninja still dirty' errors on Windows."
  }
}

# Drop stale CMake/Ninja outputs in node_modules (avoids "build.ninja still dirty" loops on Windows)
$NativeCaches = @(
  "node_modules\react-native-screens\android\.cxx",
  "node_modules\expo-modules-core\android\.cxx"
)
foreach ($rel in $NativeCaches) {
  $p = Join-Path $MobileRoot $rel
  if (Test-Path $p) {
    Write-Host "Removing native build cache: $rel" -ForegroundColor DarkGray
    Remove-Item -Recurse -Force $p
  }
}

Write-Host "==> assembleDebug (--no-daemon --no-build-cache)..." -ForegroundColor Cyan
Set-Location (Join-Path $MobileRoot "android")

# --no-daemon: avoid stale file locks; --no-build-cache: avoid bad CMake cache on Windows
# Do not pipe output: pipeline breaks $LASTEXITCODE for gradlew.bat on Windows PowerShell 5.
.\gradlew.bat --no-daemon --no-build-cache assembleDebug
$gradleExit = $LASTEXITCODE

Set-Location $MobileRoot

if ($gradleExit -ne 0) {
  Write-Host ""
  Write-Host "Gradle FAILED (exit code $gradleExit). Scroll up for the first error (often Ninja/CMake)." -ForegroundColor Red
  Write-Host "Retry with log: cd android; .\gradlew.bat --no-daemon assembleDebug --stacktrace 2>&1 | Tee-Object ..\gradle-error.log" -ForegroundColor Yellow
  Write-Host "Or build in cloud: npm run eas:apk:preview" -ForegroundColor Yellow
  Write-Error "Gradle assembleDebug failed."
  exit $gradleExit
}

$Apk = Join-Path $MobileRoot "android\app\build\outputs\apk\debug\app-debug.apk"
if (Test-Path $Apk) {
  Write-Host ""
  Write-Host "OK - debug APK:" -ForegroundColor Green
  Write-Host $Apk
  Write-Host ""
  Write-Host "Install: adb install -r `"$Apk`"" -ForegroundColor Yellow
} else {
  Write-Host "Gradle reported success but APK path missing. Expected:" -ForegroundColor Yellow
  Write-Host $Apk
  Write-Error 'APK not found at expected path.'
}
