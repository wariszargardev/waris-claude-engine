---
name: deploy-env
description: Deploy a feature/fix/hotfix branch to the test, UAT or dev environment — creates the deployment branch, merges, installs deps only if they changed, builds, runs only the changed tests, opens the PR, reviews it for bugs, then adds the "ready for review" label. Use when I say "deploy to test/uat/dev", "merge into test", "create the test deployment PR".
argument-hint: <test|uat|dev> [feature-branch]
---

# Deploy to test / UAT / dev

My asking for this deploy is permission to commit, push, open the PR, review it, fix bugs in the feature branch and add the label as described here.

**Always run it end to end. Don't stop to ask me and don't present a plan.** Make the call using the rules below and record every decision in the PR's "Deploy notes" section and in the final report. I review the PR afterwards.

**Rule:** no new feature code, refactors or improvements in the deploy branch. Feature fixes go in the feature branch. Merge glue (step 7) is the only exception.

**Run unattended.** I often start a deploy and move to another task, so never wait on me mid-way. Keep commands simple so they match my allowed-commands list: one command per call, no `cd <dir> &&` prefix (use `git -C "<worktree>" …` or the worktree as the working directory), no pipes or `;` chains.

**Hard stops (the only reasons to stop):**
- The base branch isn't updated from `develop` (step 3, pre-check).
- The feature branch has uncommitted changes.
- `git push`, `gh` or auth fails.
- A fix would need a DB migration or data change, or would touch `.env`/secrets.

| Env | Base branch | Deploy branch |
|---|---|---|
| test | `test-env-deployment` | `<type>/<name>-test-deployment-<cu-id>` |
| uat | `uat-env-deployment` | `<type>/<name>-uat-deployment-<cu-id>` |
| dev | `new-dev-env-deployment` | `<type>/<name>-dev-deployment-<cu-id>` |

**Naming rule (strict):** copy the feature branch name exactly — same prefix (`feat/`, `fix/`, `hotfix/`), same title, same case — and insert `-<env>-deployment` just before the trailing CU id. No CU id at the end → append `-<env>-deployment`.
- Never use `chore/`, `release/`, `uat/`, `dev/` or any other prefix, never reorder words, never add dates.
- CU id = the last `-` segment when it's a ClickUp id (8–10 lowercase letters + digits with at least one digit, e.g. `86exb1kft`, `z8znm13naj`).
- `feat/Alternative-Plans-Engine-86exb1kft` → `feat/Alternative-Plans-Engine-uat-deployment-86exb1kft`
- `fix/book-policy-email-document-existence-check-z8znm14abc` → `fix/book-policy-email-document-existence-check-test-deployment-z8znm14abc`
- `hotfix/policy-wording-broken-links-check` → `hotfix/policy-wording-broken-links-check-dev-deployment`
- Develop-sync deploy (no feature branch, e.g. after "bypass" or when I ask to update an env from develop): `fix/develop-sync-<env>-deployment`.

**Feature branch — pick in this order, don't ask if one is found:**
1. The branch I name in the request.
2. The current branch of the project attached to this chat: `git -C "<working directory>" rev-parse --abbrev-ref HEAD`. Say which branch you picked in the first line of your reply. Not usable if it's `develop`, `main`, a base `*-env-deployment` branch or detached HEAD → go to 3.
3. Neither → ask me for the branch (the only question allowed).

If the picked/named branch is a deploy branch instead (ends in `-<env>-deployment[-<cu-id>]`), derive the feature branch by removing only the `-<env>-deployment` part (keep the CU id: `feat/x-uat-deployment-86abc1234` → `feat/x-86abc1234`). If that branch exists, continue from the step it reached (e.g. already merged → go to step 5).

## Steps (run in the feature's worktree)

1. Check the feature branch has no uncommitted changes. If it has, stop (hard stop).
2. Push the feature branch: `git push -u origin <feature-branch>`.
3. **Pre-check: is the base updated from develop?** Do this before creating any branch.
   ```bash
   git fetch origin
   git merge-base <feature-branch> origin/develop          # = <fork>
   git rev-list --count origin/<base-branch>..<fork>       # develop commits the feature carries that the base lacks
   git merge-tree --write-tree --name-only origin/<base-branch> <feature-branch>   # preview conflicts
   git diff --name-only origin/<base-branch>...<fork>      # files those missing develop commits touch
   ```
   - No conflicts in the preview → continue (missing develop commits are fine if they merge cleanly; note the count in Deploy notes).
   - Conflicts, and **any** conflicted file is touched by the missing develop commits → **stop. Don't create the branch.** Report: "`<base-branch>` is not updated from `develop`" with the number of missing develop commits and the conflicted files that come from develop. I'll tell you when it's updated; then run the deploy again from step 1.
   - **Also ask Ahsan to update it (always, automatically):** count the missing develop commits for all three bases (`git rev-list --count origin/<base>..origin/develop` for `test-env-deployment`, `uat-env-deployment`, `new-dev-env-deployment`). Then, with the Google Chat connector `send_message`, post ONE message to **ENG - Code Reviews** (`spaces/AAQAOvX47Qo`) tagging Ahsan Ashfaq (`<chat-user data-user="users/100003347646761463026"/>`):
     > @Ahsan Please update the deployment branches from `develop`. They're behind, which is causing develop conflicts in our deploy PRs:
     > * `<base>`: <n> develop commits missing (one line per base that is behind)
     > Blocked deploy: `<feature-branch>` → `<env>`. Thanks!
   - Don't post again if you already posted the same request in that space within the last 24 hours (check with `search_messages` in `spaces/AAQAOvX47Qo`, sender = me, keywords "update the deployment branches"). Mention in the report that the request was posted (or already pending).
   - If I said to bypass the pre-check, still post the request, then continue the deploy.
   - Conflicts only in files the feature itself changed (not touched by missing develop commits) → continue; resolve them in step 4.
   Create a new deploy branch from the fresh base:
   `git switch -c <deploy-branch> --no-track origin/<base-branch>`
   If the deploy branch already exists, switch to it and merge `origin/<base-branch>` in first.
