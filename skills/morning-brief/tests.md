# morning-brief — sample prompts (checker for this skill)

Re-run after every edit: `powershell -File scripts\skill-tests.ps1 morning-brief`. Dry run only — never post to Chat while testing.

| # | Situation | Expected |
|---|---|---|
| 1 | Scheduled run on a Saturday | Does nothing. |
| 2 | Weekday 9:00 run, brief already sent today (flag file exists) | Doesn't post the brief again; only sets today's 5-minute meeting reminders. |
| 3 | Normal weekday run | 7 separate Chat messages via the webhook (unread), in order: Summary, Needs my reply, Google Chat, Tasks by status, Meetings (PKT), Blanka not on stage, Release tracker. Never mixed sections. |
| 4 | Monday run | ClickUp + Chat mentions look back over the weekend (since Friday). |
| 5 | A blanka branch `feat/x` has commits ahead and no PR | Creates the PR with `create-pr` target `develop`; never `feat/health-renewal-MVP-86ew63z6m`; skips if dirty, 0 commits ahead, or last commit < 2 h old; posts "🌿 PRs created". |
| 6 | Anything else | Read-only: no ClickUp changes, no merges, no replies to mentions. |
| 7 | A blanka branch `hotfix/y` has commits ahead and no PR | Creates the PR with `create-pr` target `main` (hotfix). |
