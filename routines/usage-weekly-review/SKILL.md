---
name: usage-weekly-review
description: Daily 09:30 and 16:30: review the last 24h of Claude Code usage (+7-day trend), write 3–5 concrete token-saving actions to the usage dashboard, post one Morning Brief card. Read-only otherwise.
---

Run my Claude Code usage review by following the personal skill `usage-dashboard` (C:\Users\Muhammad Waris\.claude\skills\usage-dashboard\SKILL.md), section "Usage review", exactly.

Steps: run `node "C:/Users/Muhammad Waris/.claude/waris-claude-engine/usage-dashboard/server.js" --report 1` (last 24 h) and `--report 7` (trend); pick 3–5 concrete actions (highest token saving first, each naming the exact skill / plugin / rule / habit / script to change, with numbers from the report); write them to D:\Afia Insurance\Projects\Office\waris-claude-engine\usage-dashboard\data\improvements.json in the format the skill gives (write the file with the Write tool); then post ONE short card to my "Morning Brief" Google Chat space via the webhook URL in C:\Users\Muhammad Waris\.claude\secrets\gchat-webhook.txt (never print the URL; never use the Google Chat connector's send_message): last-24h tokens, prompts and working time, the action titles, and "Open dashboard: http://localhost:4317".

Change nothing else: do not edit skills, settings, CLAUDE.md or any repo. The review only lists actions, never applies them. Never send prompt text or transcript content anywhere except the short action titles on that card.