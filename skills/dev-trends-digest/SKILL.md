---
name: dev-trends-digest
description: My weekly developer-trends digest — last 7 days of Laravel + PHP, Vue + frontend (Inertia, Vite, Tailwind) and Claude Code + AI dev tooling news, filtered for what matters to a senior Laravel/Inertia-Vue engineer on blanka (IMCRM). Each item says what changed, why it matters for us, and try / watch / ignore, with a source link. Publishes a dashboard page and posts one summary card to my Morning Brief Chat space. Use when I say "dev trends", "what's new in Laravel/Vue/Claude Code", "weekly digest", or when the Friday 17:00 routine fires.
argument-hint: [days=7] [chat]
---

# Dev-trends digest

Read-only research. Never post anywhere except my own Chat space via webhook. `chat` = print only (no page, no card).

## 1. Collect (last `<days>` days, default 7)

Topics and primary sources come from `D:\Afia Insurance\Projects\Office\waris-claude-engine\personal-track\stack.md` (its table wins over the list below if they differ). Use WebSearch (extended mode for freshness) and WebFetch on primary sources first; blogs only to explain.

| Topic | Primary sources |
|---|---|
| Laravel + PHP | laravel.com/blog, github.com/laravel/framework releases, laravel-news.com, php.net (releases/RFCs), pestphp.com, Horizon/Inertia/Pint release notes |
| Vue + frontend | blog.vuejs.org, github.com/vuejs/core releases, inertiajs.com / github.com/inertiajs releases, vite.dev/blog, tailwindcss.com/blog |
| Claude Code + AI tooling | Claude Code changelog (github.com/anthropics/claude-code CHANGELOG, docs.claude.com release notes), anthropic.com/news, notable AI dev-tool releases |

Keep only items published inside the window. Drop rumours, listicles, and anything without a source link.

## 2. Filter and rank

Our stack: Laravel 13 / PHP 8.4, Inertia v2 + Vue 3, Tailwind, Pest, Horizon/Redis, MySQL; Claude Code with skills, hooks, subagents, scheduled tasks, MCP connectors.

Max 5 items per topic. For each item:
- **What:** one line, plain English.
- **Why it matters for us:** one line tied to blanka or my Claude setup (e.g. "could replace our custom X", "affects our Inertia v2 upgrade path", "new hook event we could use for protect-branches").
- **Verdict:** `Try` (worth an hour this week), `Watch` (track, not yet), or `Ignore` (FYI only). At most 3 `Try` in total.
- **Link** to the primary source.

Then:
- **Try this week:** the 1–3 `Try` items as concrete small experiments.
- **Post ideas:** 2 LinkedIn angles from this week's news that connect to something I built (feeds the `linkedin-post` skill).

## 3. Deliver

- Save the digest as Markdown to `D:\Afia Insurance\Projects\Office\waris-claude-engine\work-notes\personal-track\dev-trends\<YYYY-MM-DD>.md` (create folders as needed).
- Dashboard page: build from the morning-brief dashboard style (`~/.claude/skills/morning-brief/dashboard-template.html`): header with pills (counts per verdict), "Try this week" block first, then one card per topic with colored bars (Try = green, Watch = amber, Ignore = grey), then "Post ideas". Write the file with the Write tool (never assemble with PowerShell `Get-Content`; grep the file for `â` before publishing).
  Publish with the Artifact tool to the URL stored in `work-notes\personal-track\urls.json` key `devTrends`; if missing, publish new and save the URL there. Never create a second page.
- Chat card: POST one cardsV2 card via the webhook in `C:\Users\Muhammad Waris\.claude\secrets\gchat-webhook.txt` (never print the URL; never use the Chat connector's send_message): header "Dev trends — week of <date>", one row per Try item, a "Watch: n · Ignore: n" line, and an "Open digest" button to the page URL. UTF-8 JSON via curl, expect 200, retry once; on failure send a push notification "Dev trends: webhook failed".
- In chat, print the Try list and the page link.
