# --- Start-Zyptopia.ps1 ---
$ErrorActionPreference = "Stop"
$project = "C:\Users\zacev\OneDrive\Desktop\Zyptopia\my-app"
$port    = 3000
$pidFile = Join-Path $project ".serve.pid"

Write-Host "→ Switching to project: $project"
Set-Location $project

# Clean old build (ignore if missing)
Write-Host "→ Cleaning old build"
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue

# Install deps (fast if already present)
Write-Host "→ Installing dependencies"
npm install | Out-Host

# Build with OpenSSL legacy flag (CRA + Node 20/22)
Write-Host "→ Building production bundle"
$env:NODE_OPTIONS="--openssl-legacy-provider"
npm run build | Out-Host
Remove-Item Env:\NODE_OPTIONS -ErrorAction SilentlyContinue

# Start server in a new PowerShell window, save PID so we can stop it later
Write-Host "→ Starting server on port $port"
$serveCmd = "npx serve -s build -l $port"
$proc = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit","-Command",$serveCmd -PassThru -WindowStyle Minimized
$proc.Id | Set-Content $pidFile

# Open browser
Start-Process "http://localhost:$port"
Write-Host "✓ Running at http://localhost:$port  (PID $($proc.Id)). To stop, run Stop-Zyptopia.ps1."