4. Merge the feature branch: `git merge --no-ff <feature-branch>`.
   - Resolve conflicts carefully, keeping both sides' intent. Don't stop.
   - Files the feature changed: keep the feature's logic and add anything the base side needs.
   - Other files: keep the base branch's version, plus any line the merged code needs to compile/run.
   - Combine both sides wherever possible (imports, constants, schema columns, factories).
   - Built assets (`public/build/**`): take the base side; step 5 rebuilds them.
   - Log each resolved file and the side kept for Deploy notes. Mark business-logic calls as **"please verify"**.
5. Install and build **only what changed** (compare what is installed — the feature branch — with the merged result):
   ```bash
   git diff --name-only <feature-branch> HEAD -- composer.json composer.lock
   git diff --name-only <feature-branch> HEAD -- package.json yarn.lock
   git diff --name-only <feature-branch> HEAD -- resources/js resources/css vite.config.js vite-worker.config.js package.json yarn.lock
   ```
   - Composer files changed → `composer install --ignore-platform-reqs` (via PowerShell). Otherwise skip.
   - `package.json` / `yarn.lock` changed → `yarn prod` (installs + builds). Otherwise skip the install.
   - Frontend files changed or `public/build/**` had conflicts, but no package change → build only:
     `npx vite build && npx vite build --config vite-worker.config.js`.
   - Nothing frontend changed → no build.
   - Commit the merge (with rebuilt assets if any).
6. Run **only the tests for what changed** — never the full suite:
   - Test files changed by the feature: `git diff --name-only origin/<base-branch>...<feature-branch> -- tests/`
   - Tests covering the feature's changed classes and the conflict-resolved files (find them with Grep on the class name in `tests/`).
   - `php artisan test --compact <files>`; add `--parallel` when more than ~10 files.
7. A test fails → classify it, fix, and continue (don't stop):
   - **Feature bug**: fix in the feature branch, run its tests, commit, push, re-merge into the deploy branch, re-run only the affected tests.
   - **Merge clash** (the branches don't fit together, e.g. a test calls a method whose signature differs on the base): smallest merge-glue fix in the deploy branch only. Commit as `chore: merge fix for <env> deployment`. No feature logic.
   - **Already failing on base**: check against a clean `origin/<base-branch>`. If it fails there too, leave it and note it.
   - Cap: 2 fix rounds. If still failing, open the PR anyway, don't add the label, and report.
8. Push and open the PR into the base branch, **without** the label:
   `gh pr create --base <base-branch> --head <deploy-branch> --title "<title>" --body-file <file>`
   Use the repo's `.github/pull_request_template.md` for the body if it exists. Add a **Deploy notes** section: conflicts resolved (file → side kept, "please verify" items), merge-glue fixes, deps installed or skipped, pre-existing failures, test results.
9. **Review the PR for bugs** (below).
10. Add the label: `gh pr edit <pr> --add-label "ready for review"`.
11. **Bot loop:** follow `pr-bot-loop` with `fix-branch: <feature-branch>` and `deploy-branch: <deploy-branch>` — wait for the bot, fix important findings in the feature branch, push, re-merge into the deploy branch, remove + re-add the label (max 2 rounds). Skip if I said "skip review".
12. Never merge the PR.

## Review the PR for bugs

1. Run the repo's review skill (`pr-review` in blanka; `/code-review` otherwise) on the deploy PR, scoped to what the feature changed, the conflict-resolved files and the merge-glue commits — not the whole range of commits the merge brought in.
2. Real bugs → fix in the feature branch, run its tests, commit, push, re-merge into the deploy branch, re-run only the affected tests (and the build only if frontend files changed), push.
3. Max 2 rounds. Debatable or out-of-scope findings: don't fix, don't block — list them in Deploy notes and the report.

## Branch busy in another worktree

If git refuses to switch because the branch (e.g. `main`, `develop`, `test-env-deployment`) is "already used by worktree at <path>":
1. Don't use `--force` / `--ignore-other-worktrees`.
2. Go to `<path>`. If `git status --porcelain` is empty, run `git pull`. If not empty, stop and tell me.
3. Return to the original repo/worktree and continue from the same step.

## Release tracker

At the end (also after a hard stop on a stale base), upsert the feature branch's item per the `release-tracker` skill: env `<test|uat|dev>` = `{pr, state: "open"}`, `next` = what's waiting (label / bot / merge / base update).

## Report

PR link, deploy branch, conflicts resolved (files + how), deps installed or skipped, build run or skipped, review findings fixed, tests run + results, label status.
