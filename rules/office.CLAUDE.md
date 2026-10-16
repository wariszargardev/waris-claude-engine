# Rules — Muhammad Waris (Office)

_Scope: work under `D:\Afia Insurance\Projects\Office\` (blanka and the other office repos). Loaded through `~/.claude/CLAUDE.md` → `waris-claude-engine/rules/office.CLAUDE.md`._

## Communication
- Reply in short, plain English. I may write in Roman Urdu; understand it, answer in English.
- Give the answer first. Explain more only if I ask.
- When a task is done, end with a short status: what changed, what was tested, what is pending.

## When to ask me
- **Ask (plan + wait for approval):** only when writing or changing code for a feature, fix or hotfix — see Workflow below.
- **Don't ask, just do it end to end:** creating the branch/worktree (`/start-work`: show the names in the report, don't wait), commit + push + "create PR", deploys to test/UAT/dev, stage/prod PRs, PR-comment handling, and clearing a worktree. My request is the approval. Only the hard stops in the matching section or skill can stop these.

## Company engine first (alfred-orchestrator)
- The company plugin lives in `Office\claude` (`InsuranceMarket-ae/claude`), linked as `waris-claude-engine/company/alfred-orchestrator`. It's the team standard; my rules are a personal layer on top.
- **Before starting work** (plan-cu, start-work, a fix, a review, a new skill or agent):
  1. Check the plugin is current: `git -C "D:\Afia Insurance\Projects\Office\claude" fetch` → if `main` is behind `origin/main`, `git pull --ff-only` and tell me to run `/plugin marketplace update alfred` + `/reload-plugins`.
  2. Look for a plugin skill or agent that already covers the task, and use it instead of improvising. Main ones:
     - `alfred-orchestrator:pickup-cu` / `verify-cu` / `signoff-cu` / `raise-cu` for the CU lifecycle.
     - `legacy-analyst` / `kb-builder` for KB docs.
     - `planner` / `writing-plans` for plans.
     - `qa-reviewer` + `security-reviewer` + `performance-reviewer` + `find-bugs` for reviews.
     - `pr-writer` / `review-pr` / `pr-review-fix` for PRs.
     - `git-worktree-discipline` for worktrees.
  3. Follow its conventions: `knowledge-base/<module>/`, `plans/upcoming|in-progress|done/`, one feature = one worktree, push once per readiness milestone, never merge.
- **When they clash:** my approval gates win for me. Plan → wait for "approved"; no commit/push until "create PR". I don't use the plugin's bypass-permissions or fully autonomous `orchestrate-feature` mode unless I ask. Point out any other clash instead of silently picking one.
- Never edit the company repo as part of my personal work. Changes there go through their own branch + PR, and only when I ask.

## Workflow (feature / fix / hotfix)
1. Analyze: read the CU, then existing KB docs/skills for the area, then only the relevant code. Use an Explore sub-agent for broad searches. If requirements are unclear, ask before assuming.
2. Plan: files to change, approach, logging points, tests, KB/skill updates, risks. Stop and wait for my approval. No edits before approval.
3. Implement exactly the approved plan. If something new comes up, stop and update the plan with me.
4. Verify: run only the relevant tests.
5. Self-review with `pr-review` (or `/code-review`) and fix gaps, then report.
- Ask before DB migrations, data changes, or anything touching test, UAT, stage or prod.

## Code (only when building a new feature, fix or hotfix)
- Never add code comments unless I explicitly ask.
- Follow the existing style and conventions of the file and repo.
- Add or update tests for the changed behavior and run them before saying it's done.

## Logging (blanka / IMCRM)
- Add logs at the necessary places: entry, key decisions/branches, external calls, failures, and the final result.
- Every entry point of the feature (controller action, job `handle`, command `handle`, listener) starts logging first:
  - Lead involved: `LoggerService::startQuoteLogging($lead, LoggerFeatureEnum::<FEATURE>);`
  - No lead: `LoggerService::startFeatureLogging(LoggerFeatureEnum::<FEATURE>);`
  - Add a new `LoggerFeatureEnum` case for the feature if none fits.
- `LoggerService::info()` takes exactly two params: a clear message first, extra context array second. Never pass a third param.
  e.g. `LoggerService::info('Document upload validated', ['quote_type' => $type, 'files' => count($files)]);`
- Errors: `LoggerService::error('<message>', [<extra>], $exception);` with the caught exception.

## Feature deliverables (every new feature / fix / hotfix — always, never skip)
Before saying the work is done, make sure a KB doc and an invocable skill exist and are up to date:
- **First search** for an existing KB doc (`knowledge-base/`) and skill (`.claude/skills/`) covering the area you changed.
- **Exists** (usual for a fix / hotfix): update it with the new behavior, rules, logging and tests. Don't create a duplicate.
- **Doesn't exist:** create a new one as below.
- List the KB and skill paths (created or updated) in the final status.

1. **Knowledge base doc:** `knowledge-base/<feature-name>/README.md` covering the flow, entry points (controllers/jobs/commands), business rules, logging (feature enum + key log messages), config and tests.
2. **Invocable skill:** `.claude/skills/<feature-name>/SKILL.md` in the repo with `name` and a `description` naming the feature, the files involved and when to use it. It should point to the KB doc and explain how to debug the feature (which logs to search in Axiom).
   - `description` max 1024 characters (aim for under 900). Put long trigger phrases and file lists in a `## When to use` section in the body.
   - Folder name and frontmatter `name` must be the same.
   - Every created or updated skill must also exist locally with the same name and same content: `~/.claude/skills/<name>`. A hook does this on every edit and at every session start (also catching git pull/merge/VS Code edits), and rebuilds `D:\Afia Insurance\Projects\Office\skills-upload\<name>.zip`. In the final status, tell me to re-upload that zip to claude.ai.

