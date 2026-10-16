---
name: waris-claude-engine-repo
description: Where my personal Claude setup lives — waris-claude-engine repo, ~/.claude junctions, install.ps1, GitHub account warisfullstackdev
metadata:
  type: reference
---

My rules, 15 personal skills, hooks, routines, memory and a settings.json copy live in `D:\Afia Insurance\Projects\Office\waris-claude-engine` (git, built 2026-10-16). `~/.claude` points into it with junctions made by `install.ps1`; `~/.claude/CLAUDE.md` @imports `waris-claude-engine/rules/{global,office}.CLAUDE.md` (Office/CLAUDE.md is only a pointer — parent-folder imports outside the project are skipped). New personal skills go in its `skills/` + re-run install.ps1. Remote target: private repo on personal GitHub `warisfullstackdev` (not InsuranceMarket-ae). Cleaned up 2026-10-16: old `waris-workbench` copy and the `claude-reco-engine-skill` worktree removed (its staged README/skill changes saved as `~/.claude/backups/pre-workbench-20261016/claude-reco-engine-skill-staged.patch`). `~/.claude/skills/synced/` is the app's claude.ai skill sync — not a leftover, keep it.

Related: [[release-tracker-artifact]], [[claude-code-learning-plan]]
