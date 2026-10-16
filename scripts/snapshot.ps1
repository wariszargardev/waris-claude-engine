# Copies files that can't be linked (settings.json) from ~/.claude into the repo, then shows what changed.
# Run before committing:  powershell -File .\scripts\snapshot.ps1
$Repo = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Copy-Item (Join-Path $env:USERPROFILE '.claude\settings.json') (Join-Path $Repo 'settings\settings.json') -Force
git -C $Repo status --short
