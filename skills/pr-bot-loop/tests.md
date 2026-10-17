# pr-bot-loop — sample prompts (checker for this skill)

Re-run after every edit: `powershell -File scripts\skill-tests.ps1 pr-bot-loop`.

| # | Situation | Expected |
|---|---|---|
| 1 | Label added on PR #15471; 6 min later the bot posts a **PR review** "Automated re-review @ cf30d274" (not an issue comment) | Found — the watcher checks `pulls/<pr>/reviews` and `issues/<pr>/comments` for "Automated" + the head SHA's first 8 chars. |
| 2 | Bot leaves 2 Medium threads; one is behaviour that `develop` already has, one is an accepted trade-off | Reply with the direct reason + resolve both. **Label stays on.** Nothing pushed. |
| 3 | Bot leaves a High: real bug in the feature's controller, on a UAT deploy PR | Remove label → fix in the **feature branch** → test → push → `git merge --no-ff` into the deploy branch → `pr-review` on the fix → push → reply "Fixed in <sha>" + resolve → re-add label → round 2. |
| 4 | Stage/prod PR (`no-code-changes`) with a High finding | No code change; reply with the reason, resolve, list it as a follow-up. |
| 5 | A comment needs a product decision (change agreed behaviour) | Left unresolved, no reply; listed for me with a recommendation. |
| 6 | 15 min and no bot activity | Checks for any `AhsanAshfaq` review/comment after the label time; still none → "bot didn't review yet", label stays, stop. |
