---
name: fb-tips
description: Weekly batch of 5 short developer tips (Mon–Fri) for my generic-brand Facebook page (no personal name), in English, on the topics set in personal-track/stack.md (today Laravel + PHP, Vue, Claude Code / AI, Git/testing) — built from my daily dev notes and the dev-trends digest. Each tip has a caption, a small code snippet, an image idea and hashtags, ready to schedule in Meta Business Suite in one go. Generic and safe (no company data), never posts. Use when I say "facebook tips", "fb tips", "tips for the page", or when the Sunday 18:00 routine fires.
argument-hint: [count=5]
---

# Facebook page tips (weekly batch)

Drafts only. Never post to Facebook, never use Meta tools. I schedule them myself in Meta Business Suite.

## 1. Sources

- My daily notes from the last 7 days (`work-notes\personal-track\notes\`) — their "Tip form" lines.
- The latest dev-trends digest (`work-notes\personal-track\dev-trends\`) — Try items.
- My learning-track lessons (Claude Code modules) for Claude Code tips.
- Never repeat a tip listed in `work-notes\personal-track\fb\log.md` in the last 60 days.

## 2. Mix for 5 tips

Read `D:\Afia Insurance\Projects\Office\waris-claude-engine\personal-track\stack.md` first. Its table sets the topics, how many of the 5 tips each gets, and the hashtags (today: 2 Laravel/PHP, 1 Vue/frontend, 1 Claude Code/AI, 1 Git/testing). One tip per weekday, easiest on Monday. The page is a generic brand: never use my name, never "I at my company"; write as "you can…".

## 3. Each tip

- **Hook line** (max 10 words), e.g. "Stop N+1 queries with one word: with()".
- **Caption:** 3–5 short lines, plain English, beginner-friendly, one idea only.
- **Snippet:** 3–10 lines of code (before → after when useful). Generic names (`User`, `Order`), never blanka classes, tables or data.
- **Image idea:** "code card" (snippet on a dark background, e.g. made with carbon.now.sh or ray.so) or a simple before/after.
- **Hashtags:** 3–5 (#Laravel #PHP #VueJS #ClaudeCode #WebDevelopment).
- **Post day + suggested time:** Mon–Fri, 20:00 PKT (evening reach).
- Confidentiality: nothing from the company — no names, quote codes, numbers, URLs or internal tool screenshots.

## 4. Deliver

- Save to `work-notes\personal-track\fb\<YYYY-MM-DD>-week.md` and append the 5 hooks with dates to `fb\log.md`.
- Page: one "This week's Facebook tips" page, morning-brief dashboard style, one card per day with copy-friendly caption + snippet blocks. Write with the Write tool; grep for `â`. Publish to `urls.json` key `fbTips` (create once, then update the same URL).
- Chat card via the Morning Brief webhook (`secrets\gchat-webhook.txt`, never print it, never send_message): header "5 Facebook tips ready — schedule them", one row per day with the hook, button "Open tips".
