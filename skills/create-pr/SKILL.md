---
name: create-pr
description: The one PR command for blanka. Commits and pushes any pending work, builds assets and pushes, then opens (or reuses) the PR — normal mode = my new work into develop (hotfix/ → main, or the base I name) with local review and bot-comment fixes; "stage" = PR into develop that must match the version verified on UAT; "prod" = PR into main that must match the version verified on stage (code frozen, bot comments answered with reasons). Adds "ready for review" and runs pr-bot-loop. Never merges. Use for "create PR", "create PR stage", "create PR prod", "stage PR", "prod PR", "/create-pr".
argument-hint: [stage|prod] [branch] [base: develop|main] [skip review]
---

# Create PR (normal · stage · prod)

My request is permission to commit, push, open/update the PR, label it, and (normal mode) fix important bot findings. Run end to end; ask only at a hard stop or if no branch can be found.

## 0. Mode, branch, base

| I say | Mode | Base | Code |
|---|---|---|---|
| "create PR" | **normal** | `hotfix/…` → `main`; `feat/…`/`fix/…` → `develop` | can change (self-review + bot fixes) |
| "create PR **stage**" / "stage PR" | **stage** | `develop` | **frozen** — must match the version verified on UAT |
| "create PR **prod**" / "prod PR" | **prod** | `main` | **frozen** — must match the version verified on stage |

- **Base override:** if I name a base ("make it develop", `base: main`) → mine wins in every mode.
- **Branch:** the one I name; else this chat's worktree branch / the attached project's current branch. Not usable if it's `develop`, `main` or a `*-env-deployment` base branch (prod may use `develop` as head for a develop → main release). Nothing usable → ask me (only question).
- **"skip review"** → skip step 4 (local review) and step 10 (bot loop); open the PR without the label.

**Hard stops:** unrelated/secret files would be committed (show me); push/gh/auth fails; a fix needs a migration, data change or `.env`; a code fix is needed but the head is develop/main/a deployment branch (open the PR without the label and report).

## Steps

1. **Worktree + sync:** find the worktree with this branch (`git worktree list`); none → `git worktree add "D:\Afia Insurance\Projects\Office\<repo>-<requirement>" <branch>` + worktree setup. `git fetch origin`; behind its remote → `git pull`.
2. **Pending work first:**
   - **normal:** KB doc + skill done (else do them); `git status` → commit only this task's files (`<feat|fix>: <what>`), never `.env`/secrets/unrelated files.
   - **stage / prod:** uncommitted changes → **stop and show me** (they weren't tested on UAT/stage). Unpushed commits are fine (pushed in step 6).
3. **Mergeable with the base:** `git merge-tree --write-tree --name-only origin/<base> <branch>`. Conflicts → merge `origin/<base>` into the branch (no rebase), resolve keeping both sides' intent, commit `chore: merge <base> into <branch>`; list resolved files for the PR.
4. **Local review (normal mode only; skip with "skip review"):** sub-agents on `git diff origin/<base>...HEAD`: blanka `pr-review`, `alfred-orchestrator:find-bugs` (+ QA/security reviewers when payments, auth, uploads, external APIs or customer data are touched). Fix real bugs / Critical / High here, run affected tests, commit `fix: <what> (self-review)`; max 2 rounds; Medium/Low → PR description.
5. **Verify — stage / prod only ("ship exactly what was verified"):**
   - stage: find the merged UAT deploy PR (`gh pr list --search "head:<branch>-uat-deployment" --state merged`); prod: the merged stage PR into develop.
   - For every file in `git diff --name-only origin/<base>...<branch>`, compare with the verified head commit. Differences not coming from the base → `git revert` the commit that added them (never force-push). Base changes stay.
   - No verified deploy exists → don't compare; note "Not deployed to UAT/stage yet — no verified version to compare".
6. **Build, then push:** `yarn prod` (normal mode always; stage/prod only if composer/package/frontend files changed after steps 3–5, `composer install` likewise). Build files changed → commit `chore: build assets`. Then `git push -u origin <branch>` — one push with everything.
7. **Tests:** only the relevant ones (test files in the diff + tests covering changed classes), `--parallel` if >10. Failure from merging the base → smallest merge-glue fix; failure in feature code → normal: fix it; stage/prod: don't change feature code — open the PR without the label and report.
8. **Open or reuse the PR:** reuse an open PR for this head + base; else `gh pr create --base <base> --head <branch> --title "<title incl. CU id>" --body-file <file>`. Title prefix: stage `[STAGE]`, prod `[PROD]`. Body: CU link + title, Issue, What we fixed / built, What's covered, Tests, repo checklist, plus **Release notes**: conflicts resolved, self-review fixes / reverted extras, build/deps run or skipped, tests + results, items left for me. stage/prod → also post one PR comment: "This PR carries exactly the version verified on <UAT|stage> (PR #<n>) — please confirm it works."
9. **Label:** re-check mergeability first (base may have moved; conflicts → back to step 3). Label already on → remove and re-add; else add `ready for review`.
10. **Bot loop (skip with "skip review"):** `pr-bot-loop` — normal mode with `fix-branch: <branch>`; stage/prod with `no-code-changes` (reasons + resolve, real bugs as follow-ups) unless I say "fix the bot comments".
11. **Release tracker:** upsert this branch's item per the `release-tracker` skill (env = stage for a `develop` PR, prod for a `main` PR; `{pr, state: "open"}`; add `next`).
12. **Never merge. Never force-push.**

## Report

Mode, PR link, branch → base (and why), commits made (pending work, merge, fixes, build), reverted extras (stage/prod), tests + results, bot rounds, label status, items left for me. End with **Branch** and **Directory**.
