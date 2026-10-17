---
name: pr-bot-loop
description: After a blanka PR gets the "ready for review" label, wait for the GitHub review bot (Claude code review posted as AhsanAshfaq, 5–8 min), then decide each comment myself — reply with the reason and resolve it (label stays on), or, when code must change, remove the label, fix in the feature branch, re-merge into the deploy branch, run pr-review on the fix, push and re-add the label. Max 2 rounds. Used by create-pr for every target. Skipped with "skip review". Use when I say "watch the PR bot", "handle bot comments on PR <n>".
argument-hint: <pr-number> [fix-branch: <branch>] [deploy-branch: <branch>] [no-code-changes]
---

# PR bot loop

Inputs: PR number; **fix branch** (the feature/fix/hotfix branch — all code fixes go there); **deploy branch** for test/uat/dev PRs; `no-code-changes` for stage/prod PRs. Skipped when I said "skip review".

## 1. Wait for the bot (don't block the chat)
The bot (author `AhsanAshfaq`) posts either a **PR review** ("## Automated re-review @ `<sha8>`") or an **issue comment** ("## Automated PR review — `<sha>`"), plus inline review threads; it usually lands 5–8 minutes after the label. Note the head SHA (`gh pr view <pr> -R InsuranceMarket-ae/blanka --json headRefOid`) and the label time. Poll in the background every 60 s (max 15 min) and check **both** places for a body containing "Automated" and the first 8 chars of the head SHA:
- `gh api repos/InsuranceMarket-ae/blanka/pulls/<pr>/reviews --jq '.[] | select(.body | contains("Automated")) | .commit_id[0:8] + " " + .body[0:80]'`
- `gh api repos/InsuranceMarket-ae/blanka/issues/<pr>/comments --jq '.[] | select(.body | contains("Automated")) | .body[0:120]'`
Nothing in 15 min → also check for any `AhsanAshfaq` review/comment newer than the label time before giving up; still nothing → report "bot didn't review yet", leave the label on, stop.

Run the waiting/reading in step 1 through `pr-plumber` in the background; the lead does step 2 onward.

## 2. Decide every comment (unresolved `reviewThreads` + the summary for this SHA)
| Decision | When | Action |
|---|---|---|
| **Fix in code** | real bug, security/data-loss risk, Critical/High, a test that doesn't test what it says, or a cheap clear in-scope improvement | step 3 |
| **Reply + resolve** | intended behaviour, already handled, out of scope (→ follow-up), debatable, Medium/Low not worth a change | reply with the direct reason (1–3 lines) → resolve |
| **Leave for me** | needs a business/product decision or a migration/data change | no reply, no resolve; list it with my recommendation |

Judge by the code, not the bot's severity alone. `no-code-changes` → every "Fix in code" becomes reply-with-reason + resolve, listed as a follow-up.

**No "Fix in code" items → don't touch the label.** Reply + resolve, report, stop.

## 3. Fix (only when code must change)
1. `gh pr edit <pr> --remove-label "ready for review"` — before any code change.
2. Fix in the **fix branch** (never in a deploy branch or a protected branch). Run only the affected tests. Commit `fix: <what> (PR review)`, push.
3. Deploy PR → in its worktree `git merge --no-ff <fix-branch>` into the deploy branch; install/build only if deps/frontend changed; affected tests; push. (A fix that exists only in the deploy branch is merge glue and must not carry feature logic.)
4. Run `pr-review` scoped to the fix commits; real bugs → fix again (counts as a round).
5. Reply "Fixed in `<sha>` — <what changed>" on each fixed thread and resolve it; reply + resolve the others as decided.
6. `gh pr edit <pr> --add-label "ready for review"` → back to step 1 (round 2).

## 4. Stop
Max 2 rounds. Make sure the label is on at the end unless tests are failing.

## Report
Per round: findings by severity, fixed (SHAs), replied + resolved (with one-line reasons), left for me (links + recommendation), label status. Never merge.
