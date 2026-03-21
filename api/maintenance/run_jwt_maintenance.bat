@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "JWT_SCRIPT=%SCRIPT_DIR%jwt_maintenance.php"
set "LOG_FILE=%SCRIPT_DIR%jwt_maintenance.log"

where php >nul 2>&1
if %ERRORLEVEL% EQU 0 (
  php "%JWT_SCRIPT%" >> "%LOG_FILE%" 2>&1
) else (
  echo [ERROR] php executable not found in PATH >> "%LOG_FILE%"
  exit /b 1
)
