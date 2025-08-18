# --- Stop-Zyptopia.ps1 ---
$project = "C:\Users\zacev\OneDrive\Desktop\Zyptopia\my-app"
$pidFile = Join-Path $project ".serve.pid"

Set-Location $project

if (Test-Path $pidFile) {
    $pid = Get-Content $pidFile | Select-Object -First 1
    if ($pid -and (Get-Process -Id $pid -ErrorAction SilentlyContinue)) {
        Write-Host "→ Stopping serve process PID $pid"
        Stop-Process -Id $pid -Force
        Remove-Item $pidFile -ErrorAction SilentlyContinue
        Write-Host "✓ Stopped."
        exit 0
    }
    Remove-Item $pidFile -ErrorAction SilentlyContinue
}

# Fallback: kill anything on port 3000
Write-Host "→ PID file not found. Checking port 3000..."
$line = netstat -ano | Select-String ":3000\s+.*LISTENING\s+(\d+)"
if ($line) {
    $pid = [int]($line.Matches.Groups[1].Value)
    Write-Host "→ Killing PID $pid using port 3000"
    taskkill /PID $pid /F | Out-Null
    Write-Host "✓ Stopped."
} else {
    Write-Host "✓ Nothing running on port 3000."
}
