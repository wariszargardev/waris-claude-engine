---
name: chat-mentions-watch
description: Mon–Fri 9:30 AM–7 PM PKT, every 3 min: new Google Chat mentions/DMs I haven't answered, sorted, short drafts + fact-checked answer drafts → posted to my "My Mentions" space; asks added to my assistant to-do list. The run never sends.
---

Run the personal skill `chat-mentions-watch` (C:\Users\Muhammad Waris\.claude\skills\chat-mentions-watch\SKILL.md), "Steps" section only (including step 4b review-and-answer and step 7b to-do list). Never run its "Send a draft" or "Review a draft" sections.

If today is Saturday or Sunday, or the time is before 9:30 AM or after 7:00 PM (Asia/Karachi), stop and do nothing.

This run never sends, replies, reacts or marks read in Google Chat (neither the Chat connector nor the google-chat-waris server); its only post is the one webhook message the skill describes. Fact-checks are read-only: never change code, ClickUp, GitHub or deployments, never run prod SQL, never email anyone. The only files it writes are the skill's state file and ~/.claude/secrets/assistant-todo.json. If a step fails, note it in the post (or stop quietly if nothing can be read).