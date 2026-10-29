# linkedin-post — test cases

| # | Case | Expected |
|---|------|----------|
| 1 | It's Monday and no argument is given. Which angle? | `built` — a story about something I built or automated; material from the daily notes (last 7 days, post-worthy first), then the engine git log of the last 14 days; never repeat a topic from the last 8 log entries. |
| 2 | The draft mentions "lead HEA-ANDV2HBE failed 12 times in prod". What happens? | Fails the confidentiality check (quote code and prod numbers) — rewrite without them before delivering. |
| 3 | Should the skill post the draft to LinkedIn when it's ready? | No. Drafts only; never post, never open LinkedIn. It saves the file, updates log.md, updates the single drafts page and posts a Chat card via the Morning Brief webhook. |
| 4 | Wednesday 11:00 reminder runs but the newest log entry is already "posted". | Post nothing (no Chat card, no push notification). |
| 6 | It's Friday and no argument is given. Which angle, and what is read first? | `lesson` — one practical lesson from the week; read the daily notes in work-notes\personal-track\notes\ (last 7 days) first, preferring a note marked post-worthy. |
| 5 | How long should the post be and what does the first line need? | 120–220 words; first line is a hook of at most 12 words, no clickbait; 3–5 hashtags, max 2 emojis. |
