---
name: start-work
description: Start a CU task in any office repo (default blanka) — picks the right branch (the one I give, an existing feature branch, or a new feat/fix/hotfix branch), creates or reuses its worktree under D:\Afia Insurance\Projects\Office\, runs setup, pushes the fresh branch once, then plans (or reuses the plan already in this chat) and waits for my approval. Also the setup step behind "approved" after /plan-cu. Use when I say "start work", "new task", "create a worktree", or give a CU to begin.
argument-hint: <cu-id | CU link | feat|fix|hotfix short description> [branch: <existing-branch>] [repo]
---

# Start work

Input: a CU id or ClickUp link, and/or type + short description; optionally `branch: <name>` (an existing branch to work in) and a repo name.

## 0. Understand the task (read-only)

- **CU given:** read it with the ClickUp connector (`clickup_get_task`, plus its parent if it has one).
- **Move the CU to development (`cu-status-start`, shared with /plan-cu) — first action, don't ask:**
  - Set the CU's status to `in progress - development` with `clickup_update_task` (only the status; nothing else on the CU).
  - Move it from anything not finished, including `issues found`, `approved`, `new requirement`, `ready to test - …`, `in progress - pr review `.
  - Skip if it's already `in progress - development`.
  - Don't move and just say so if it's `paused`, `blocked`, `rejected`, `comms. sent! in production`, `comms. sent!!! done!` or a closed/done status.
  - If the list has no `in progress - development` status (check `clickup_get_list` statuses), don't guess another one; say so.
  - Only the CU I gave, never its parent or subtasks. Report: `CU status: <old> → in progress - development`.
- Make no other ClickUp changes.
- **Repo:** the one I named; else the attached project's repo; else `blanka`.
- **Type:** `hotfix` only if I said "hotfix". Else `fix` for a bug / prod issue / "not working" / "error" / a Production Issues list; else `feat`.
- **Name:** short kebab-case from the CU title (3–6 words, no filler).

## 1. Pick the branch — `branch-select` rules (shared with /plan-cu)

1. **I gave a branch** (`branch: …`) → use it. Done.
2. **No branch given → search before creating** (`git fetch origin --prune` first):
   - the CU id in any local/remote branch name;
   - the **parent CU's** id in a branch name (e.g. US-19.x → FR-19 `86exb1kft` → `feat/Alternative-Plans-Engine-86exb1kft`);
   - an open, not-yet-merged PR whose title/branch matches the CU's feature (`gh pr list --state open --search "<keywords>"`).
   A candidate only counts if its PR is **not merged into develop** (still open, or no PR yet).
3. **Exactly one strong candidate** (CU id or parent CU id match) → use it and say so in the first line.
   **Weak or several candidates** → ask me once: "Work in `<branch>` or start a new branch?" (list them).
   **None** → new branch:

| Type | Base | Branch |
|---|---|---|
| feat | `origin/develop` | `feat/<name>-<cu-id>` |
| fix | `origin/develop` | `fix/<name>-<cu-id>` |
| hotfix | `origin/main` | `hotfix/<name>-<cu-id>` |

No CU → drop `-<cu-id>`.

## 2. Worktree

- **Existing branch already in a worktree** (`git worktree list`) → use that folder. If it's clean, `git pull`; if it has uncommitted changes that aren't from this task, stop and show me.
- **Existing branch, no worktree** → `git worktree add "D:/Afia Insurance/Projects/Office/<repo>-<requirement>" <branch>`.
- **New branch** → `git worktree add --no-track -b <branch> "D:/Afia Insurance/Projects/Office/<repo>-<requirement>" origin/<develop|main>` (`--no-track` is required).
- Folder name `<repo>-<requirement>`: 2–4 kebab-case words naming what the task is about, no CU id, no feat/fix prefix, never random. Don't wait for approval of the names — show them in the report.
  - `fix/book-policy-email-document-existence-check` → `blanka-book-policy-doc-check`
  - `feat/bnpl-ep-remain-selected-z8znm13naj` → `blanka-bnpl-ep-selection`
- **Fix on an existing branch** (I name a branch or say "existing branch", e.g. "recommendation engine branch"): no new branch. Match my words against `git worktree list` / `git branch -a`; exactly one match → use it, several → ask. Then the two "Existing branch" rules above, then the normal plan → approve → build flow.
- "Already used by worktree at <path>": don't force — go there, `git pull` if clean, come back and continue.

## 3. Setup (blanka / IMCRM; skip what's already done in an existing worktree)

1. `composer install --ignore-platform-reqs` (PowerShell)
2. `yarn prod`
3. `doppler setup --project im-crm --config localenvs_waris_test --no-interactive`

Other repos: their README / CLAUDE.md.

## 4. First push — new branches only, once

Right after setup: if `yarn prod` changed tracked files, commit them as `chore: build assets` (only build output); then `git push -u origin <branch>` (upstream = its own remote branch, never develop/main).
**This is the only automatic push.** All later work stays local and uncommitted until I've reviewed the files and say "create PR".

## 5. Rename the chat

`set_session_title` → the worktree folder name (e.g. `blanka-sale-summary-slow-query`).

## 6. Plan, or reuse the plan

- **A plan for this CU already exists earlier in this chat** (from /plan-cu or a previous run): don't redo it. If I already said "approved" → go straight to step 7. If not → show "Plan ready above — say approved", plus anything that changed now that the branch is known.
- **No plan yet** → follow the Workflow in Office CLAUDE.md: CU → KB doc + skill for the area → only the relevant code (Explore sub-agent for broad searches) → plan with files, approach, logging points, tests, KB/skill updates, risks → **stop and wait for "approved"**.

## 7. After "approved" — build + test

Implement exactly the approved plan; logging rules (startQuoteLogging / startFeatureLogging at entry points, `info()` 2 params, `error()` with exception); no code comments; add/update tests and run only the relevant ones; self-review with `pr-review`; update or create the KB doc + skill. New things that weren't in the plan → stop and update the plan with me. **No commit, no push.**

## 8. Report

Branch (new or existing, and why), worktree path, base commit, setup + first-push results, CU title + link; after build: what changed, logging, tests + results, KB + skill paths (re-upload the zip to claude.ai), pending. End with **Branch** and **Directory**.
