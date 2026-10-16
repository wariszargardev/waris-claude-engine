---
name: myalfred-queue-status-3h
description: Every 3 hours: myAlfred queue + welcome email prod status from Axiom, with every error/failure listed with lookup details, posted as a card to my Google Chat via webhook. Read-only.
---

Post a DETAILED status card for the IMCRM (blanka) PROD myAlfred queue + welcome email flow, covering the LAST 3 HOURS. Most important: list every error/failure with enough detail for me to look it up.

## Data (Axiom, read-only)
Use the Axiom connector tool `queryDataset` (tool name ends in `__queryDataset`). Dataset: `insurancemarket_prod`. Window: startTime = now − 3 h, endTime = now (ISO UTC). Timezone for display: Asia/Karachi (PKT). The log text is in field `message`; extra data is in `extra` / `context`. If a query errors on a field name, call `getDatasetFields` once and adapt.
Background on the flow and its log lines: personal skill `myalfred-queue-integration` (C:\Users\Muhammad Waris\.claude\skills\myalfred-queue-integration\SKILL.md).

Counts:
1. Sent: `message == "NotifyMyAlfredCompletionQueue - sent"`. HTTP status split: `extend s = extract(@"""status""\s*:\s*(\d+)", 1, strcat(tostring(extra), tostring(context))) | summarize count() by s`.
2. Token failures: message contains `MyAlfredQueueTokenService - failed to obtain token`.
3. Callbacks: `ProcessMyAlfredCompletionCallbackJob - received`, `- customer found`, `- customer not found`, `- unrecognized code`.
4. Welcome email requests: message contains `MyAlfred Welcome Email - Request received`.
5. Welcome emails sent: MAWelcomeJob "Email Sent" lines. Match with message contains `MAWelcomeJob` or `Email Sent`, then check you got the right lines.
6. Hourly breakdown: sent / callbacks / emails sent per hour (`bin(_time, 1h)`).
7. Latest event time of the whole flow.

## Errors and failures (the main part)
Find EVERY problem event in the window:
- error/warning-level logs, or messages, containing any of: `MyAlfred`, `myalfred`, `MAWelcomeJob`, `ProcessMyAlfred`, `NotifyMyAlfred`, `MyAlfredQueueTokenService`, `ExtendCustomerSubscriptionViaSQS`, `__PHP_Incomplete_Class`, `incomplete object`, `CustomerNotFoundForWelcomeEmailException`;
- failed-job logs for these job classes;
- `NotifyMyAlfredCompletionQueue - sent` with a non-200 status;
- `- unrecognized code` callbacks;
- welcome email requests with no matching "Email Sent" (match on email/customer id/referenceId when the fields allow it).
For each problem, pull these from `message`, `extra`, `context` (and `exception` / `trace` if present): time (PKT), job/class, error text (first line, max ~150 chars), exception class, file:line if logged, and lookup ids: referenceId, customer id, quote/lead code or uuid, event key / reference type, job uuid, and the customer email. Mask the email like `ab***@domain.com`.
Group identical errors: show the count, first–last time, and up to 5 example rows of ids per group.

## Status rule
- 🟢 Healthy: no errors, no token failures, every sent got HTTP 200, and welcome emails sent = welcome requests (±1 for timing).
- 🟡 Check: 0 activity in the window, or a small mismatch (callbacks vs sent off by more than 10%, or emails sent < requests), or any warning/unrecognized code.
- 🔴 Issue: any error, token failure, non-200 status, incomplete-object error, or legacy `ExtendCustomerSubscriptionViaSQS` log.

## Delivery: one Google Chat card via webhook
Webhook URL: read C:\Users\Muhammad Waris\.claude\secrets\gchat-myalfred-webhook.txt. If that file doesn't exist, use C:\Users\Muhammad Waris\.claude\secrets\gchat-webhook.txt. Never print the URL. POST JSON (Content-Type: application/json; charset=UTF-8), with curl or PowerShell Invoke-RestMethod. Build the JSON with UTF-8 so the emoji don't break (PowerShell 5.1: `[System.Text.Encoding]::UTF8.GetBytes($json)` as the body).

Use `cardsV2` so it reads like a clean table on the phone:
- header: title "myAlfred queue · PROD · 3h report", subtitle "<status emoji> <Healthy|Check|Issue> · <HH:mm>–<HH:mm> PKT, <DD Mon>".
- Section "Flow (last 3 hours)": one `decoratedText` row per step, `topLabel` = step name, `text` = "<b>count</b> · result", with a knownIcon:
  - "Sent to myAlfred": "<b>N</b> · all HTTP 200, no token errors" (or the status split)
  - "Callbacks received": "<b>N</b> · X found, Y not found"
  - "Welcome email requests": "<b>N</b> · one per 'not found'" (or the mismatch)
  - "Welcome emails sent": "<b>N</b> · all sent" (or "<b>N</b> of M")
- Section "Health": Errors, Token failures, Unrecognized codes, Old flow logs, Emails not sent (each a count; numbers above 0 in red <font color="#d93025">), Latest activity (HH:mm PKT).
- Section "❌ Errors & failures — to look up" when there are any problems (put it right after the header if status is 🔴): one block per error group:
  - `topLabel`: "<count>× · <first>–<last> PKT · <job/class>"
  - `text`: "<b>error text</b>" + new line "exception · file:line"
  - then one line per example: "ref <referenceId> · cust <id> · <quote/lead code> · <masked email> · <HH:mm>"
  - end the section with one line "Check next: …" and one Axiom APL query I can paste to see the full rows (dataset `insurancemarket_prod`, filtered to these messages, same window).
  If more than 5 groups, show the top 5 by count and say "+N more groups".
- Section "Per hour": one row per hour, "HH:00 PKT · sent N · callbacks N · emails N".
- Short, plain wording. No long paragraphs.
Also include a plain `text` fallback field with the main numbers and the error count in 1–2 lines.

If the webhook post fails, retry once. If it still fails, send a push notification "myAlfred 3h status: webhook failed".
If the status is 🔴, also send a push notification: "myAlfred PROD: <N> errors — <top error, one line>".

## Hard rules
READ-ONLY everywhere: only Axiom queries and the one webhook post. Never send messages with the Google Chat connector, never email anyone, never touch ClickUp, GitHub, code, queues or the DB, never retry or resend jobs.