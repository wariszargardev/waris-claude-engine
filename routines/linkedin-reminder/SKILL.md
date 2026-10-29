---
name: linkedin-reminder
description: Mon/Wed/Fri 11:00 PKT: if today's LinkedIn draft is still unposted, one Chat card "Post today" + push notification.
---

Run the personal skill `linkedin-post` (C:\Users\Muhammad Waris\.claude\skills\linkedin-post\SKILL.md) in its "Reminder mode (remind)" only. Read D:\Afia Insurance\Projects\Office\waris-claude-engine\work-notes\personal-track\linkedin\log.md: if the newest entry has status draft, post ONE card "Post today: <hook>" with an "Open draft" button (page URL from urls.json key linkedin) to my "Morning Brief" Chat space via the webhook in C:\Users\Muhammad Waris\.claude\secrets\gchat-webhook.txt (never print the URL; never use send_message), and send a push notification "LinkedIn: post today's draft". If there is no unposted draft, do nothing. Never post to LinkedIn.