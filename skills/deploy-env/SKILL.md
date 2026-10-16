---
name: deploy-env
description: Shortcut for deploying a feature/fix/hotfix branch to test, UAT or dev — runs the create-pr skill with that target (deploy branch cut from the env base, merge, only-changed install/build/tests, review, PR, label, bot loop). Use when I say "deploy to test/uat/dev", "merge into test", "create the UAT deployment PR", or "/deploy-env <env>".
argument-hint: <test|uat|dev> [feature-branch] [bypass] [skip review]
---

# Deploy to test / UAT / dev

This is `create-pr` with target = the env I named. Follow the `create-pr` skill exactly, passing the env as the target and the rest of my words (branch, "bypass", "skip review") through. Don't keep a separate procedure here.
