---
name: review-before-pr
description: "Run a full local PR review and fix everything before opening a PR; push once, label once"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 4762ff62-af4c-4b10-b187-4027b7ee124a
  modified: 2026-10-14T07:37:15.854Z
---

Before opening any PR (stage/prod/deploy), run a thorough local review of the FULL diff vs the base (correctness, perf, tests rules, style/pint) and fix every real finding locally first. Then push once, open the PR once, add `ready for review` once.

**Why:** On blanka PR #15611 (2026-10-14) the GitHub review bot reported findings in several rounds, which meant many fix/push cycles and the label being removed and re-added repeatedly. Waris closed that PR and asked for a fresh one with the review done locally first.

**How to apply:** In release-pr / deploy-env / create-PR flows, do the review step BEFORE `gh pr create`, scoped to the whole `origin/<base>...<head>` diff (not just the latest commit). Avoid label toggling; only add the label when the PR is final. Related: [[blanka-worktree-and-no-commit]].
