# Routine schedules (backup)

The Claude desktop app keeps each routine's schedule outside its `SKILL.md`. This list keeps the schedules in the repo too, so on a new PC or a new Claude account every routine can be recreated: open Claude → Scheduled tasks → New, use the folder's `SKILL.md` as the prompt, and set the cron below. All times are local (PKT, Asia/Karachi).

Last synced: 2026-11-10.

| Routine | Cron | When | State |
|---|---|---|---|
| book-policy-failed-attachments-watch | `0 9,12,15,18 * * 1-5` | Mon–Fri 9:00, 12:00, 15:00, 18:00 | on |
| daily-dev-notes | `30 18 * * 1-5` | Mon–Fri 18:30 | on |
| dev-trends-digest | `0 17 * * 5` | Fri 17:00 | on |
| linkedin-draft | `30 9 * * 2` | **Tue 9:30** (was Mon/Wed/Fri until 2026-11-10) | paused |
| linkedin-reminder | `0 11 * * 2` | **Tue 11:00** (was Mon/Wed/Fri until 2026-11-10) | on |
| usage-weekly-review | `30 9,16 * * *` | Daily 9:30 and 16:30 | on |
| fb-tips-batch | `0 18 * * 0` | Sun 18:00 | paused (content pack covers Facebook until 2027-02-26) |
| chat-mentions-watch | `*/3 9-18 * * 1-5` | Mon–Fri every 3 min, 9:00–18:59 | paused |
| chat-mentions-watch-2 | `*/8 9-18 * * 1-5` | Mon–Fri every 8 min (testing) | not in the local scheduler |
| morning-brief | `0 9 * * 1-5` | Weekdays 9:00 | not in the local scheduler |
| myalfred-queue-status-30m | `*/30 * * * *` | Every 30 min, ended 2026-10-31 | not in the local scheduler |
| myalfred-queue-status-3h | `0 */3 * * *` | Every 3 hours | not in the local scheduler |

"Not in the local scheduler" means the desktop app's list didn't show it on 2026-11-10 (removed, or run elsewhere). The cron there comes from the routine's description. Check it before recreating.

After recreating a routine, click **Run now** once so its tools are pre-approved.
