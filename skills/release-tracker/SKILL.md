---
name: release-tracker
description: My release tracker — one cloud page (claude.ai artifact with its own database) listing every note/to-do, CU task and branch with priority and where it is (to do, dev, test, UAT, stage, prod, done), plus mismatch flags. Add, move, close or delete items ("track: …", "untrack: …"), or refresh everything from GitHub merged PRs and ClickUp ("/release-tracker"). Also refreshed after deploy-env and create-pr runs and inside the morning brief. Use when I say "track:", "untrack:", "release tracker", "what's on test/UAT/stage/prod", or "what am I forgetting".
argument-hint: [track: <what> [urgent|high|low] [on <stage>] | untrack: <item> | refresh]
---

# Release tracker

**Page:** https://claude.ai/artifact/988rbaConLHDi6ia4Sjwy9 (private to me).
**Data:** the page's database, read/written with the `ArtifactData` tool (load it via ToolSearch `select:ArtifactData`). Never store items in the page source, a local file or chat memory. My request is permission for every write described here.

## Data model

Collection `items`, one doc per item (doc id = `cu-<cu-id>` for a CU, else a kebab slug of the branch or title):

| Field | Values |
|---|---|
| `title` | short plain name |
| `kind` | `note` (to-do / issue to look into), `cu` (ClickUp task), `internal` (improvement with no CU) |
| `priority` | `urgent`, `high`, `normal`, `low` (default `normal`; "highest" = `urgent`) |
| `stage` | `todo`, `dev`, `test`, `uat`, `stage`, `prod`, `done` — furthest env it has reached |
| `cu_id`, `cu_url`, `cu_status` | ClickUp, when there is a CU |
| `branch` | the feature/fix/hotfix branch |
| `envs` | `{test|uat|stage|prod: {pr, state: "merged"|"open"}}` — stage = PR into `develop`, prod = PR into `main` |
| `next` | one line: what's next / what needs a retest |
| `flags` | list of short mismatch warnings (see below) |
| `createdAt`, `updatedAt`, `stageSince`, `doneAt`, `source` | ISO times; source `claude` or `page` |

Doc `meta/sync`: `{lastSync, by}` — update it on every refresh.

Always `get`/`list` first and pass `if_version` on writes to existing docs. Several writes → one `batch`.

## Commands

- **`track: <what> [priority] [on <stage>]`**
  - CU id or CU link in it → `kind: cu`; read the CU (`clickup_get_task`) for the title and status; find its branch/PRs (below).
  - Branch name in it → `kind: internal` unless a CU id is in the branch name; find its PRs.
  - Otherwise → `kind: note`, stage `todo`.
  - Same item already tracked (same CU id, branch or very similar title) → update it, don't duplicate.
- **`track: <item> moved to <stage>` / `on prod` / `done`** → set `stage` (+ `stageSince`; `doneAt` for done). Match the item by CU id, branch or title words; ask only if two items match.
- **`track: <item> urgent|high|normal|low`** → set priority. Any extra words → `next`.
- **`untrack: <item>`** → delete the doc. Say what was deleted.
- **`/release-tracker`** (or "refresh the tracker") → full refresh below, then reply with a short summary + the page link.

## Refresh (from the source of truth)

In parallel: `pr-plumber` for the GitHub PR lookups and `clickup-reader` for the CU statuses; the lead computes stages, flags and writes the database.

For every open item with a `branch` or `cu_id` (repo `InsuranceMarket-ae/blanka`):
1. PRs: `gh pr list --state all --search "<cu-id or branch> in:head" --json number,headRefName,baseRefName,state,mergedAt`. Map base → env: `test-env-deployment` → test, `uat-env-deployment` → uat, `new-dev-env-deployment` → (dev, note only), `develop` → stage, `main` → prod. Latest PR per env wins; `MERGED` → merged, `OPEN` → open; ignore closed-unmerged.
2. `stage` = furthest env with a merged PR (never move an item backwards; never auto-move to `done`).
3. CU status: `clickup_get_task` → `cu_status`. Read-only: never change ClickUp from here.
4. Flags (replace the list each refresh):
   - merged to an env but `cu_status` still `in progress - development` / `in progress - pr review `
   - `cu_status` is `ready for staging` / `ready to test - stage` but no merged `develop` PR
   - `cu_status` is `comms. sent! in production` / done but no merged `main` PR
   - open PR older than 5 days
   - in the same stage for more than 14 days (`stageSince`)
   - `kind: cu` with no PR found → "no PR with <cu-id> in the branch name"
5. Also add items automatically: my open PRs (`gh pr list --author "@me" --state open`) and my PRs merged in the last 14 days whose head branch isn't tracked yet → new `cu`/`internal` item (skip `develop`, `main`, `*-env-deployment` heads; a deploy branch maps to its feature branch by removing `-<env>-deployment`).
6. Notes (`kind: note`) are never auto-changed — only flag them when older than 14 days.
7. Write `meta/sync`.

## Hooks into other skills

- **create-pr (every target, incl. /deploy-env):** at the end, upsert the item for that feature branch (env cell = the PR just opened, state `open`; stage unchanged until merged) — one batch, no refresh of everything.
- **morning-brief:** run the refresh, then add a "📋 Release tracker" section: urgent items, flagged items, and the page link.

## Report

Short: what changed (added / moved / deleted / flags), counts per stage, and the page link.
