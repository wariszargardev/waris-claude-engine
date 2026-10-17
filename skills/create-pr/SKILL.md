---
name: create-pr
description: The one PR command for blanka — opens a PR into any target. Asks which target if not given; develop (new work, or stage = the UAT-verified version), test / uat / dev (builds the deploy branch from that env's base, merges the feature in, resolves conflicts), or main (hotfix, or prod = the stage-verified version). Commits pending work, builds only what changed, runs only relevant tests, local review, one push, PR, "ready for review" label, then handles the review bot's comments (reply + resolve, or remove label → fix in the feature branch → review → push → re-add label). Never pushes, commits or merges into protected branches and never merges a PR. Use for "create PR", "create PR uat/test/dev/stage/prod", "deploy to uat/test/dev", "/create-pr", "/deploy-env".
argument-hint: <develop|stage|test|uat|dev|main|prod> [feature-branch] [base: x] [skip review] [bypass]
---

# Create PR — every target

My request is permission for every step below (commit, push, branch, merge, build, tests, PR, label, review fixes in the feature branch). Run end to end and unattended; ask only the target question or at a hard stop. Record every decision in the PR's notes and the report. In Plan mode: ExitPlanMode at once with one line ("PR <branch> → <target> per create-pr"), then run.

## 0. Target, branch, base

**Target** — from my words; if I gave none, ask once: "Which target: develop (stage), test, UAT, dev, or main (hotfix/prod)?"

| Target | Base | PR head | Code |
|---|---|---|---|
| **develop** | `develop` | the feature branch | **new work** (no merged UAT deploy yet) → can change; **stage** (a UAT deploy PR for it is merged, or I said "stage") → frozen to the UAT-verified version |
| **test / uat / dev** | `test-env-deployment` / `uat-env-deployment` / `new-dev-env-deployment` | a deploy branch cut from that base | feature code changes only in the feature branch |
| **main** | `main` | `hotfix/…` branch → **hotfix** (can change); anything else → **prod** (frozen to the stage-verified version) | |

- **Base override** ("base: x", "make it develop") wins.
- **Feature branch:** the one I name → else this chat's worktree / the attached project's current branch → else ask (only other question). Given a deploy branch → feature = its name with `-<env>-deployment` removed (CU id stays) and continue from where it stopped.
  - **Current branch is protected (e.g. the main checkout on `develop`) or detached:** that is NOT a stop and NOT a reason to talk about the main checkout's own files. List my candidate branches — open PRs (`gh pr list -R InsuranceMarket-ae/blanka --author "@me" --state open`) and worktrees (`git worktree list`) — and ask once: "Which branch?" with the top 4 as options. Then work only in that branch's worktree.
  - Uncommitted files in the main checkout (e.g. `.mcp.json`) are never part of a PR and never block one; ignore them.
- **Existing open PR** for head + base → reuse it (refresh the branch, re-label), don't open a second one.
- **Run gh with `-R InsuranceMarket-ae/blanka`** — the chat's cwd may be another repo.
- **Deploy branch name (strict):** the feature name exactly, with `-<env>-deployment` inserted before the trailing CU id (CU id = last `-` segment, 8–10 lowercase letters+digits with ≥1 digit). No CU id → append. Never `chore/`, `release/`, dates or reordering. `feat/Alternative-Plans-Engine-86exb1kft` → `feat/Alternative-Plans-Engine-uat-deployment-86exb1kft`. Develop-sync (no feature): `fix/develop-sync-<env>-deployment`.
- **Protected branches** (`waris-claude-engine/hooks/protected-branches.json`): PRs go *into* them; never push, commit, merge, reset or delete *on* them, never `gh pr merge`. A fix that would have to land on one → open the PR without the label and report.
- **"skip review"** → no local review (step 5) and no bot loop (step 11); PR opened without the label.

**Hard stops:** uncommitted changes in a frozen (stage/prod) run; env base not updated from develop (step 3); secrets/unrelated files would be committed; push/gh/auth fails; a fix needs a migration, data change or `.env`.

**Subagents:** mechanical steps (fetch, base pre-check, push, PR create/edit, label, bot wait/read, reply + resolve with the lead's text) can go to `pr-plumber` (Haiku). The lead keeps every decision: conflict resolution, code fixes, which comments need code.

## 1. Worktree + sync
Find the feature branch's worktree (`git worktree list`); none → `git worktree add "D:\Afia Insurance\Projects\Office\<repo>-<requirement>" <branch>` + setup (composer `--ignore-platform-reqs` via PowerShell, `yarn prod`, doppler). `git fetch origin`; behind its remote → `git pull`. Busy in another worktree → don't force; `git pull` there if clean, else stop. One command per call, no `cd … &&` chains (use `git -C`).

## 2. Pending work
- **new work / hotfix:** KB doc + skill done (else do them); commit only this task's files (`<feat|fix>: <what>`), never `.env`/secrets/unrelated files.
- **stage / prod:** uncommitted changes → stop and show me.
- **test / uat / dev:** uncommitted changes in the feature branch → stop (hard stop). Then `git push -u origin <feature-branch>`.

## 3. Pre-check the base (test / uat / dev only — before creating anything)
```
git merge-base <feature> origin/develop                       # <fork>
git rev-list --count origin/<base>..<fork>                     # develop commits the base lacks
git merge-tree --write-tree --name-only origin/<base> <feature>
git diff --name-only origin/<base>...<fork>
```
- Clean preview → continue (note the missing-commit count).
- A conflicted file is touched by the missing develop commits → **stop, create nothing**: "`<base>` is not updated from develop" + count + files. Post once per 24h to ENG - Code Reviews (`spaces/AAQAOvX47Qo`, check `search_messages` for "update the deployment branches" first), tagging Ahsan `<chat-user data-user="users/100003347646761463026"/>`: "Please update the deployment branches from `develop` … `<base>`: <n> commits missing … Blocked: `<feature>` → `<env>`." "bypass" → still post, then continue.
- Conflicts only in the feature's own files → continue and resolve in step 4.

## 4. Build the PR head
- **develop / main:** `git merge-tree` against `origin/<base>`; conflicts → merge `origin/<base>` into the feature branch (no rebase), resolve keeping both intents, commit `chore: merge <base> into <branch>`.
- **test / uat / dev:** `git switch -c <deploy-branch> --no-track origin/<base>` (exists → switch + merge `origin/<base>`), then `git merge --no-ff <feature>`. Resolve: feature's files keep the feature logic + what the base needs; other files keep the base + what compiles; combine imports/constants/columns; `public/build/**` → base side (rebuilt in step 6). Log each file → side kept; business-logic calls marked "please verify".
- **Never put feature code in a deploy branch.** A problem in the feature → fix it in the feature branch, push, re-merge. Only merge-glue (`chore: merge fix for <env> deployment`) lives in the deploy branch.

## 5. Local review (new work, hotfix, test/uat/dev; skip with "skip review")
Sub-agents on the PR's own changes (feature diff + conflict-resolved files + merge glue, not develop's commits): blanka `pr-review`, `alfred-orchestrator:find-bugs`, plus QA/security reviewers when payments, auth, uploads, external APIs or customer data are touched. Real bugs / Critical / High → fix in the feature branch, test, commit `fix: <what> (self-review)`, re-merge for deploy PRs. Max 2 rounds; the rest → PR notes.

**stage / prod instead — ship exactly what was verified:** find the verified PR (stage: merged `<branch>-uat-deployment` PR; prod: merged stage PR). For each file in `git diff --name-only origin/<base>...<branch>`, compare with the verified head; extras not from the base → `git revert` (never force-push). No verified deploy → note it.

## 6. Install, build, push
Compare what's installed with the result (`git diff --name-only <feature> HEAD -- …` for deploy branches):
- composer files changed → `composer install --ignore-platform-reqs`; `package.json`/`yarn.lock` changed → `yarn prod`; frontend only → `npx vite build && npx vite build --config vite-worker.config.js`; nothing → skip. New work/hotfix → always `yarn prod`.
- Build output changed → commit `chore: build assets`. Then one `git push -u origin <head>`.

## 7. Tests — only what changed
Test files in the diff + tests covering changed classes and conflict-resolved files; `php artisan test --compact <files>` (`--parallel` >10). Failure: feature bug → fix in the feature branch (+re-merge); merge clash → smallest glue fix; fails on a clean base too → note it. Max 2 rounds; still failing → PR without the label. Frozen runs never change feature code.

## 8. Open or reuse the PR
Reuse an open PR for this head + base; else `gh pr create --base <base> --head <head> --title "<[STAGE]/[PROD]/[UAT]/[TEST]/[DEV] prefix> <title incl. CU id>" --body-file <file>`. Body (repo template if it exists): CU link + title, Issue, What we fixed / built, What's covered, Tests, plus **Notes**: conflicts resolved (file → side, "please verify"), merge glue, self-review fixes / reverted extras, deps/build run or skipped, missing develop commits, pre-existing failures, items left for me. stage/prod → also comment "This PR carries exactly the version verified on <UAT|stage> (PR #<n>) — please confirm it works."

## 9. Label
Re-check mergeability (base moved → back to step 4). Label already on → remove and re-add; else `gh pr edit <pr> --add-label "ready for review"`.

## 10. Never merge, never force-push
## 11. Review bot → `pr-bot-loop`
Pass `fix-branch: <feature>`, `deploy-branch: <deploy-branch>` for test/uat/dev, `no-code-changes` for stage/prod (unless I say "fix the bot comments").

## 12. Release tracker
Upsert the feature's item per `release-tracker`: env (test/uat/dev/stage=develop/prod=main) = `{pr, state: "open"}`, `next` = what's waiting. Also after a stale-base stop.

## Report
Target + mode, PR link, head → base (and why), deploy-branch name, commits (pending work, merges, glue, fixes, build), conflicts + sides, deps/build run or skipped, tests + results, review/bot rounds (fixed vs replied), label status, items left for me. End with **Branch** and **Directory**.
