---
name: pr-comments
description: Handle review comments on any blanka PR (normal, stage/prod, or test/UAT/dev deploy PR). If I name comments (links/ids), act only on those; if I don't, read every unresolved comment on the PR and decide each one myself — fix it (in the feature branch, re-merge for deploy PRs) and resolve, or reply with the reason and resolve — leaving only real business decisions open for me. Removes and re-adds the "ready for review" label around fixes. Never merges. Use when I say "fix the PR comments", "handle the review comments", "fix comments 2 and 4", or give a PR / comment link.
argument-hint: [pr number | PR link | comment links] [branch]
---

# PR comments

My request is permission to commit, push, reply, resolve and re-label as described here.

## 0. Which PR, which comments

- **PR:** the number/link I give; else a comment link's PR; else the open PR for this chat's / attached project's branch (`gh pr list --head <branch> --state open`). None → ask me.
- **PR type:** `gh pr view <pr> --json number,headRefName,baseRefName,labels,url,title`
  - **deploy PR** (head ends `-<test|uat|dev>-deployment[-<cu-id>]`): fixes go in the **feature branch** = head with only `-<env>-deployment` removed (CU id stays), then re-merge.
  - **normal PR** (feat/fix/hotfix → develop/main, not marked [STAGE]/[PROD]): fixes go in the head branch.
  - **stage/prod PR** (title starts `[STAGE]`/`[PROD]`, or I said so): **code frozen** — no fixes; every comment gets a reason + resolve, real bugs listed as follow-ups. Unless I say "fix them".
- **Comments:**
  - I named comments (links like `#discussion_r<id>`, ids, or "2 and 4") → **only those**; don't touch the rest.
  - I named none → **all unresolved review threads** + the latest bot summary comment.

## 1. Read and decide (one decision per comment)

Read with `gh api repos/InsuranceMarket-ae/blanka/pulls/<pr>/comments` and GraphQL `reviewThreads` (`isResolved`, thread id, first comment id/body/path/line). Check the code it points at before deciding.

| Decision | When | Action |
|---|---|---|
| **Fix** | Real bug, security/data-loss risk, Critical/High, a test that doesn't test what it says, or a cheap clear improvement inside this PR's scope | Fix → reply "Fixed in `<sha>` — <what changed>" → resolve |
| **Reply + resolve** | Intended behaviour, out of scope (→ follow-up), debatable style, Low/Medium nit not worth changing, or already handled elsewhere | Reply with the direct reason in 1–3 lines → resolve |
| **Leave for me** | Needs a business/product decision, changes agreed behaviour, or a migration / data change | Don't reply, don't resolve; list it in the report with your recommendation |

Never add code comments while fixing. Judge by the code, not by the bot's severity label alone.

## 2. Fix (if any "Fix")

1. `gh pr edit <pr> --remove-label "ready for review"`.
2. In the fix branch's worktree (`git worktree list`; "already used by worktree" → work there, `git pull` only if clean, else stop and tell me): fix, run only the affected tests, commit `fix: <what> (PR review)`, push.
3. Deploy PR → in its worktree `git merge --no-ff <feature-branch>` into the deploy branch, install/build only if deps or frontend changed, re-run affected tests, push.
4. Never fix code directly in a deploy branch, develop or main.

## 3. Reply and resolve

- Reply: `gh api repos/InsuranceMarket-ae/blanka/pulls/<pr>/comments/<comment-id>/replies -f body="<reply>"` (general/issue comments: `gh pr comment <pr> --body`).
- Resolve: GraphQL `resolveReviewThread(input:{threadId:"<id>"})`.
- Only the threads decided "Fix" or "Reply + resolve" (or the ones I named).

## 4. Re-label and one bot round

If code changed or the label was removed: run the affected tests, then `gh pr edit <pr> --add-label "ready for review"` and follow `pr-bot-loop` (max 2 rounds; stage/prod with `no-code-changes`). If nothing changed, leave the label as it was.

## Report

A table per comment: link · decision (fixed / replied+resolved / left for you) · one-line reason. Then commits pushed, tests + results, label status, PR link. Never merge.
