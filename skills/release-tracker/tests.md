# release-tracker — sample prompts (checker for this skill)

Re-run after every edit: `powershell -File scripts\skill-tests.ps1 release-tracker`. Writes go to the live tracker page — the dry run must only describe them.

| # | What I say | Expected |
|---|---|---|
| 1 | `track: Book policy email not sending — find why, urgent` | New `kind: note`, `priority: urgent`, `stage: todo` in collection `items`; no duplicate if a similar title exists. |
| 2 | `track: z8znm1bf15 on stage` | `kind: cu`, doc id `cu-z8znm1bf15`; title + status read from ClickUp; stage `stage`. |
| 3 | `track: imcrm document upload done` | Matches the existing item by title words; sets `stage: done` + `doneAt`. |
| 4 | `untrack: rec engine 2 plans` | Deletes that one doc and says which. Two matches → asks once. |
| 5 | `/release-tracker` | Refresh: PRs by CU id / branch, env from the PR base (`develop` = stage, `main` = prod), never moves an item backwards or to done; flags (ClickUp says stage but no develop PR, open PR > 5 days, same stage > 14 days); updates `meta/sync`; ClickUp is read-only. |
