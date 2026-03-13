$ErrorActionPreference = "Stop"

$EnhanceUrl = "https://raw.githubusercontent.com/hiepau1231/Auggie-Promptenahncer/main/claude-code-enhance/enhance.md"
$DestDir = Join-Path $env:USERPROFILE ".claude\commands"
$DestFile = Join-Path $DestDir "enhance.md"
$TempFile = Join-Path $env:TEMP "enhance_tmp_$([System.IO.Path]::GetRandomFileName()).md"

# Create destination directory
try {
    New-Item -ItemType Directory -Force -Path $DestDir | Out-Null
} catch {
    Write-Host "❌ Failed to create directory. Check permissions."
    exit 1
}

# Download to temp file first
try {
    Invoke-WebRequest -Uri $EnhanceUrl -OutFile $TempFile -UseBasicParsing
} catch {
    Write-Host "❌ Failed to download enhance.md. Check your internet connection."
    if (Test-Path $TempFile) { Remove-Item $TempFile -Force }
    exit 1
}

# Move temp file to destination
try {
    Move-Item -Path $TempFile -Destination $DestFile -Force
} catch {
    Write-Host "❌ Failed to create directory. Check permissions."
    if (Test-Path $TempFile) { Remove-Item $TempFile -Force }
    exit 1
}

Write-Host "✅ /enhance command installed to $DestFile"
Write-Host "   Try it with: /enhance <your prompt>"
