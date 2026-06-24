# Wrapper for portable MinGit in tools/MinGit
$ErrorActionPreference = 'Stop'

$gitExe = Join-Path $PSScriptRoot 'MinGit\cmd\git.exe'
if (-not (Test-Path $gitExe)) {
    Write-Host 'MinGit not found. Run: .\tools\install-git.ps1'
    exit 1
}

$repoRoot = Split-Path $PSScriptRoot -Parent
& $gitExe -C $repoRoot @args
exit $LASTEXITCODE