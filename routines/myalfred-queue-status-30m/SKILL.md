---
name: myalfred-queue-status-30m
description: Every 30 min until 31 Oct 2026 (PKT): myAlfred queue + welcome email prod status from Axiom, posted as a card to my Google Chat via webhook. Read-only.
---

Post a short status card for the IMCRM (blanka) PROD myAlfred queue + welcome email flow, covering the LAST 30 MINUTES.

## Date guard
Timezone: Asia/Karachi (PKT). If now is after 2026-10-31 23:59 PKT: call the scheduled-tasks tool `update_scheduled_task` with taskId `myalfred-queue-status-30m`, enabled=false, then stop. Post nothing. (The 3-hourly task `myalfred-queue-status-3h` takes over from 1 Nov.)

## Data (Axiom, read-only)
Use the Axiom connector tool `queryDataset` (tool name ends in `__queryDataset`). Dataset: `insurancemarket_prod`. Window: startTime = now − 30 min, endTime = now (ISO UTC). The log text is in field `message`; extra data is in `extra` / `context`. If a query errors on a field name, call `getDatasetFields` once and adapt.
Background on the flow and its log lines: personal skill `myalfred-queue-integration` (C:\Users\Muhammad Waris\.claude\skills\myalfred-queue-integration\SKILL.md).

Get these counts (one summarize query by `message` is fine, then add the specific ones):
1. Sent: `message == "NotifyMyAlfredCompletionQueue - sent"`. HTTP status split: `extend s = extract(@"""status""\s*:\s*(\d+)", 1, strcat(tostring(extra), tostring(context))) | summarize count() by s`.
2. Token failures: message contains `MyAlfredQueueTokenService - failed to obtain token`.
3. Callbacks: `ProcessMyAlfredCompletionCallbackJob - received`, `- customer found`, `- customer not found`, `- unrecognized code`.
4. Welcome email requests: message contains `MyAlfred Welcome Email - Request received`.
5. Welcome emails sent: MAWelcomeJob "Email Sent" lines. Match with message contains `MAWelcomeJob` or `Email Sent`, then check you got the right lines.
6. Problems: error/warning-level logs, or messages, that contain any of these: `MyAlfred`, `myalfred`, `MAWelcomeJob`, `ProcessMyAlfred`, `NotifyMyAlfred`, `ExtendCustomerSubscriptionViaSQS`, `__PHP_Incomplete_Class`, `incomplete object`. Count them, and keep up to 3 sample messages (strip any emails/PII; show just the error text + time).
7. Latest event time of the whole flow.

## Status rule
- 🟢 Healthy: no errors, no token failures, every sent got HTTP 200, and welcome emails sent = welcome requests (±1 for timing).
- 🟡 Check: 0 activity in the window, or a small mismatch (callbacks vs sent off by more than 10%, or emails sent < requests), or any warning/unrecognized code.
- 🔴 Issue: any error, token failure, non-200 status, incomplete-object error, or legacy `ExtendCustomerSubscriptionViaSQS` log.

## Delivery: one Google Chat card via webhook
Webhook URL: read C:\Users\Muhammad Waris\.claude\secrets\gchat-myalfred-webhook.txt. If that file doesn't exist, use C:\Users\Muhammad Waris\.claude\secrets\gchat-webhook.txt. Never print the URL. POST JSON (Content-Type: application/json; charset=UTF-8), with curl or PowerShell Invoke-RestMethod. Build the JSON with UTF-8 so the emoji don't break (PowerShell 5.1: `[System.Text.Encoding]::UTF8.GetBytes($json)` as the body).

Use `cardsV2` so it reads like a clean table on the phone:
- header: title "myAlfred queue · PROD", subtitle "<status emoji> <Healthy|Check|Issue> · <HH:mm>–<HH:mm> PKT, <DD Mon>".
- Section 1 "Flow (last 30 min)": one `decoratedText` row per step, `topLabel` = step name, `text` = "<b>count</b> · result", `startIcon` with a knownIcon (e.g. EMAIL, DESCRIPTION, PERSON, CONFIRMATION_NUMBER_ICON). Rows:
  - "Sent to myAlfred": "<b>132</b> · all HTTP 200, no token errors" (or the status split if not all 200)
  - "Callbacks received": "<b>132</b> · 28 found, 104 not found"
  - "Welcome email requests": "<b>104</b> · one per 'not found'" (or the mismatch)
  - "Welcome emails sent": "<b>104</b> · all sent" (or "<b>100</b> of 104")
- Section 2 "Health": one row each for Errors (count), Unrecognized codes (count), Old flow logs (count), Latest activity (HH:mm PKT). Colour numbers above 0 red with <font color="#d93025">.
- Section 3 only when there are problems: "What went wrong", with up to 3 short samples (time + error text), plus one line on what to check next.
- Keep the wording short and plain. No long paragraphs.
Also include a plain `text` fallback field with the same numbers in 1–2 lines.

If the webhook post fails, retry once. If it still fails, send a push notification "myAlfred status: webhook failed".
If the status is 🔴, also send a push notification: "myAlfred PROD: <one-line problem>".

## Hard rules
READ-ONLY everywhere: only Axiom queries and the one webhook post. Never send messages with the Google Chat connector, never email anyone, never touch ClickUp, GitHub, code, queues or the DB, never retry or resend jobs.