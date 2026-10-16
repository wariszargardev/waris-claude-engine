---
name: pr-bot-loop
description: After a blanka PR gets the "ready for review" label, wait for the GitHub review bot's comments (5–10 min), read them, fix only the important ones (real bugs, Critical/High) in the right branch, then remove the label, push, and re-add the label so the bot reviews the final version — max 2 rounds. Shared by create-pr (all modes) and deploy-env. Skipped when I say "skip review". Use when I say "watch the PR bot", "handle bot comments on PR <n>", or when one of those skills reaches its label step.
argument-hint: <pr-number> [fix-branch: <branch>] [deploy-branch: <branch>] [no-code-changes]
---

# PR bot loop

Inputs: the PR number; the **fix branch** (where code fixes go — the feature/fix/hotfix branch); for deploy PRs also the **deploy branch** to re-merge into; `no-code-changes` for release (stage/prod) PRs.

**Skipped entirely** when I said "skip review" / "skip pr-review" for this run.

## 1. Wait for the bot (don't block the chat)

The bot (comments by `AhsanAshfaq` starting "## Automated PR review — `<sha>`", plus inline review comments) usually answers 5–10 minutes after the label.
- Note the PR head SHA (`gh pr view <pr> --json headRefOid`) and the label time.
- Start a **Monitor** that polls every 60 s (max 15 min) until an issue comment containing "Automated PR review" and the first 10 chars of the head SHA appears:
  `gh api repos/InsuranceMarket-ae/blanka/issues/<pr>/comments --jq '.[] | select(.body | contains("Automated PR review")) | .body[0:120]'`
- Meanwhile you may answer me about other things. If nothing appears in 15 min → report "bot didn't review yet" and stop the loop (the label stays on).

## 2. Read and sort the comments

Unresolved review threads (GraphQL `reviewThreads`) + the bot's summary comment for this SHA. Sort each into:
- **Fix** — 🔴 Critical / 🟠 High, or anything that is a real bug, security issue, data-loss risk, or a test that doesn't test what it claims. Must be inside this PR's scope.
- **Leave for me** — 🟡 Medium / 🔵 Low, style, debatable, out of scope, or needs a business decision. Don't fix, don't resolve; list them in the report.

## 3. Fix (only if there's something in "Fix")

- `no-code-changes` (release PRs: the code must stay identical to the version verified on UAT/stage) → **don't change code**: reply to each "Fix" comment with the direct reason and resolve it, list it as a follow-up in the report. Go to step 4.
- Otherwise:
  1. `gh pr edit <pr> --remove-label "ready for review"`.
  2. Fix in the **fix branch** (never in a deploy branch or develop/main). Run only the affected tests. Commit `fix: <what> (PR review)`, push.
  3. Deploy PR → `git switch <deploy-branch>`, `git merge --no-ff <fix-branch>`, run the affected tests (install/build only if deps/frontend changed), push.
  4. Reply to each fixed comment "Fixed in `<sha>`" and resolve its thread (GraphQL `resolveReviewThread`). Don't touch "Leave for me" comments.

## 4. Re-label and repeat

- If code changed → `gh pr edit <pr> --add-label "ready for review"` and go back to step 1 (round 2).
- **Max 2 rounds.** After round 2, or when there's nothing to fix → make sure the label is on and stop.

## Report

Per round: bot findings count by severity, what was fixed (commit SHAs), what was replied/resolved, and the "Leave for me" list with links. Never merge.
