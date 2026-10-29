# Personal track — stack and brand config

Edit this file when my stack or focus changes. `fb-tips` and `dev-trends-digest` read it every run; nothing else needs to change.

## Brand (Facebook page)
- Brand: **Build Real Code** — YouTube `@BuildRealCode` + Facebook page (same name/handle). Never my personal name. LinkedIn stays personal (Muhammad Waris) and links to the brand.
- Tagline: "Real-world projects, built with AI — from idea to production". Banner shows categories, never specific technologies (Backend · Frontend · Databases · AI Agents · AI Tools · Automation), so a stack change doesn't need a new banner. Brand files live in `D:\Social Media\` (logo jpg, youtube-banner, facebook-cover, linkedin-banner, wordmark, thumbnail + shorts-cover templates — each .html source + .png); re-render a PNG with headless Edge (`msedge --headless=new --screenshot=… --window-size=W,H file:///…`).
- Per-video templates (same folder): `thumbnail.html` (1280×720) and `shorts-cover.html` (1080×1920). Title lines come from the URL: `…/thumbnail.html?l1=Stop%20N%2B1&l2=Queries` → render to `thumb-<slug>.png` / `short-<slug>.png`. Keep l1/l2 to 1–3 words each. The fb-tips content pack should give l1/l2 for every tip.
- Colors: background #0B1220 (deep navy), code green #3DDC84, warm amber #FFB547, text #E8EDF5. Fonts: JetBrains Mono (code/logo), Inter (text).
- Voice: practical, beginner-friendly, one idea per post, English

## Current stack (topics, in priority order)
| Topic | Weekly FB tips (of 5) | Digest sources | Hashtags |
|---|---|---|---|
| Laravel + PHP | 2 | laravel.com/blog, github.com/laravel/framework releases, laravel-news.com, php.net, pestphp.com | #Laravel #PHP |
| Vue + frontend (Inertia, Vite, Tailwind) | 1 | blog.vuejs.org, github.com/vuejs/core releases, inertiajs.com, vite.dev/blog, tailwindcss.com/blog | #VueJS #Frontend |
| Claude Code + AI dev tools | 1 | github.com/anthropics/claude-code CHANGELOG, docs.claude.com release notes, anthropic.com/news | #ClaudeCode #AI |
| Git + testing | 1 | git-scm.com, pestphp.com | #Git #Testing |

Always-on hashtags: #WebDevelopment #Programming

## How to change
- New stack (e.g. Laravel → Node/NestJS): replace the row, keep the tip count summing to 5.
- Drop a topic: delete its row and give its tips to another row.
