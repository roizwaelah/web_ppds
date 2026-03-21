$ErrorActionPreference = 'Stop'

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$logPath = Join-Path $baseDir 'jwt_maintenance.log'
$archiveDir = Join-Path $baseDir 'logs'

if (!(Test-Path $archiveDir)) {
    New-Item -ItemType Directory -Path $archiveDir | Out-Null
}

if (Test-Path $logPath) {
    $size = (Get-Item $logPath).Length
    if ($size -gt 0) {
        $stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
        $archivePath = Join-Path $archiveDir ("jwt_maintenance_$stamp.log")
        Copy-Item -Path $logPath -Destination $archivePath -Force
        Clear-Content -Path $logPath -Force
    }
}

# Keep latest 30 archives
Get-ChildItem -Path $archiveDir -File -Filter 'jwt_maintenance_*.log' |
    Sort-Object LastWriteTime -Descending |
    Select-Object -Skip 30 |
    Remove-Item -Force -ErrorAction SilentlyContinue
