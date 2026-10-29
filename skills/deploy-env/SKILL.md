---
name: deploy-env
description: Shortcut for deploying a feature/fix/hotfix branch to test, UAT or dev — runs the create-pr skill with that target (test/dev - deploy branch cut from the env base + merge; UAT - direct PR from the feature branch, no local merge; hotfix branches - deploy branch cut from the env base with only the hotfix commits cherry-picked; then only-changed build/tests, review, PR, label, bot loop; never merges the PR). Use when I say "deploy to test/uat/dev", "merge into test", "create the UAT deployment PR", or "/deploy-env <env>".
argument-hint: <test|uat|dev> [feature-branch] [skip review]
---

# Deploy to test / UAT / dev

This is `create-pr` with target = the env I named. Follow the `create-pr` skill exactly, passing the env as the target and the rest of my words (branch, "skip review") through. Don't keep a separate procedure here.
