# Sharda Palace Windows Startup Registration
# Run this script ONCE as Administrator to auto-start server on Windows login.
# Usage: Right-click → Run with PowerShell

param([switch]$Remove)

$TaskName = "ShardaPalaceServer"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir
$BatFile = Join-Path $ScriptDir "start-sharda.bat"

if ($Remove) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "✓ Sharda Palace auto-start removed." -ForegroundColor Green
    exit 0
}

# Check if bat file exists
if (-not (Test-Path $BatFile)) {
    Write-Error "start-sharda.bat not found at: $BatFile"
    exit 1
}

# Create scheduled task to run at user login (hidden window)
$Action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$BatFile`"" -WorkingDirectory $ProjectDir
$Trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$Settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Hours 0) -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Principal $Principal -Force | Out-Null

Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  ✓ Sharda Palace auto-start registered!      ║" -ForegroundColor Cyan
Write-Host "║  Server will start automatically on login.   ║" -ForegroundColor Cyan
Write-Host "║  Admin: http://localhost:3001/admin          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "To remove: .\add-startup.ps1 -Remove" -ForegroundColor Yellow
Write-Host "Task name: $TaskName" -ForegroundColor Gray
