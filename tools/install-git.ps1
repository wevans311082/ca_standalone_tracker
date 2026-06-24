# Downloads and extracts MinGit (portable Git for Windows) into tools/MinGit
$ErrorActionPreference = 'Stop'

$toolsDir = $PSScriptRoot
$targetDir = Join-Path $toolsDir 'MinGit'
$version = '2.47.1'
$zipName = "MinGit-$version-64-bit.zip"
$zipPath = Join-Path $toolsDir $zipName
$url = "https://github.com/git-for-windows/git/releases/download/v$version.windows.2/$zipName"

if (Test-Path (Join-Path $targetDir 'cmd\git.exe')) {
    Write-Host "MinGit already installed at $targetDir"
    exit 0
}

Write-Host "Downloading MinGit $version..."
Invoke-WebRequest -Uri $url -OutFile $zipPath -UseBasicParsing

Write-Host "Extracting to $targetDir..."
if (Test-Path $targetDir) { Remove-Item $targetDir -Recurse -Force }
Expand-Archive -Path $zipPath -DestinationPath $targetDir -Force
Remove-Item $zipPath -Force

Write-Host "Done. Use: .\tools\git.ps1 <command>"
Write-Host "Example: .\tools\git.ps1 status"