---
name: routines-post-unread-via-webhook
description: "Every routine (local scheduled task or cloud RemoteTrigger) posting to Waris's Google Chat spaces must use the incoming webhook so posts arrive UNREAD — never the Chat connector send_message"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 829815a9-28bc-49d0-8e8d-d1b8d255e212
  modified: 2026-10-15T07:04:40.212Z
---

Any routine I create or edit that posts to Waris's own Chat spaces (e.g. "Morning Brief" spaces/AAQArS9K9hQ) must post via that space's incoming webhook, never the Google Chat connector `send_message`.

**Why:** `send_message` posts as Waris himself (sender HUMAN), so Chat shows it as already read. Webhook posts come from the "Claude brief" app (sender APP) and stay unread, which he wants (asked 2026-10-15).

**How to apply:**
- Local scheduled tasks: read the URL from `~/.claude/secrets/gchat-webhook.txt` (Morning Brief), `gchat-mentions-webhook.txt` (My Mentions), `gchat-myalfred-webhook.txt`; never print it.
- Cloud routines (RemoteTrigger) can't read local files, so the webhook URL goes in the routine prompt's Delivery section, with `send_message` only as a fallback if the webhook is unreachable.
- POST `{"text": ...}` UTF-8 JSON with curl, expect 200, retry once.
- On 2026-10-15 switched cloud routines "ClickUp My Tasks Digest" (trig_012cnqcYXNRqdhhX1ZkRK2DM) and "My Alfred Welcome Email" (trig_01MmAWYWH9X5C6tER79L2FMy) to the webhook.
- On 2026-10-27, after ~2 weeks of clean runs, the hourly "My Alfred Welcome Email" (trig_01MmAWYWH9X5C6tER79L2FMy) was paused and replaced by "My Alfred Welcome Email (every 6h)" (trig_018D61g5Ed7iuwdyst6huUQn, `33 */6 * * *` UTC = 05:33/11:33/17:33/23:33 PKT, same webhook card, "6-hour report"). Waris will review again later and may widen it further. The local `myalfred-queue-status-30m` / `-3h` scheduled-task folders are leftovers and not registered.

Related: [[google-chat-thread-links]], [[report-design-preference]]
