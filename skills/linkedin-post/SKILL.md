---
name: linkedin-post
description: Draft my weekly Tuesday LinkedIn work-story post from what I actually built and learned — my daily dev notes, waris-claude-engine commits, shipped blanka work, and the latest dev-trends digest. Tuesday is the story slot; Wed and Thu LinkedIn posts come from the Build Real Code content pack (carousels), not from this skill. Default angle "built" (a story about something I built), switching to "lesson" when the newest log entry was already "built"; "learned" only when asked. Writes one ready-to-paste draft plus 2 alternative hooks, 3 hashtags and an image idea, checks it against the confidentiality rules, never posts. Publishes a drafts page and a Chat card; the Tuesday 11:00 reminder points to it. Use when I say "linkedin post", "draft a post", "post idea", "tuesday story", or when the Tuesday routine fires.
argument-hint: [built|learned|lesson|remind] [topic]
---

# LinkedIn post drafts

I post myself. Never post, never open LinkedIn, never message anyone. Drafts only.

## 1. Pick the angle

One post a week, for **Tuesday**. Wed and Thu LinkedIn posts come from the content pack (`D:\Social Media\content-pack`, carousels), so never draft a tip post here and never repeat that week's pack topics (see `schedule.md`).

- Default (no argument) → `built`, unless the newest entry in `log.md` is already `built`; then `lesson`.
- Argument `built` → a story about something I built or automated, with a concrete result (time saved, failures removed, before → after).
- Argument `lesson` → one practical lesson from the week (a mistake I fixed, a rule I added, a tool tip), short and concrete.
- Argument `learned` (only when I ask) → a trend + my practical take.
- A topic given → use it.
- Never repeat a topic from the last 8 entries in `work-notes\personal-track\linkedin\log.md`.

## 2. Gather material (read-only)

- **First:** my daily notes in `work-notes\personal-track\notes\` (last 7 days, made by the `daily-dev-notes` skill). Prefer a note marked `post-worthy`.
- `git -C "D:\Afia Insurance\Projects\Office\waris-claude-engine" log --since="14 days ago" --oneline` — skills, hooks, routines I built.
- The latest digest in `work-notes\personal-track\dev-trends\` — its "Post ideas".
- The lesson pages in my learning track (Claude Code modules) for explanations I already understand.
- Shipped blanka work only at the level of "what problem, what approach, what result" — from my own memory notes and git log titles, not from code or data.

## 3. Confidentiality check (hard rules — fail = rewrite)

- No customer, lead, policy, insurer or advisor names; no quote codes, emails, phone numbers or amounts.
- No prod numbers, error counts, internal URLs, Chat space ids, webhook URLs, repo names of the company, or screenshots of internal tools.
- No colleague names without their OK (say "my team lead", "QA").
- The company can be named as "an insurtech in the UAE" unless I say otherwise.
- Nothing that sounds like a security weakness (e.g. "our branches weren't protected").

## 4. Write

- 120–220 words. First line = hook (max 12 words, no clickbait). Short paragraphs, one idea.
- Structure: problem I had → what I did (concrete: "a hook that blocks pushes to develop") → result in plain words → one lesson or question to the reader.
- My voice: plain, practical, first person, no buzzword soup, max 2 emojis, no "🚀 Excited to announce".
- Exactly 3 hashtags (e.g. #Laravel #ClaudeCode #SoftwareEngineering).
- End with a specific question, not a generic "thoughts?". Add a posting note: post 10:00 AM PKT, post once, don't edit in the first hour, reply to every comment in the first hour.
- Also give: 2 alternative hooks, and 1 image idea (a simple diagram or a before/after I can make myself).

## 5. Deliver

- Save to `work-notes\personal-track\linkedin\<YYYY-MM-DD>-<slug>.md` (status: draft) and add one line to `log.md`: date, angle, topic, file.
- Drafts page: one page for all drafts, newest first, each with the post text in a copy-friendly block, hooks, hashtags, image idea and a "Posted? mark in log.md" note. Morning-brief dashboard style; write with the Write tool; grep for `â`. Publish to `urls.json` key `linkedin` (create once, then always update the same URL).
- Chat card via the Morning Brief webhook (`secrets\gchat-webhook.txt`, never print it): header "LinkedIn draft ready — <angle>", the hook line, word count, button "Open draft" to the page.

## Reminder mode (`remind`)

Used by the Tuesday 11:00 routine: look only at the **newest entry** (last line) in `log.md`; older drafts never count. If that entry's status is draft, post a Chat card "Post today: <hook>" with the "Open draft" button and send a push notification "LinkedIn: post today's draft". If the newest entry is posted (or the log is empty), post nothing at all. When I say "posted <slug>", set its status to posted in `log.md`.
