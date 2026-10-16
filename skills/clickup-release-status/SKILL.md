---
name: clickup-release-status
description: Shows where my ClickUp tasks are in the release pipeline — issues found, ready to test on dev, test or UAT, ready for staging / stage testing, ready for comms & prod, comms sent / in production, and done — so I know what needs a retest or is waiting for release. Use when I ask "ready for stage testing tasks", "what's ready to test", "what's on UAT", "comms sent", "what's in prod", "release status", or "which of my tasks are live".
argument-hint: [issues|dev|test|uat|stage|prod-ready|prod|done|all] [days=30]
---

# ClickUp — release status of my tasks

Read-only. Never change status, comment or assign.

- Me: Muhammad Waris, ClickUp user id `73270543`.
- Argument picks the stage; no argument = `all` (every stage except `done`).

## Stages (exact ClickUp status names, verified 2026-10-09)

| Arg | Stage | Exact status names |
|---|---|---|
| `issues` | 🔴 Issues found | `issues found` status, **plus** any not-done task tagged `issue` (second call: `tags: ["issue"]`, drop `comms. sent!!! done!`) |
| `dev` | 🧪 Ready to test — dev | `ready to test - dev`, `in progress testing - dev` |
| `test` | 🧪 Ready to test — test | `ready to test - test`, `in progress - test` |
| `uat` | 🧪 Ready to test — UAT | `ready to test - uat`, `in progress - uat test` |
| `stage` | 🎭 Staging / stage testing | `ready for staging`, `ready to test - stage`, `in progress - staging test` |
| `prod-ready` | 📣 Ready for comms & prod | `ready for comms & for prod` |
| `prod` | 🚀 Comms sent — in production | `comms. sent! in production` |
| `done` | ✅ Done | `comms. sent!!! done!` |

Other statuses in this workspace (filter by them if I name one): `new requirement`, `idea`, `in progress - req collect`, `in progress - bus review`, `in progress - mtr review`, `ready for ui/ux`, `in progress - ui/ux`, `ready for ba ui/ux review`, `in progress - ui/ux revisi`, `in progress - for approval`, `approved`, `in progress - development`, `in progress - pr review ` (trailing space), `for ba sign-off`, `for ba to confirm`, `for business to confirm`, `paused`, `blocked`, `rejected`.

If I name a status that isn't in this table, filter by that text instead.

## Steps

1. `clickup_filter_tasks` with `assignees: ["73270543"]`, `include_closed: true`, `subtasks: true`, `order_by: updated` and `statuses` set to the exact names for the chosen stage(s) (filtering server-side is much faster):
   use the exact names from the table above.
   Page until `has_more` is false. If I asked for a status not in this list, fetch without `statuses` and match the text instead.
2. Keep tasks whose status matches the chosen stage(s).
3. For `prod` and `done`, only show tasks updated in the last `<days>` days (default 30) and give the total count of older ones.
4. For each task: name, status, list, priority, last updated (relative), due date (⚠️ if overdue), URL.
5. For `issues`, `dev`, `test`, `uat` and `stage`: flag ⏳ if the task has sat in that status with no update for more than 3 days — it likely needs a nudge to QA.

## Output

```
🚦 Release status — <date>

🧪 Ready to test — UAT (<N>)
1. <Task name>
   📁 <List> | ⚡ <priority> | 🕒 updated <relative> <⏳ if stale> | 📅 <due>
   🔗 <url>
...
<one section per stage that has tasks, pipeline order: issues → dev → test → UAT → staging → prod-ready → prod → done>

Total: <N> tasks · <N> waiting for testing · <N> waiting for release
```

- Empty stage: skip it. Nothing at all: "No tasks of yours in <stage>."
- End with one tip line: `Try: /clickup-release-status issues · uat · stage · prod · done`.
