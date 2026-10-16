# My pipeline — skill cheat-sheet

`< >` = required · `[ ]` = optional · PR/branch/folder can be skipped when the chat's attached project already points to it.

| # | Step | Type this | What it does | Waits for me? |
|---|---|---|---|---|
| 1 | Plan only | `/plan-cu <cu-id or link> [branch: <branch>]` | Reads CU (+ parent), picks the branch (given / existing feature / new), reads KB + skill + code, writes the plan. **Creates nothing.** | Yes — say **approved** |
| 2 | Start | `/start-work <cu-id or link> [branch: <branch>] [repo]`<br>`/start-work <feat\|fix\|hotfix> <short description> [cu-id]` | Picks branch, creates/reuses worktree, composer + yarn prod + doppler, **first push** (new branch only), renames chat, then plans (or reuses the plan above). | Yes — say **approved** |
| 3 | Build + test | `approved` | Sets up anything missing, builds exactly the plan: logging, tests, self-review, KB + skill. **No commit, no push.** | Only if something new comes up |
| 4 | PR to develop | `/create-pr [branch] [base: develop\|main] [skip review]` | Commits task files → local review (pr-review + find-bugs) → yarn prod → push once → PR (hotfix → main, feat/fix → develop) → `ready for review` → bot loop. | No |
| 5 | Test / UAT / dev | `/deploy-env <test\|uat\|dev> [feature-branch]` | Pre-check (base behind develop → tags Ahsan in ENG - Code Reviews) → deploy branch → merge → build if needed → changed tests → PR → review → label → bot loop. Never merges. | No (hard stops only; say **bypass** to skip the pre-check) |
| 6 | Review comments | `/pr-comments [pr number \| PR link \| comment links]` | Named comments → only those. None named → decides every open comment: fix + resolve / reply + resolve / leave for me. Fixes in feature branch, re-merge for deploy PRs, re-label. | Only for business decisions |
| 7 | Stage | `/create-pr stage [branch]` | PR into develop that must match the UAT-tested version (extras reverted, code frozen, bot comments answered with reasons). | No |
| 7 | Prod | `/create-pr prod [branch]` | PR into main that must match the stage-verified version (code frozen). | No |
| 8 | Clean up | `/clear-worktree [folder \| branch \| deploy-branch] [both local and remote]` | Removes the worktree + local feature and deploy branches; remote too only with "both local and remote" (stops on open PRs). | No |

## Release tracker (anytime)

Page: https://claude.ai/artifact/988rbaConLHDi6ia4Sjwy9

| Type this | What it does |
|---|---|
| `track: <what> [urgent\|high\|low] [on test\|uat\|stage\|prod]` | Add a note, CU or branch (CU id → title/status/PRs filled in) |
| `track: <item> moved to <stage>` / `track: <item> done` | Move it / close it |
| `untrack: <item>` | Delete it |
| `/release-tracker` | Refresh everything from GitHub merged PRs + ClickUp, with flags |

## Helpers that run inside the steps

| Skill | Used by | What it does |
|---|---|---|
| `pr-bot-loop` | create-pr, deploy-env, pr-comments | After the label: waits 5–10 min for the GitHub bot, fixes important findings, remove → push → re-add label, max 2 rounds. Skipped with "skip review". |
| `pr-review` | create-pr, deploy-env, pr-comments | Laravel review of the diff. |

## Handy words

- `skip review` — no local review, no bot loop (create-pr / deploy-env).
- `bypass` — continue a deploy even if test/UAT/dev isn't updated from develop.
- `make it develop` / `base: main` — override the PR base.
- `fix them` / `fix the bot comments` — allow code fixes on a stage/prod PR.
- `both local and remote` — clear-worktree also deletes GitHub branches.

## Typical day

```
/plan-cu z8znm1abc            → read plan → approved
review the files              → /create-pr
/deploy-env uat               → QA tests → /pr-comments (if needed)
/create-pr stage              → merged → /create-pr prod
/clear-worktree
```
