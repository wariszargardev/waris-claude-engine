---
name: blanka-worktree-and-no-commit
description: "For Blanka feature work - dedicated git worktree as a sibling folder under D:\\Afia Insurance\\Projects\\Office\\, never commit/push, finish with composer + yarn install"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 9a35f63e-d769-4616-a48f-01df20caf713
  modified: 2026-10-07T13:57:50.690Z
---

For Blanka (IMCRM) feature work the user wants:
- A **dedicated git worktree** for each feature, created as a sibling folder directly under `D:\Afia Insurance\Projects\Office\` (e.g. `blanka-imcrm-document-upload`), NOT under a `blanka-worktrees\` subfolder and NOT in the main `blanka` checkout.
- Branch cut from freshly pulled `origin/develop` — ALWAYS with `--no-track` (`git worktree add --no-track -b <branch> <path> origin/develop`). Without it the branch's upstream becomes origin/develop and the user's plain `git push` lands commits directly on develop (this happened on 2026-10-07 with fix/imcrm-document-upload-validation-logging and blocked their PR).
- **Never commit or push** — the user reviews and merges themselves. Applies even when orchestrate-feature says to commit/open a PR.
- Worktree setup, per the user on 2026-10-07: run `composer install --ignore-platform-reqs` through PowerShell/cmd, because composer isn't on the Git Bash PATH. Then run `yarn prod`, which already runs `yarn` and both vite builds. Then run `doppler setup --project im-crm --config localenvs_waris_test --no-interactive`. Doppler setup is scoped per directory, so every new worktree needs it. The user typed "imcrm / local_waris_test", but the real names are im-crm / localenvs_waris_test (verified). A localenvs_waris_stg config also exists. These steps belong in the Office CLAUDE.md draft.
- Proper structured logging (LoggerService/LoggerFeatureEnum with meaningful context) is expected on every path touched, plus a KB doc and an invocable `.claude/skills/<name>/SKILL.md` (`command: true`).

- Branch naming, confirmed by the user on 2026-10-07. Cut from develop: `feat/<descriptive-name>[-<cu-id>]` or `fix/<descriptive-name>[-<cu-id>]`. Leave out the CU part if there is no CU.
- Hotfix: when the user asks for a hotfix, cut `hotfix/<name>[-<cu-id>]` from `origin/main`, not develop. Every new feat, fix or hotfix gets its own worktree at the Office root.
- Decisions from 2026-10-07, now in Office\CLAUDE.md:
  - Review and PR-comment fixes go in the feature branch, which is then re-merged into the deploy branch. Never fix code in the deploy branch.
  - Before every `ready for review` label, run the local review loop (blanka's `pr-review` skill) until it's clean.
  - After the label, no auto-watching. The user names which bot comments to fix, reply to or resolve.
  - "Clear the worktree" deletes the worktree plus its local feature and deploy branches. Remote branches stay.
  - The user wants these rules in Office\CLAUDE.md, NOT in skills.
  - Worktree folder name is `<repo>-<short-name>`.
- Logging rule (user, 2026-10-07):
  - Every entry point starts with `LoggerService::startQuoteLogging($lead, LoggerFeatureEnum::X)`, or `startFeatureLogging(...)` when no lead is involved.
  - `LoggerService::info` takes exactly 2 params: message + extra array, never a third.
  - Every feature also ships a KB doc at `knowledge-base/<feature>/README.md` and a repo skill at `.claude/skills/<feature>/SKILL.md`.
  - Both rules are in Office\CLAUDE.md and the start-work skill.
- "Create PR" rule (2026-10-07, in Office\CLAUDE.md): when the user says "create PR" in the same chat, commit any uncommitted work on the branch, push, and open a PR. Hotfix PRs go to main; feat/fix PRs go to develop. Use the PR template, add no label, don't merge. The user calls Office\CLAUDE.md "global office wali".
- On 2026-10-07 the same workflows were also made into personal skills in `C:\Users\Muhammad Waris\.claude\skills\`: start-work, deploy-env, pr-comments, clear-worktree. These duplicate Office\CLAUDE.md, so if one changes, update both (or slim CLAUDE.md down to pointers).
- The user chose to keep the combined rules file at `D:\Afia Insurance\Projects\Office\CLAUDE.md` instead of the global `~/.claude/CLAUDE.md` (2026-10-07).
- Env deploy flow, run only when the user asks:
  1. Push the feature branch.
  2. Check out and pull the base branch: test-env-deployment, uat-env-deployment or new-dev-env-deployment.
  3. Create a branch from it named `<feat|fix>/<name>-<test|uat|dev>-deployment[-<cu-id>]`.
  4. Merge the parent feature branch into it and resolve conflicts carefully.
  5. Run `yarn prod` and the tests relevant to the PR.
  6. Push, open a PR into the base branch and add the GitHub label `ready for review` (verified to exist).
  7. Don't merge the PR.

**Why:** user corrected the worktree location mid-task and repeated "no need to commit" several times.
**How to apply:** default to this setup on any Blanka feature request; skip commit/PR phases of the pipeline.
