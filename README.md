# waris-claude-engine

**Muhammad Waris's personal Claude Code engine**: the rules, skills, hooks, routines and memory that run my day-to-day engineering work (CU → branch → PR → test/UAT → stage → prod), plus my morning brief, mention watcher and release tracker.

It is a personal toolkit, separate from company repos:

| Lives here | Lives elsewhere |
|---|---|
| My rules, my 15 workflow skills, hooks, routines, memory | Company plugin **alfred-orchestrator** → `InsuranceMarket-ae/claude` (linked in as `company/alfred-orchestrator`, never committed here) |
| My working notes (`work-notes/`, git-ignored) | blanka feature skills (pr-review, bor, …) → `blanka/.claude/skills` |

**Company engine first:** `rules/office.CLAUDE.md` tells Claude to check that alfred-orchestrator is up to date before any work. Claude uses the plugin's skills and agents and follows its conventions (KB, plans, worktrees, reviews), with my approval gates on top. `install.ps1` clones or updates the company repo and creates the `company/alfred-orchestrator` link.

---

## What's inside

```
waris-claude-engine/
├── rules/
│   ├── global.CLAUDE.md     global rules (reporting format)
│   └── office.CLAUDE.md     office rules: workflow, git, deploys, PRs, release tracker
├── skills/                  15 skills (table below)
├── hooks/
│   ├── protect-branches.js  PreToolUse: blocks push/commit/merge on main, develop, *-env-deployment, and PR merges
│   └── skill-check.js       validates every SKILL.md (≤1024-char description, name = folder), zips it for claude.ai, syncs repo skills
├── routines/                scheduled tasks (morning brief, mentions watcher, book-policy watch, myAlfred queue status)
├── agents/                  subagents: axiom-investigator (Sonnet), clickup-reader (Haiku), pr-plumber (Haiku)
├── memory/                  what Claude remembers about me and my work
├── settings/settings.json   permissions, deny list, hook registration, default mode
├── docs/                    pipeline cheat-sheet
├── scripts/snapshot.ps1     copies the live settings.json back into the repo
└── install.ps1              links everything into ~/.claude (no admin needed)
```

### Skills

| Step | Skill | Command |
|---|---|---|
| Plan | `plan-cu` | `/plan-cu <cu-id> [branch: x]` |
| Start | `start-work` | `/start-work <cu-id> [branch: x]` |
| Build | (start-work) | `approved` |
| PR / deploy | `create-pr` (`deploy-env` = shortcut) | `/create-pr <develop\|test\|uat\|dev\|main> [branch] [skip review]` (asks the target if left out) |
| Review | `pr-comments`, `pr-bot-loop` | `/pr-comments [PR or comment links]` |
| Clean up | `clear-worktree` | `/clear-worktree [folder\|branch] [both local and remote]` |
| Track | `release-tracker` | `track: …` · `untrack: …` · `/release-tracker` |
| Inbox | `morning-brief`, `chat-mentions-watch`, `clickup-my-threads`, `clickup-release-status` | `/morning-brief` · `/clickup-my-threads days=7` · `/clickup-release-status uat` |
| Ops | `book-policy-failed-attachments(-watch)`, `axiom-daily-report` | `/book-policy-failed-attachments 48h` |

---

## How it works

`install.ps1` makes `~/.claude` point into this repo:

| In `~/.claude` | Points to |
|---|---|
| `CLAUDE.md` | 3 lines that `@import` `rules/global.CLAUDE.md` and `rules/office.CLAUDE.md` |
| `skills/<name>` | `skills/<name>` (one junction per skill) |
| `hooks/` | `hooks/` |
| `scheduled-tasks/` | `routines/` |
| `agents/` | `agents/` |
| `projects/<project>/memory/` | `memory/` |
| `settings.json` | **copy** of `settings/settings.json` (Claude rewrites this file, so it can't be a link) |

So editing a skill or rule in Claude edits this repo directly. Commit whenever you want a saved version.

The office rules load through the global `CLAUDE.md` on purpose: Claude Code skips `@imports` from a project's parent folder that point outside the project.

---

## Set up on a new PC (me)

1. Install the **Claude desktop app** (sign in), **Git**, **Node.js 18+**, **GitHub CLI** (`gh auth login`), **PHP/Composer/Yarn/Doppler** for blanka.
2. Clone into the Office folder (the hooks and rules expect this path):
   ```powershell
   cd "D:\Afia Insurance\Projects\Office"
   git clone https://github.com/warisfullstackdev/waris-claude-engine.git
   cd waris-claude-engine
   powershell -ExecutionPolicy Bypass -File .\install.ps1
   ```
   Existing files get a `.bak-<time>` copy first. Running it twice is safe.
3. Restart the Claude app.
4. By hand (never in git):
   - `~/.claude/secrets/gchat-webhook.txt`: webhook URL of my **Morning Brief** Chat space (space → Apps & integrations → Webhooks).
   - `~/.claude/secrets/gchat-mentions-webhook.txt`: webhook URL of my **My Mentions** space.
   - claude.ai connectors: ClickUp, Google Chat, Gmail, Google Calendar, Axiom, Sentry.
   - Open each routine once and click **Run now** so its tools are pre-approved.
   - Optional: upload `Office\skills-upload\*.zip` to claude.ai so the skills work on the web too.
5. Check: start a chat in `Office\blanka` and ask "what are my office rules?". It should mention the release tracker and the protected branches.

---

## Set up for someone else

The engine is reusable, but it carries my ids and paths. Before installing:

1. **Fork or copy** the repo. Keep it **private** (skills contain internal Chat space ids, ClickUp list ids, repo names).
2. **Paths:** search and replace `D:\Afia Insurance\Projects\Office` with your own folder:
   - `hooks/skill-check.js` (`UPLOAD_DIR`)
   - `install.ps1` (memory folder name)
   - `rules/office.CLAUDE.md`
3. **Your ids:** search the repo for these and put in yours:
   - ClickUp user id `73270543`
   - Google Chat user id `users/105396637252591664896`
   - Chat space `spaces/AAQAOvX47Qo`, and reviewer Ahsan's user id
   - release-tracker artifact URL: publish your own tracker page and seed it
4. **Rules:** read `rules/office.CLAUDE.md` and change what doesn't fit your team: branch names, base branches, labels, the deploy flow.
5. **Memory:** delete `memory/*` (it's about me) and keep the empty folder.
6. Run `install.ps1`, restart Claude, then do the "By hand" list above.

---

## Daily use

- Change a skill or rule: just edit it (or ask Claude); it works at once.
- New personal skill: create `skills/<name>/SKILL.md`, then run `install.ps1` to link it.
- Changed permissions in the app: run `scripts\snapshot.ps1` to copy `settings.json` in.
- Save: `git add -A`, `git commit -m "…"`, `git push`.

## Never in git

Webhook URLs and `secrets/`, routine state and `*.flag` files, production exports (`*.csv`, `*.xlsx`), skill zips. See `.gitignore`.

## Lives in the cloud

- Release tracker page and data: https://claude.ai/artifact/988rbaConLHDi6ia4Sjwy9
- Pipeline cheat-sheet: https://claude.ai/artifact/XKDxMQqsrhjKDPQpPCmihr
