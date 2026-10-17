---
name: book-policy-failed-attachments
description: >-
  Pull PROD "Attachment(s) not accessible, book policy email NOT triggered" failures of SendBookPolicyDocumentsJob
  (IMCRM / blanka) from Axiom and return the FAILED documents only as exact JSON (with insurer code and
  advisor details), plus a short summary and ONE ready-to-send business email that covers every affected lead (each
  lead in its own block). Modes - pass one quote code (e.g. HEA-ANDV2HBE) for that lead; pass several quote codes
  for one combined business email; pass nothing (or "48h") for every failure of the last 48 hours; pass "watch"
  (used by the 3-hourly weekday routine: last 24h, Monday's first run since Friday 12:00 PKT) which posts the report
  to my "Morning Brief" Chat space via webhook. Use when I say "failed book policy emails", "attachment not
  accessible", "book policy email not triggered", "failed documents JSON", "message/email for business", or give
  quote code(s) and ask why the policy email did not go.
---

# Book Policy Failed Attachments (Axiom → JSON + summary + business email)

Read-only. Never re-trigger emails, never edit documents, never send email. The only post allowed is `watch` mode's
report to my own "Morning Brief" Chat space through its webhook (I forward the business email myself).

Output, in this order and nothing else:
1. One line: mode + count.
2. One ```json block — **failed attachments only**. Never include `checkedAttachments` / the documents that passed.
3. The **summary** (list / leads / watch only — see "Summary").
4. The **business email** (see below), ready to copy-paste — always ONE email, even for many leads.

Background on the job and the check: the `book-policy-documents-email` skill and `docs/Book-Policy-Documents-Email.md`
in blanka. Fixing / republishing a network list: the `health-network-list-update` skill.

## Arguments

| Input                                | Mode    | Window                                  |
| ------------------------------------ | ------- | --------------------------------------- |
| a quote code, e.g. `HEA-ANDV2HBE`    | `lead`  | last 30 days (widen to 90d if 0 rows)   |
| several codes (space/comma/newline)  | `leads` | last 30 days per code (widen to 90d)    |
| nothing, `48h`, or `<N>h` / `<N>d`   | `list`  | last 48h (or the given window)          |
| `watch`                              | `watch` | see "watch mode" (24h / since Friday)   |

Normalise codes to upper case. `leads` = run Query A once with `| where quote_code in (...)`, Query B/C/D/E once for
all codes, then output the `list` JSON shape with `"mode": "leads"` and one combined business email.

## Where the health `networkList` link comes from (blanka code)

The usual failure is `networkList` → HTTP 404. Use this when writing the reason:

1. `SendBookPolicyDocumentsJob` → `QuoteDocumentService::getHandBookDocuments($quote)` loads
   `$quote->policyWording` = rows of **`health_plan_policy_wording`** where `plan_id` = the quote's plan
   (`HealthQuote::policyWording()`). These rows are created/updated from **CMS** (plan → policy wordings).
2. A row is the Network List when its `text` is exactly `Network List` (`HealthPlanPolicyWording::isNetworkList()`),
   and only while `ENABLE_HEALTH_NETWORK_LIST_UPDATE` (application_storage) is on.
3. Its `link` is stored relative and made absolute with `AZURE_IM_STORAGE_URL` →
   `https://azstorinsurancemarketprd.blob.core.windows.net/policy-wordings/health/<file>`
   (`resolveAbsolutePolicyWordingLink()`).
4. `CentralService::emailDataExtend()` puts that URL in `networkList`; `BookPolicyAttachmentService` sends an HTTP HEAD;
   anything not 200 blocks the whole email and logs `Attachment(s) not accessible`.

So a 404 means: **the plan's Network List row in CMS points to a file that does not exist in the
`policy-wordings` storage container** (file deleted/renamed, or a new version uploaded under a different name while the
old row still points to the old name). Fix = re-upload / re-publish the plan's Network List in CMS, then re-send.

Not related: the log `Trying health network doc … NEXTCARE_HEALTH_DOC` is `getAppDownloadLink()` (the app-download
link built from `application_storage`), not the network list attachment.

Other failure types:
- `azure_storage` document failed → that quote document is missing in the private store; the advisor must re-upload it on the lead.
- `handBookDocuments` / other policy-wording URL 404 → same as network list, but the plan's handbook / TOB file in CMS.

## Data source

Run the Axiom queries through the `axiom-investigator` subagent (Sonnet, read-only): give it the window, the queries below and the fields needed; it returns the rows/counts. The lead builds the JSON, summary and email.

Axiom MCP (`queryDataset`), dataset `insurancemarket_prod`. Always `truncate: false`; set the window with `startTime`.

### Query A — failures

```apl
['insurancemarket_prod']
| where message has_cs "SendBookPolicyDocumentsJob" and message has_cs "Attachment(s) not accessible"
| extend quote_code = extract("Quote Code : ([A-Z]+-[A-Z0-9]+)", 1, message)
| extend x = parse_json(tostring(extra))
| project _time, quote_code, total_checked = x["totalChecked"], failed = x["failedAttachments"],
          trace_id = ['context.trace_id'], is_console = ['context.is_console_command']
| order by _time desc
```

`lead` mode: add `| where message has_cs "<CODE>"` after the first `where`.

### Query B — did the email go later? (lead mode only)

```apl
['insurancemarket_prod']
| where message has_cs "<CODE>" and message has_cs "SendBookPolicyDocumentsJob"
| project _time, level, message
| order by _time asc
```

`email_sent_later` = any line after the last failure has `All attachments accessible` or a WebEngage/Brevo `Response`.
`already_sent_tag` = a line says `skipped … as email already sent`. Do not output the timeline itself.

### Query C — advisor info (every mode)

`<UUIDS>` = the quote codes without the LOB prefix (`HEA-ANDV2HBE` → `ANDV2HBE`). One query for all leads; window `now-90d`.

```apl
['insurancemarket_prod']
| where message startswith "WebEngage RefID"
| extend uuid = extract("RefID: ([A-Z0-9]+)", 1, message)
| where uuid in ("<UUID1>", "<UUID2>")
| extend e = tostring(extra)
| where e contains "advisorEmail"
| extend advisor_name = extract("\"advisorName\":\"([^\"]*)\"", 1, e),
         advisor_email = extract("\"advisorEmail\":\"([^\"]*)\"", 1, e),
         advisor_code = extract("\"employee_code\":\"([^\"]*)\"", 1, e),
         advisor_mobile = extract("\"advisorDetails\":\\{[^}]*\"mobile_no\":\"([^\"]*)\"", 1, e)
| summarize arg_max(_time, advisor_name, advisor_email, advisor_code, advisor_mobile) by uuid
```

### Query D — insurer code (every mode, same `<UUIDS>`, `now-90d`)

```apl
['insurancemarket_prod']
| where message startswith "Provider code extraction result"
| extend uuid = extract("Quote UUID: ([A-Z0-9]+)", 1, message)
| where uuid in ("<UUID1>", "<UUID2>")
| extend provider_code = tostring(parse_json(tostring(extra))["provider_code"])
| where isnotempty(provider_code)
| summarize arg_max(_time, provider_code) by uuid
```

### Query C2 — advisor fallback (when Query C returns nothing for a lead, `now-30d`)

```apl
['insurancemarket_prod']
| extend s = strcat(message, " ", tostring(extra))
| where s has_cs "<UUID1>" or s has_cs "<UUID2>"
| extend uuid = extract("(<UUID1>|<UUID2>)", 1, s),
         advisor_email = extract("(?i)\"advisor_?email\":\"([^\"]+@[^\"]+)\"", 1, s),
         advisor_name = extract("(?i)\"advisor_?name\":\"([^\"]+)\"", 1, s)
| where isnotempty(advisor_email) or isnotempty(advisor_name)
| summarize arg_max(_time, advisor_name, advisor_email) by uuid
```

### Query F — plan name + insurer name (every mode, same `<UUIDS>`, `now-60d`)

The Node rating log carries the selected plan (`mafLink` has `refId=<UUID>`):

```apl
['insurancemarket_prod']
| where message startswith "health - calculateRating" and message contains "currentPlanData"
| extend uuid = extract("refId=([A-Z0-9]{8})", 1, message)
| where uuid in ("<UUID1>", "<UUID2>")
| extend plan_id = extract("currentPlanData - \\{\"id\":([0-9]+)", 1, message),
         plan_code = extract("\"planCode\":\"([^\"]*)\"", 1, message),
         plan_name = extract("\"planCode\":\"[^\"]*\",\"name\":\"([^\"]*)\"", 1, message),
         insurer_name = extract("\"providerName\":\"([^\"]*)\"", 1, message),
         eligibility = extract("\"eligibilityName\":\"([^\"]*)\"", 1, message)
| summarize arg_max(_time, plan_id, plan_code, plan_name, insurer_name, eligibility) by uuid
```

Fill `plan` = `"<plan_name> (<plan_code>, id <plan_id>)"` and `insurer_name`. Always show the plan in the summary and
email, and add a **"Plans with missing documents"** list (plan → missing file → leads) — business asks for it.

### Query E — sent later? (list / leads / watch, one query for all codes, window = from the oldest failure to now)

```apl
['insurancemarket_prod']
| where message has_cs "SendBookPolicyDocumentsJob"
| extend quote_code = extract("Quote Code : ([A-Z]+-[A-Z0-9]+)", 1, message)
| where quote_code in ("<CODE1>", "<CODE2>")
| where message has_cs "All attachments accessible" or message has_cs "Response" or message has_cs "already sent"
| summarize last_ok = max(_time) by quote_code
```

A lead whose `last_ok` is after its last failure → `email_sent_later: true`. Keep it in the JSON but leave it out of
the summary's "still not sent" list and the business email; show it once in the summary as "✅ sent later".

`provider_code` → `insurer_code` (latest only; older rows can belong to an earlier selected plan). Output the code
as logged (e.g. `HYH`, `TE`, `OI2`); do not map it to a name. Never include the advisor's manager.

Plan name comes from Query F (null only if Query F has no row). Take the `network` from the failed network-list file name
(`1789127976NEXTCARE_RN3.xlsx` → `NEXTCARE RN3`). Any field not found → `null`; never guess.

## JSON (exact shape)

Times: UTC → GST (UTC+4), `YYYY-MM-DD HH:mm:ss`. Keep each failed attachment object exactly as logged
(`name`, `url`, `checkedBy`, `status`, `accessible`, `error`); unescape `\/`. `file` = last path segment of the URL.

### `lead`

```json
{
  "mode": "lead",
  "environment": "production",
  "quote_code": "HEA-ANDV2HBE",
  "lob": "health",
  "failure_count": 1,
  "last_failure_gst": "2026-10-15 09:17:43",
  "trace_id": "29272c02-aacf-40a3-b8ee-983072b7cfb5",
  "email_sent_later": false,
  "already_sent_tag": false,
  "lead": {
    "insurer_code": "<from Query D>",
    "plan": null,
    "network": "NEXTCARE RN3"
  },
  "advisor": {
    "name": "<from Query C>",
    "email": "<from Query C>",
    "employee_code": "<from Query C>",
    "mobile": "<from Query C>"
  },
  "failed_attachments": [
    { "name": "networkList", "file": "1789127976NEXTCARE_RN3.xlsx", "url": "https://azstorinsurancemarketprd.blob.core.windows.net/policy-wordings/health/1789127976NEXTCARE_RN3.xlsx", "checkedBy": "http", "status": 404, "accessible": false, "error": null }
  ],
  "reason": "The plan's Network List in CMS points to a file that does not exist in storage (404).",
  "action": "Re-upload / re-publish the plan's Network List in CMS, then we re-send the policy email (policy:bulk-send-documents)."
}
```

If the code failed more than once, `failed_attachments` is the de-duplicated union (by `url`); `failure_count` counts runs.
0 rows in 90d → `{"mode":"lead","quote_code":"<CODE>","failure_count":0,"failed_attachments":[],"email_sent_later":<from Query B>}`
and no business message.

### `list` / `leads` / `watch`

```json
{
  "mode": "list",
  "environment": "production",
  "window": { "from": "<ISO UTC>", "to": "<ISO UTC>" },
  "total_failures": 8,
  "unique_leads": 8,
  "by_broken_file": [
    { "name": "networkList", "status": 404, "file": "1789820052International_Network_List_SEPTEMBER_2026.xlsx", "url": "https://...", "quote_codes": ["HEA-7MGK8N4J", "HEA-YB8J37QE"] }
  ],
  "failures": [
    { "time_gst": "2026-10-15 09:17:43", "quote_code": "HEA-ANDV2HBE", "trace_id": "...", "is_new": true, "email_sent_later": false,
      "insurer_code": "...", "network": "NEXTCARE RN3",
      "advisor": { "name": "...", "email": "...", "employee_code": "...", "mobile": "..." },
      "failed_attachments": [ { "name": "networkList", "file": "...", "url": "...", "checkedBy": "http", "status": 404, "accessible": false, "error": null } ] }
  ]
}
```

## Writing rules (summary + business email)

Plain business language, no code/class names, Google Chat formatting (`*bold*`, `_italic_`). Only the failed
file(s) — never list documents that passed. Use the file name to say which network/handbook it is
(e.g. `NEXTCARE_RN3.xlsx` → "NEXTCARE RN3 network list"), and always give the **complete failed URL** on its own
`🔗` line (unescaped, no SAS token). Never include customer name, email or mobile — anywhere in the JSON, summary or
email. Leave out any value that is `null` (never print "null"). Times in GST, `15 Oct, 09:17 GST`.

For a non-network-list failure, change *Why* / *Action* to match (missing quote document → "the advisor must
re-upload <document> on the lead"; handbook/TOB → "re-upload the plan's <document> in CMS").

## Summary (list / leads / watch)

Short, scannable, one line per lead that is **still not sent**, newest first. `🆕` marks a lead not reported in an
earlier watch run (watch only).

```
📊 *Book policy emails NOT sent — 5 leads* · <window label, e.g. "last 24h" / "since Fri 12:00 PKT">
✅ Sent later: 1 (HEA-XXXX) · 📄 Broken files: 3

1. 🆕 *HEA-7MGK8N4J* · Insurer HYH · 📄 International Network List – Sep 2026 · 🧑‍💼 Ali Raza · 15 Oct, 09:17 GST
2. *HEA-75BE4J8Y* · Insurer TE · 📄 NEXTCARE PCP-AUH network list · 🧑‍💼 Sara Khan · 14 Oct, 19:04 GST
…
```

## Business email (always ONE email, one block per lead)

Every mode ends with one email I can forward to the business team. **Each lead gets its own separate block**
(divider line between leads) so each failure reads on its own; inside a block list every failed document on its own
line with its status. Close with one combined action list. Template:

```
*Subject:* Health policy documents email NOT sent — 3 customers

Hi team, the policy documents email was *not sent* to these Health customers because the plan's document in CMS
is missing in storage (404).

*Plans with missing documents*
• Takaful Emarat — Iridium (TE_NC_IRIDIUM) → Network List `NEXTCARE_RN2.xlsx` — HEA-JU9W8W5K, HEA-DY58BEQJ
• …

*Per lead*
*1. HEA-7MGK8N4J* — TE · Iridium · NEXTCARE RN2 network list · 🧑‍💼 Ali Raza · 🕒 15 Oct, 09:17 GST
🔗 <full missing URL>
*2. …*

✅ *Action needed:* re-upload and publish the files above in CMS (each file once), then reply — we will re-send
the policy emails.
```

Single lead (`lead` mode): same email with one block and "1 customer" in the subject. 0 rows in 90d → no email.

## `watch` mode (3-hourly weekday routine)

Runs Mon–Fri at 09:00, 12:00, 15:00 and 18:00 PKT (Asia/Karachi, UTC+5).

1. **Window** (compute in PKT):
   - Monday's first run (before 12:00 PKT) → from **Friday 12:00 PKT** to now (covers Fri afternoon, Sat, Sun).
   - Every other run (Tue–Fri, and Monday from 12:00) → **last 24 hours**.
2. Read `~/.claude/scheduled-tasks/book-policy-failed-attachments-watch/seen.json`
   (`{"trace_ids": [...], "reported_codes": [...], "last_run": "<ISO>"}`; missing = empty).
3. Query A with that window. Then Query C, D (advisor + insurer, `now-90d`) and Query E (sent later) once for all codes.
   **Do not drop** rows already seen — the report always covers the full window; just mark leads whose code is not in
   `reported_codes` with 🆕.
4. No failures still unsent in the window → post nothing; save a one-line run note and update `last_run`. Stop.
5. Otherwise build: the `list` JSON with `"mode": "watch"`, the **Summary**, and the **Business email**.
6. **Dashboard page.** Build one HTML page in the morning-brief dashboard style (template
   `~/.claude/skills/morning-brief/dashboard-template.html`: header with status pills, count strip, cards with coloured
   left status bars): title "Book policy emails", subtitle = window; pills (🔴 N not sent · ✅ N sent later · 📄 N broken
   files); a **Summary** card (one row per unsent lead, 🆕 marked); then **one separate card per lead** (insurer, network,
   advisor, blocked time, each failed document with status + full link); then the **Business email** card with a
   "Copy email" button (plain text in a `<pre>`). Write it to
   `~/.claude/scheduled-tasks/book-policy-failed-attachments-watch/dashboard.html` and publish it with the Artifact tool
   (same file path every run → same URL; first publish icon "warning"). Keep the URL in `seen.json` as `dashboard_url`.
7. **Post to Chat (unread)** via the "Morning Brief" webhook in `~/.claude/secrets/gchat-webhook.txt` (never print or
   log the URL; never use the Google Chat connector's send_message — it posts as me and shows as read). ONE cardsV2
   message: header "Book policy emails NOT sent" (imageUrl
   `https://fonts.gstatic.com/s/i/short-term/release/googlesymbols/description/default/48px.svg`, CIRCLE), subtitle =
   window; Status pill (`<font color="#b3261e"><b>🔴 N not sent</b></font>`); one decoratedText per unsent lead
   (topLabel = time GST · insurer, text = `<b>quote code</b> · failed document · advisor`, 🆕 if new, wrapText true;
   section collapsible with `uncollapsibleWidgetsCount` 3); a `buttonList` button "Open full report + business email" →
   the dashboard URL. The JSON is NOT posted, only saved. Write the card JSON (UTF-8) with Python if available,
   otherwise with the Write tool; `curl -s -o resp -w "%{http_code}" -X POST -H 'Content-Type: application/json; charset=UTF-8' --data-binary @<file> "<webhook>"`.
   Expect 200; on 400 read the response, fix and retry once. If the Artifact publish failed, post the Summary and the
   Business email as plain `{"text": ...}` messages instead. Still failing → PushNotification "Book policy watch: webhook failed".
8. Save JSON, summary and email to `~/.claude/scheduled-tasks/book-policy-failed-attachments-watch/runs/<YYYY-MM-DD_HHmm>.json` / `.txt`.
9. Write state back: add new trace ids (keep last 500), add reported quote codes (keep last 500), set `last_run`, `dashboard_url`.

## Debugging notes

- 0 rows but an alert fired: check `insurancemarket_dev` or widen the window.
- The Google Chat alert "🚨 Triggered: IMCRM PROD Errors" fires on the same log line; its trace id = `trace_id` here.
