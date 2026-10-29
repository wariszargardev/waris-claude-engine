# Daily repo sync: fast-forwards local main and develop of the office repos to origin.
# Started by daily-repo-sync.js on the first Claude session of the day, after a delay.
# Never switches branches and never touches a working tree that has uncommitted changes.
param(
    [int]$DelaySeconds = 300,
    [switch]$Force
)

$Office = 'D:\Afia Insurance\Projects\Office'
$Repos = @('blanka', 'ahcrm', 'claude', 'dhalsim', 'dhalsimv2', 'lead-vault')
$Branches = @('main', 'develop')

$StateDir = Join-Path $env:USERPROFILE '.claude\daily-repo-sync'
$StampFile = Join-Path $StateDir 'last-run.txt'
$LockFile = Join-Path $StateDir 'pending.lock'
$LogFile = Join-Path $StateDir 'last-run.log'
New-Item -ItemType Directory -Force $StateDir | Out-Null

$env:GIT_TERMINAL_PROMPT = '0'
$Today = Get-Date -Format 'yyyy-MM-dd'

try {
    if ($DelaySeconds -gt 0) { Start-Sleep -Seconds $DelaySeconds }
    if (-not $Force -and (Test-Path $StampFile) -and ((Get-Content $StampFile -Raw).Trim() -eq $Today)) { return }
    Set-Content -Path $StampFile -Value $Today -Encoding ascii

    $Lines = @("Daily repo sync $(Get-Date -Format 'yyyy-MM-dd HH:mm')")
    $Problems = @()

    foreach ($Name in $Repos) {
        $Path = Join-Path $Office $Name
        if (-not (Test-Path (Join-Path $Path '.git'))) { $Lines += "$Name : not found, skipped"; continue }

        $Current = (git -C $Path branch --show-current).Trim()
        $Dirty = [bool](git -C $Path status --porcelain --untracked-files=no -- . ':!.mcp.json')

        git -C $Path fetch origin --prune --quiet 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { $Lines += "$Name : fetch FAILED"; $Problems += "$Name fetch failed"; continue }

        $Results = @()
        foreach ($Branch in $Branches) {
            git -C $Path rev-parse --verify --quiet "refs/remotes/origin/$Branch" | Out-Null
            if ($LASTEXITCODE -ne 0) { continue }

            if ($Branch -eq $Current) {
                if ($Dirty) { $Results += "$Branch skipped (uncommitted changes)"; $Problems += "$Name/$Branch has uncommitted changes"; continue }
                $Out = git -C $Path merge --ff-only --quiet "origin/$Branch" 2>&1
            } else {
                $Out = git -C $Path fetch origin "${Branch}:${Branch}" --quiet 2>&1
            }

            if ($LASTEXITCODE -eq 0) { $Results += "$Branch ok" }
            else { $Results += "$Branch FAILED ($(($Out | Select-Object -First 1) -join ''))"; $Problems += "$Name/$Branch not updated" }
        }

        $Note = if ($Current -in $Branches) { '' } else { " [on $Current, left as is]" }
        $Lines += "$Name : $($Results -join ', ')$Note"
    }

    Set-Content -Path $LogFile -Value $Lines -Encoding utf8

    Add-Type -AssemblyName System.Windows.Forms, System.Drawing
    $Balloon = New-Object System.Windows.Forms.NotifyIcon
    $Balloon.Icon = [System.Drawing.SystemIcons]::Information
    $Balloon.Visible = $true
    $Balloon.BalloonTipTitle = 'Daily repo sync'
    $Balloon.BalloonTipText = if ($Problems) { "Check: $($Problems -join '; ')" } else { "main + develop up to date in $($Repos.Count) repos" }
    $Balloon.ShowBalloonTip(10000)
    Start-Sleep -Seconds 10
    $Balloon.Dispose()
}
finally {
    Remove-Item $LockFile -ErrorAction SilentlyContinue
}
