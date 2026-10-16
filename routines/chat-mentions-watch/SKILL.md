---
name: chat-mentions-watch
description: Mon–Fri 9:30 AM–7 PM PKT, every 30 min: new Google Chat mentions/DMs I haven't answered → posted to my "My Mentions" space. Read-only, never replies.
---

Follow the personal skill `chat-mentions-watch` (C:\Users\Muhammad Waris\.claude\skills\chat-mentions-watch\SKILL.md) exactly.

If today is Saturday or Sunday, or the time is before 9:30 AM or after 7:00 PM (Asia/Karachi), stop and do nothing.

STRICTLY READ-ONLY on Google Chat: never send, reply, react or mark anything read with the Google Chat connector. The only thing you may post is ONE message to my "My Mentions" space via the webhook in C:\Users\Muhammad Waris\.claude\secrets\gchat-mentions-webhook.txt (never print the URL), and only when there are NEW unanswered mentions/DMs since the last check (state file C:\Users\Muhammad Waris\.claude\secrets\mentions-state.json). If nothing new, post nothing. Never email anyone, never touch ClickUp or GitHub.