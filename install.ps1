# Links this repo into ~/.claude on a new (or reset) PC. Safe to run again.
# Usage (PowerShell, no admin needed):  powershell -ExecutionPolicy Bypass -File .\install.ps1
$ErrorActionPreference = 'Stop'
$Repo   = Split-Path -Parent $MyInvocation.MyCommand.Path
$Claude = Join-Path $env:USERPROFILE '.claude'
$Office = Split-Path -Parent $Repo
$Memory = Join-Path $Claude 'projects\D--Afia-Insurance-Projects-Office-claude\memory'
$Stamp  = Get-Date -Format 'yyyyMMdd-HHmmss'
New-Item -ItemType Directory -Force $Claude, (Join-Path $Claude 'skills'), (Split-Path $Memory) | Out-Null

function Link($path, $target) {
  $item = Get-Item -LiteralPath $path -Force -ErrorAction SilentlyContinue
  if ($item -and $item.LinkType -eq 'Junction' -and $item.Target -contains $target) { "ok      $path"; return }
  if ($item) { Rename-Item -LiteralPath $path "$($item.Name).bak-$Stamp"; "backup  $path -> $($item.Name).bak-$Stamp" }
  New-Item -ItemType Junction -Path $path -Target $target | Out-Null
  "linked  $path -> $target"
}

Link (Join-Path $Claude 'waris-claude-engine')       $Repo
Link (Join-Path $Claude 'hooks')           (Join-Path $Repo 'hooks')
Link (Join-Path $Claude 'scheduled-tasks') (Join-Path $Repo 'routines')
Link $Memory                               (Join-Path $Repo 'memory')
Get-ChildItem (Join-Path $Repo 'skills') -Directory | ForEach-Object { Link (Join-Path $Claude "skills\$($_.Name)") $_.FullName }

$Company = Join-Path $Office 'claude'
if (-not (Test-Path (Join-Path $Company '.git'))) {
  git clone https://github.com/InsuranceMarket-ae/claude.git $Company
  "cloned  company plugin -> $Company (then in Claude: /plugin marketplace add `"$Company`" and /plugin install alfred-orchestrator@alfred)"
} else {
  git -C $Company pull --ff-only -q 2>$null; "updated company plugin ($Company)"
}
New-Item -ItemType Directory -Force (Join-Path $Repo 'company') | Out-Null
Link (Join-Path $Repo 'company\alfred-orchestrator') $Company

$global = Join-Path $Claude 'CLAUDE.md'
if (Test-Path $global) { Copy-Item $global "$global.bak-$Stamp" }
[IO.File]::WriteAllText($global, "# Global rules live in my waris-claude-engine repo (waris-claude-engine/rules). Edit them there.`n@waris-claude-engine/rules/global.CLAUDE.md`n@waris-claude-engine/rules/office.CLAUDE.md`n")
"wrote   $global"

$officeMd = Join-Path $Office 'CLAUDE.md'
[IO.File]::WriteAllText($officeMd, "# Office rules moved to my waris-claude-engine repo: waris-claude-engine/rules/office.CLAUDE.md`n# They load for every session through ~/.claude/CLAUDE.md. Edit them there, not here.`n")
"wrote   $officeMd"

$settings = Join-Path $Claude 'settings.json'
if (Test-Path $settings) { Copy-Item $settings "$settings.bak-$Stamp"; "backup  $settings" }
Copy-Item (Join-Path $Repo 'settings\settings.json') $settings -Force
"copied  settings.json"

New-Item -ItemType Directory -Force (Join-Path $Claude 'secrets'), (Join-Path $Office 'skills-upload') | Out-Null
foreach ($f in 'gchat-webhook.txt', 'gchat-mentions-webhook.txt') {
  if (-not (Test-Path (Join-Path $Claude "secrets\$f"))) { "TODO    paste the webhook URL into ~/.claude/secrets/$f (see README)" }
}
"Done. Restart the Claude app, then check README 'After install'."
