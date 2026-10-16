---
name: clear-worktree
description: Remove a finished feature/fix/hotfix worktree and its local branches (feature + its -test/-uat/-dev-deployment branches) for any repo under D:\Afia Insurance\Projects\Office\. Optionally also deletes the remote GitHub branches when I say "both local and remote". Use when I say "clear the worktree", "remove the worktree", "clean up this feature".
argument-hint: [worktree folder | branch | deploy branch] [both local and remote]
---

# Clear the worktree

My asking for this is permission to remove the worktree and delete the local branches described here.
Remote branches are deleted only when I say "both local and remote" (or "remote too", "also on GitHub").

**Find the target from whatever I give** (`git worktree list --porcelain` in the repo's main checkout):
- **A folder** (path or name like `blanka-book-policy-doc-check`) → read its branch from the worktree list (`worktree <path>` → `branch refs/heads/<branch>`).
- **A branch** → find its worktree folder from the same list (it may have none).
- **A deploy branch** (`…-<test|uat|dev>-deployment[-<cu-id>]`) → the feature branch is the name with only the `-<env>-deployment` part removed (the CU id stays, e.g. `feat/x-uat-deployment-86abc1234` → `feat/x-86abc1234`); clear the feature's worktree and all its deploy branches.
- **Nothing** → use this chat's attached project folder if it's a worktree (not the main checkout); else list the worktrees and ask me which one.
If the worktree is already gone, skip to the branch steps for that branch.

## Never remove

- The repo's main checkout (e.g. `Office\blanka`).
- `main`, `develop`, `test-env-deployment`, `uat-env-deployment`, `new-dev-env-deployment` — locally or on GitHub.
- Remote branches, unless I asked for "both local and remote".

## Steps (run from the repo's main checkout)

1. Identify:
   - the worktree path and its feature branch (`feat/…`, `fix/…`, `hotfix/…`, `revert/…`)
   - its local deploy branches: `git branch --list "<feature-branch>-*-deployment*"`
   - if remote too: its remote branches: `git ls-remote --heads origin "<feature-branch>" "<feature-branch>-*-deployment*"`
2. Safety check — stop and show me if any of these are true:
   - `git -C <worktree> status --porcelain` is not empty (uncommitted changes)
   - any of the branches has commits not on its remote: `git log origin/<branch>..<branch> --oneline` is not empty, or the branch was never pushed
   - remote too: any remote branch has an **open** PR: `gh pr list --head <branch> --state open` is not empty (deleting the branch would close it)
3. Show me the list of what will be removed (local and, if asked, remote).
4. Remove:
   - `git worktree remove "<worktree-path>"` (no `--force` unless I say so)
   - `git worktree prune`
   - `git branch -D <feature-branch> <deploy-branches...>`
   - remote too: `git push origin --delete <branch> [<branch>...]` — only branches that `git ls-remote` shows still exist
   - `git fetch origin --prune` to clear stale `origin/...` refs
5. If the folder still exists (Windows file lock, e.g. an editor or `node_modules`), tell me which process/folder is blocking instead of force-deleting.

## Report

Worktree removed, local branches deleted, remote branches deleted (or "already gone" / "kept"), anything skipped and why (e.g. open PR).
