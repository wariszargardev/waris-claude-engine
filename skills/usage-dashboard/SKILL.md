---
name: usage-dashboard
description: My live Claude Code usage dashboard at http://localhost:4317 — tokens, time, model calls, bag size, cache hits, tools/skills/subagents per prompt, session and day, read live from ~/.claude/projects/**/*.jsonl, with automatic "where to improve" tips and a weekly review. Use when I say "open my usage dashboard", "how many tokens today", "why was this prompt/session heavy", "review my Claude usage", or when the daily usage-weekly-review routine fires (09:30 and 16:30). Read-only on transcripts.
---

# Usage dashboard

Code: `D:\Afia Insurance\Projects\Office\waris-claude-engine\usage-dashboard\` (`lib.js` parser + stats, `server.js`, `start.js`, `public/index.html`). Runtime files in `usage-dashboard\data\` are git-ignored.

## Open it

- A SessionStart hook runs `start.js`, so the server is normally already up.
- Otherwise: `node "C:/Users/Muhammad Waris/.claude/waris-claude-engine/usage-dashboard/start.js" --open` (starts it if needed and opens the browser).
- The page polls `/api/stats?days=N` every 5 s. Port 4317, bound to 127.0.0.1 only. Server log: `usage-dashboard\data\server.log`.
- Changed `lib.js` or `server.js`? Restart: stop the process listening on 4317, then run `start.js`.

## Answer questions from the data, not from memory

- Quick numbers: `node "<engine>/usage-dashboard/server.js" --report <days>` prints JSON (today, daysList, projects, sessions, top 25 prompts, usage, agentTokens, tips, improvements). Or `curl localhost:4317/api/stats?days=7`.
- "Why was X heavy": find the prompt or session in that JSON. Explain with: bag at start (baseline), bag max, model calls, big tool outputs (tool + file), subagent tokens, cache write after a gap of 60+ min. Use the bag story: every call resends the whole bag.

## How numbers are counted

- One model call = one unique `message.id` (transcript lines repeat per content block and across resumed sessions; dedupe globally).
- Bag size = `input_tokens + cache_read + cache_creation` of that call. Prompt tokens = all its calls' bag + output, plus subagent calls made during it.
- Prompt = a real user message (not tool results, meta or `<local-command>` lines). Its time = prompt start → last reply.
- Tool output size is an estimate: chars/4, with base64 images/PDFs counted as ~1,600 tokens each.
- Cost = the session's cumulative `cost-state.totalCostUSD` (API-equivalent, not a bill).
- Transcript format is not an official API. Unreadable lines are skipped and shown as a warning bar; never crash on them.

## Tips the dashboard raises

Baseline ≥ 80k (lists skills with descriptions > 1024 chars) · a tool result ≥ 20k tokens · a session bag ≥ 160k · cache re-written after a 60+ min break · ≥ 15 calls with ~1 tool per call (run independent tools in parallel). Add a new rule in `buildTips()` in `lib.js` when a weekly review finds a repeating pattern.

## Usage review (daily routine 09:30 + 16:30, or "review my Claude usage")

1. Run `server.js --report 1` (last 24 h: the morning run covers yesterday, the 16:30 run covers today so far) and `server.js --report 7` for the trend.
2. Pick 3–5 concrete actions, highest token saving first. Each names the exact thing to change: a skill to shorten or split, a plugin to disable for a repo, a rule to move from CLAUDE.md into a skill, a habit (e.g. `/clear` after a task), a step to move into a script. Never generic advice.
3. Write `usage-dashboard\data\improvements.json`: `{ "generatedAt": <ms>, "summary": "<one line: week tokens, prompts, biggest cost>", "actions": [ { "level": "high|medium|low", "title": "...", "why": "<numbers from the report>", "how": "<exact change>" } ] }`. The dashboard shows it under "Weekly review".
4. Post one short card to the Morning Brief space via the webhook in `~/.claude/secrets/gchat-webhook.txt` (never print it, never use send_message): last-24h totals (tokens, prompts, working time) + the action titles + "Open dashboard: http://localhost:4317".
5. Change nothing else. The review only lists actions (e.g. "shorten skill X"); it never applies them. Applying one is a separate request from me.

Never send prompt text or transcript content anywhere except that card's short action titles.
