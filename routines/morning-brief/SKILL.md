---
name: morning-brief
description: Weekdays 9:00 (or soon after the laptop opens): read-only morning brief posted to my Google Chat space "Morning Brief", plus 5-minute meeting reminders there. No Saturday/Sunday.
---

Run my morning brief by following the personal skill `morning-brief` (C:\Users\Muhammad Waris\.claude\skills\morning-brief\SKILL.md) exactly.

First: if today is Saturday or Sunday (Asia/Karachi), stop and do nothing. If a file C:\Users\Muhammad Waris\.claude\secrets\brief-sent-<YYYY-MM-DD>.flag exists for today (PKT), skip the brief and only set the meeting reminders; after posting today's brief, create that flag file (and delete flag files older than 7 days).

Delivery: post to my Google Chat space via the webhook in C:\Users\Muhammad Waris\.claude\secrets\gchat-webhook.txt (never print the URL) — 6 separate messages, never mixed: Summary + Top 3; Needs my reply in ClickUp (new assigned tasks, @mentions/questions I haven't answered, issue found, new requirement; on Monday look back since Friday 09:00); Google Chat waiting on me (skill section 1d); My tasks by status with days in status (ignore "comms. sent!!! done!"); Meetings today in PKT; Blanka branches not merged to develop yet + branches with no PR (local repo D:\Afia Insurance\Projects\Office\blanka; exclude main, develop, *-env-deployment, names with test/uat/deployment, and feat/health-renewal-MVP-86ew63z6m). No Axiom. Only if the webhook fails, fall back to ONE email to muhammad.waris@myalfred.com under the Gmail label "Morning Brief".

After posting the brief: for each blanka branch with NO PR yet, create it with the personal skill `create-pr` (C:\Users\Muhammad Waris\.claude\skills\create-pr\SKILL.md) — normal mode: `feat/…` and `fix/…` → develop, `hotfix/…` → main. Skip and only report a branch when its worktree has uncommitted changes, it has 0 commits ahead of its base, or its last commit is under 2 hours old. One at a time; a failure doesn't stop the others. Then post one extra message "🌿 PRs created" with the links, base, label status and skipped branches + reason. NEVER merge any PR.

Meeting reminders: one-time `meeting-prep-<eventId>` scheduled tasks 5 minutes before each of today's remaining meetings; each posts a ⏰ message (time PKT, organizer, who's in it, Meet link, agenda in 3-5 bullets) to the same Chat space via the webhook and sends a push notification.

Everything else is READ-ONLY: never merge any PR; never change any ClickUp task; never accept/decline invites; never send Google Chat messages with the Chat connector (only the webhooks post to my own spaces); never react to or mark messages read; never create drafts; never email anyone else. If one part fails, note it in that section and continue. End with one push notification "Morning brief posted".