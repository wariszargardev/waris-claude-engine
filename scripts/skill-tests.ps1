# Dry-run a skill's tests.md: a "maker" Claude answers each case from the skill only (read-only, never sees Expected),
# then a separate "checker" Claude grades the answers against Expected. Prints PASS/FAIL per case.
# Usage:  powershell -File scripts\skill-tests.ps1 <skill>        e.g.  create-pr
param([Parameter(Mandatory = $true)][string]$Skill, [string]$Model = 'sonnet')
$ErrorActionPreference = 'Stop'
$Repo  = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Tests = Join-Path $Repo "skills\$Skill\tests.md"
if (-not (Test-Path $Tests)) { throw "No tests.md for '$Skill' ($Tests)" }

$rows = Get-Content $Tests -Encoding UTF8 | Where-Object { $_ -match '^\|\s*\d+\s*\|' } | ForEach-Object {
  $c = $_.Trim().Trim('|').Split('|') | ForEach-Object { $_.Trim() }
  [pscustomobject]@{ N = $c[0]; Case = $c[1]; Expected = ($c[2..($c.Count - 1)] -join ' | ') }
}
if (-not $rows) { throw "No numbered rows in $Tests" }

$cases = ($rows | ForEach-Object { "$($_.N). $($_.Case)" }) -join "`n"
$maker = @"
You are dry-running the Claude Code skill '$Skill'. Read ~/.claude/skills/$Skill/SKILL.md and any skill it names
(e.g. start-work, plan-cu, create-pr, pr-bot-loop, release-tracker) plus ~/.claude/waris-claude-engine/rules/office.CLAUDE.md.
Run nothing except reading files. For each case, answer in up to 5 lines exactly what you would do, following the skill text only, and include every concrete rule the skill states for that case (names, exclusions, conditions, mappings).
Format: '<n>. <answer>'.

Cases:
$cases
"@
Write-Host "Maker: answering $($rows.Count) cases for $Skill ..."
$answers = $maker | claude -p --model $Model --allowedTools 'Read,Glob,Grep' --max-turns 15 2>&1 | Out-String

$expected = ($rows | ForEach-Object { "$($_.N). CASE: $($_.Case)`n   EXPECTED: $($_.Expected)" }) -join "`n"
$checker = @"
You are a strict checker. Compare each ANSWER with its EXPECTED result. PASS only if the answer clearly does what EXPECTED says
and nothing that contradicts it; otherwise FAIL with the missing/contradicting point in under 20 words.
Output one line per case: '<n> PASS' or '<n> FAIL - <reason>', then a final line 'SCORE x/y'.

$expected

ANSWERS:
$answers
"@
Write-Host "Checker: grading ..."
$result = $checker | claude -p --model $Model --allowedTools '' --max-turns 1 2>&1 | Out-String
Write-Host "`n== $Skill =="
Write-Host $result.Trim()