## Git
- Never commit or push unless I explicitly ask. I review and commit myself.
  - Exception: `/start-work` pushes a **new** branch once, right after setup (with a `chore: build assets` commit only if `yarn prod` changed tracked files). Nothing after that is pushed until I've reviewed and said "create PR".
- Never work directly on main, develop, or any deployment branch.
- **Protected branches** (`main`, `develop`, `test-env-deployment`, `uat-env-deployment`, `new-dev-env-deployment`): never push to them, commit/merge/cherry-pick/reset on them, delete them, or merge a PR (`gh pr merge` / API) — only a human does that. A `PreToolUse` hook (`~/.claude/hooks/protect-branches.js`) blocks it; don't try to work around it — stop and tell me. Deploy branches (`fix/x-uat-deployment-<cu>`) and `git pull` on a base branch are fine.
- Never force-push, rebase shared branches, or delete branches without asking.
- Branch already checked out in another worktree (git says "already used by worktree at ..."): don't force it. Go to that worktree, `git pull` there (only if it has no uncommitted changes; otherwise stop and tell me), then return to the original repo/worktree and continue.

## Starting new work (feature / fix / hotfix)
- **Three entry points:**
  - `/plan-cu <cu> [branch: x]` → plan only. Creates nothing (no branch, worktree or build). Waits.
  - `/start-work <cu> [branch: x]` → branch + worktree + setup + first push, then plan (or reuse the plan already in this chat). Waits.
  - **"approved"** → set up whatever is missing (start-work), then build exactly the plan → tests → self-review → KB + skill. No commit/push.
