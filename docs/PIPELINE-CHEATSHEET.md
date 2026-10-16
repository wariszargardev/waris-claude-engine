# My pipeline — skill cheat-sheet

`< >` = required · `[ ]` = optional · PR/branch/folder can be skipped when the chat's attached project already points to it.

| # | Step | Type this | What it does | Waits for me? |
|---|---|---|---|---|
| 1 | Plan only | `/plan-cu <cu-id or link> [branch: <branch>]` | Reads CU (+ parent), picks the branch (given / existing feature / new), reads KB + skill + code, writes the plan. **Creates nothing.** | Yes — say **approved** |
| 2 | Start | `/start-work <cu-id or link> [branch: <branch>] [repo]`<br>`/start-work <feat\|fix\|hotfix> <short description> [cu-id]` | Picks branch, creates/reuses worktree, composer + yarn prod + doppler, **first push** (new branch only), renames chat, then plans (or reuses the plan above). | Yes — say **approved** |
| 3 | Build + test | `approved` | Sets up anything missing, builds exactly the plan: logging, tests, self-review, KB + skill. **No commit, no push.** | Only if something new comes up |
| 4 | PR — any target | `/create-pr <develop\|test\|uat\|dev\|main> [branch] [skip review] [bypass]` (asks the target if you leave it out) | develop: commit → review → build → push → PR. test/uat/dev: pre-check base (behind develop → tags Ahsan) → deploy branch from that base → merge feature → build only if needed → changed tests → review → PR. main: hotfix PR. Then `ready for review` → bot loop. Never pushes/merges into protected branches. | No (hard stops only) |
| 5 | Test / UAT / dev | `/create-pr uat` (shortcut: `/deploy-env uat`) | Same command, env target. Fixes always go in the feature branch, then re-merge. | No |
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
| `pr-bot-loop` | create-pr, pr-comments | After the label: waits 5–8 min for the bot; replies + resolves (label stays) or removes label → fixes in the feature branch → review → push → re-adds label. Max 2 rounds. Skipped with "skip review". |
| `pr-review` | create-pr, pr-comments | Laravel review of the diff. |

## Handy words

- `skip review` — no local review, no bot loop (create-pr, any target).
- `bypass` — continue a deploy even if test/UAT/dev isn't updated from develop.
- `make it develop` / `base: main` — override the PR base.
- `fix them` / `fix the bot comments` — allow code fixes on a stage/prod PR.
- `both local and remote` — clear-worktree also deletes GitHub branches.

## Typical day

```
/plan-cu z8znm1abc            → read plan → approved
review the files              → /create-pr
/create-pr uat                → QA tests → /pr-comments (if needed)
/create-pr stage              → merged → /create-pr prod
/clear-worktree
```
