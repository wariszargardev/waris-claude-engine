---
name: blanka-worktree-and-no-commit
description: "Blanka worktree setup facts and the 2026-10-07 --no-track incident; the current workflow rules live in waris-claude-engine/rules/office.CLAUDE.md and the skills, not here"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 5b9e8bb9-6adf-4cd0-b648-8976abe834fe
  modified: 2026-10-19T05:21:50.304Z
---

**Superseded (rewritten 2026-10-19).** The workflow rules this memory used to hold (never commit, rules in CLAUDE.md rather than skills, skip PR phases, deploy steps) are out of date. The current rules are in `waris-claude-engine/rules/office.CLAUDE.md` and the skills `plan-cu`, `start-work`, `create-pr`, `deploy-env`, `pr-comments` and `clear-worktree`. Follow those. Commits and pushes happen when the user asks ("create PR", a deploy, a release PR), and `/start-work` pushes a new branch once.

Facts still worth keeping:
- Always use `--no-track` when cutting a branch from `origin/develop`. On 2026-10-07, without it, a plain `git push` landed commits directly on develop and blocked his PR.
- Doppler config names are `--project im-crm --config localenvs_waris_test`. He says "imcrm / local_waris_test", but those aren't the real names. A `localenvs_waris_stg` config also exists. Doppler setup is per directory, so every new worktree needs it.
- Composer isn't on the Git Bash PATH, so run it through PowerShell.

**Why:** the old version contradicted the current rules and could make Claude refuse to commit during "create PR".
**How to apply:** for workflow questions, read the rules file and skills. Use this memory only for the facts above. Related: [[waris-claude-engine-repo]].