- **CU status:** `/plan-cu` and `/start-work` first move the CU to `in progress - development` (from `issues found` or any unfinished status; not from paused/blocked/rejected/done). Only the status, only that CU, no asking.
- **Which branch:** the one I give with `branch: …`. Otherwise search first: CU id or parent CU id in a branch name, or an open (unmerged) PR for that feature → use it if exactly one strong match, ask me if unsure. No match → new `feat/`/`fix/` from develop (`hotfix/` from main only when I say hotfix).
- Every new feature, fix or hotfix gets its own worktree, created as a sibling folder directly under `D:\Afia Insurance\Projects\Office\`.
- Worktree folder name: `<repo>-<requirement>`, where `<requirement>` is 2–4 kebab-case words naming what the task is about (from the CU / my request). Short and clear, no CU id, no `feat`/`fix` prefix, never random or auto-generated names.
  - e.g. `blanka-book-policy-doc-check` for `fix/book-policy-email-document-existence-check`
  - e.g. `blanka-bnpl-ep-selection` for `feat/bnpl-ep-remain-selected-z8znm13naj`
- Don't wait for approval of the names; create it and show the branch and folder in the report.
- Pick the base branch by type:

| Type | Base branch | Branch name |
|---|---|---|
| New feature | `origin/develop` | `feat/<descriptive-name>-<cu-id>` |
| Fix | `origin/develop` | `fix/<descriptive-name>-<cu-id>` |
| Hotfix (only when I say "hotfix") | `origin/main` | `hotfix/<descriptive-name>-<cu-id>` |

- Fetch first so the base branch is fresh. Use `--no-track` when creating the branch.
- No CU task: drop the `-<cu-id>` part.
- Short, descriptive kebab-case names, e.g. `fix/book-policy-email-document-existence-check`, `feat/bnpl-ep-remain-selected-z8znm13naj`.

## Fix on an existing branch (when I name a branch or say "existing branch")
- Don't create a new branch, and don't run `/start-work`.
- Find the branch: use the one I named, or match my words (e.g. "recommendation engine branch") against `git worktree list` and `git branch -a`. Pick it if exactly one matches; if several match, ask.
- Work in the worktree that already has that branch checked out. If none has it, create a worktree for the existing branch (no new branch): `git worktree add "D:\Afia Insurance\Projects\Office\<repo>-<requirement>" <branch>`, then run the worktree setup below.
- Before editing: if the worktree has uncommitted changes that aren't mine for this task, stop and show me. If it's clean and behind the remote, `git pull` first.
- Everything else is unchanged: analyze → plan → wait for approval → implement → tests → self-review → KB/skill update → report with Branch and Directory.

## New worktree setup (blanka / IMCRM)
After creating a worktree, run these in the worktree folder, in order:
1. `composer install --ignore-platform-reqs` (run via PowerShell; composer is not on Git Bash PATH)
2. `yarn prod`
3. `doppler setup --project im-crm --config localenvs_waris_test --no-interactive`

## Create PR (when I say "create PR", in the same chat)
Follow the `create-pr` skill, end to end without asking:
1. KB doc + skill done (else do them first) → commit only this task's files.
2. Local review: `pr-review` + `find-bugs` (+ QA/security reviewers for risky areas); fix real bugs/Critical/High in this branch. **"skip review"** skips this and the bot loop.
3. `yarn prod` → commit build assets if changed → push once.
4. PR base: `hotfix/` → main, `feat/`/`fix/` → develop — unless I name a base ("make it develop"), then mine wins.
5. Description: CU link + title, Issue, What we fixed / built, What's covered, Tests, repo checklist.
6. Add `ready for review` → `pr-bot-loop`: wait ~5–10 min for the bot, fix only important findings (real bugs, Critical/High), remove label → push → re-add label; max 2 rounds; leave Medium/Low/debatable comments for me. Never merge.

## PR bot loop (create-pr, deploy-env)
- After every `ready for review` label: wait for the GitHub bot, fix important findings in the **feature/fix branch** (deploy PRs: push, re-merge into the deploy branch), remove + re-add the label. Max 2 rounds. Skipped with "skip review".
- Release (stage/prod) PRs stay identical to the verified version: bot findings get a reason + resolve, not code changes — unless I say "fix the bot comments".

## Deploy to test / UAT / dev (only when I ask)
- Follow the `deploy-env` skill. Always the same flow, end to end without waiting for me (I may be on another task; it must run unattended):
  0. Pre-check: if `<base-branch>` isn't updated from `develop` and merging would bring develop conflicts, don't create the branch. Stop and tell me "`<base-branch>` is not updated from develop" (missing commits + conflicted files). Also post in Google Chat **ENG - Code Reviews** tagging Ahsan Ashfaq asking him to update test/UAT/dev from develop (missing-commit counts; once per 24h). I'll say when it's updated, then you proceed.
  1. New deploy branch from the fresh base → merge the feature branch → resolve conflicts.
  2. `composer install` only if composer files changed; `yarn install` only if `package.json`/`yarn.lock` changed; build only if frontend files changed. Otherwise skip.
  3. Run only the tests for what changed — never the full suite.
  4. Push → open the PR (no label) → review it for bugs (fix in the feature branch, re-merge) → add the `ready for review` label.
- My deploy request is my full approval for every step of it (push, branch, merge, commit, build, tests, PR, label, review-loop fixes in the feature branch). Don't present a plan or ask for approval. The Workflow plan/approval steps don't apply to deploys.
- If the session is in Plan mode, skip the analysis write-up: call ExitPlanMode right away with a one-line summary ("Deploy <branch> to <env> per deploy-env"), then run the skill.
- Feature branch: the one I name; otherwise the current branch of the project attached to the chat (say which one you picked); only if neither works, ask me.
- Base branches: test → `test-env-deployment`, UAT → `uat-env-deployment`, dev → `new-dev-env-deployment`.
- Deploy branch name = feature branch name with `-<env>-deployment` inserted just before the CU id (same `feat/`/`fix/`/`hotfix/` prefix, same title). Never `chore/` or any other prefix.
  e.g. `feat/Alternative-Plans-Engine-86exb1kft` → `feat/Alternative-Plans-Engine-uat-deployment-86exb1kft`; no CU id → append `-uat-deployment`.
- Don't stop to ask during a deploy. Decide using the skill's rules and list every decision in the PR and the final report.
- Never merge the PR. I handle the merge.

## Stage / prod PR (only when I ask)
- Follow the `create-pr` skill. Unattended: push → PR (no label) → verify → relevant tests → answer comments → add `ready for review`. Never merge.
- **Ship exactly what was verified:** the PR's own changes must be identical to the version verified on UAT (for stage) or stage (for prod). Changes coming from `develop`/`main` are fine. Anything extra → revert it (no force-push).
- **No code changes for review findings** in a stage/prod PR: reply to each comment with the direct reason (verified on UAT/stage, intended, out of scope) and resolve it; list real bugs as follow-ups in the report. Post a PR comment saying it's the verified version and asking them to confirm it works.
- Label: if already on, remove and re-add it at the end.
- **Stage:** PR from the feature/fix branch into `develop`.
- **Prod:** PR from the branch I name (or the attached project's current branch) into `main`.
- If the head is behind the base with conflicts, merge the base into the head branch (no rebase) and resolve. Never commit fixes to `develop`, `main` or a deployment branch — if a fix is needed there, open the PR without the label and report.
- Head branch: the one I name; otherwise the current branch of the project attached to the chat (say which one you picked); only if neither works, ask me.
- My request is the approval; don't present a plan or ask anything else.

## Local review loop (before every `ready for review` label, first time and every time)
1. Run the repo's PR review skill on the deploy PR (`pr-review` in blanka; `/code-review` if the repo has none).
   Scope it to the feature's changes, conflict-resolved files and merge-glue commits only.
2. If it finds real bugs: switch to the feature/fix branch, fix there, push, merge it again into the deploy branch, re-run only the affected tests (install/build only if deps/frontend changed).
3. Max 2 rounds. Debatable findings go in the PR's Deploy notes, not another round. Then add the label.
- Never fix code directly in the deploy branch.

## PR comments (only when I ask)
Follow the `pr-comments` skill. Works on any PR (normal, stage/prod, deploy).
- **I name comments** (links / ids / "2 and 4") → act only on those.
- **I name none** → read all unresolved comments on the PR and decide each: **fix** (real bug, Critical/High, cheap clear in-scope improvement) → reply "Fixed in <sha>" + resolve; **reply + resolve** (intended, out of scope, debatable, minor) with the direct reason; **leave for me** only real business decisions.
- Fixes go in the feature/fix branch (deploy PRs: push, re-merge into the deploy branch). Stage/prod PRs: no code changes — reason + resolve, unless I say "fix them".
- Label: remove before fixing, re-add after, then one `pr-bot-loop` round.

## Clear the worktree (only when I ask; any repo under Office)
- I may give a worktree folder, a branch or a deploy branch — work out the rest yourself (folder ↔ branch from `git worktree list`; deploy branch → its feature branch). Nothing given → the attached project's worktree.
1. Check for uncommitted or unpushed changes. If any, stop and show me.
2. Remove the worktree folder (`git worktree remove`), then `git worktree prune`.
3. Delete the local feature/fix branch and its local `-test/-uat/-dev-deployment` branches.
4. Keep remote branches on GitHub, unless I say "both local and remote": then also delete them (`git push origin --delete`), but stop if any has an open PR. Then `git fetch origin --prune`. Never remove the main checkout or main/develop/deployment base branches.
5. Report what was removed.

## Release tracker
- Follow the `release-tracker` skill. Page + data on claude.ai: https://claude.ai/artifact/988rbaConLHDi6ia4Sjwy9 (never keep items in chat or local files).
- `track: …` adds/moves/closes, `untrack: …` deletes, `/release-tracker` refreshes from GitHub + ClickUp. No asking.
- deploy-env and create-pr update it at the end; the morning brief refreshes it.

## My personal Claude engine (waris-claude-engine)
- My own setup lives in `D:\Afia Insurance\Projects\Office\waris-claude-engine` (git): rules, personal skills, hooks, routines, memory, settings copy. `~/.claude` links into it.
- New personal skill (not a blanka feature skill): create it in `waris-claude-engine/skills/<name>/`, then run `install.ps1` to link it. Feature skills stay in the repo they belong to (blanka `.claude/skills`).
- Changed `settings.json`? Run `scripts/snapshot.ps1`. Never put secrets, webhook URLs or prod data exports in the repo.

## Skills
- If I repeat the same multi-step process, suggest turning it into a skill.
