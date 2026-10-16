---
name: axiom-daily-report
description: Daily Axiom health report for my IMCRM (blanka) modules — document upload, payment, recommendation engine, book policy + policy document email, BOR/consent logs, MA welcome email and myAlfred SQS integration — across prod, UAT and test. Counts successes, failures and warnings per module per env, compares with the previous day, lists top error messages with sample quote codes, and saves it as a Gmail draft to me. Use when I say "axiom report", "daily log report", "check my modules in Axiom", or when the scheduled daily run fires.
argument-hint: [hours=24] [chat|draft]
---

# Axiom daily report

Read-only. Never change anything in Axiom. Default window: last 24h vs the 24h before. Default output: Gmail draft to me (`muhammad.waris@myalfred.com`); `chat` = print only.

## Where the logs are

| Env | Dataset | Filter |
|---|---|---|
| prod | `insurancemarket_prod` | `service == "IMCRM"` |
| uat | `insurancemarket_dev` | `service == "IMCRM" and environment == "uat"` |
| test | `insurancemarket_dev` | `service == "IMCRM" and environment == "test"` |

Failure = `level in ("ERROR","CRITICAL","ALERT","EMERGENCY")`. Warning = `level == "WARNING"`. Feature tag = `tostring(['context.feature'])`.

## My modules

| Module | Envs | Match | Success marker (INFO message contains) | Failure marker |
|---|---|---|---|---|
| Document upload | prod, uat, test | feature in (`quote-document-upload-imcrm`, `api-quote-document-upload`) | `uploaded`, `stored`, `success` | ERROR+ |
| Payment | prod, uat, test | feature in (`create-payment`, `update-payment`, `cc-payment-process`, `cc-payment-process-command`, `payment-status-update`, `approve-decline-child-payment`, `approve-parent-payment`, `process-master-payment-approved`, `send-failed-payment-email`, `void-payment`) | `Payment pre-authorized`, `captured`, `approved` | ERROR+ |
| Recommendation engine | uat | feature in (`alternative-plan-generation-job`, `alternative-plan-generation-command`, `alternative-plans-trigger-send-job`, `alternative-plans-send-command`, `in-sufficient-recommendation-plan-generation`, `price-on-request-command`, `alternative-plan-state-command`, `approve-toggle-reminders-command`, `suppress-flag-expiry-warnings-command`, `suppress-flag-force-expiry-command`) | runs = `Starting parent plan resolution`; success = `Parent plan resolution completed`; emails sent = `sendAlternativePlansToCustomer - event sent` | `markEngineExecutionFailed`, other ERROR+ |
| Book policy + policy doc email | test | feature == `send-and-book-policy-email-job` | `sent`, `booked` | ERROR+ |
| BOR / consent logs | test | feature in (`bor-logs-listing`, `consent-logs-listing`) | `resolved by uuid fallback` | WARNING `personal quote not found for lead` + ERROR+ |
| MA welcome email | uat | feature in (`ma-welcome-job`, `send-ma-welcome-email`) | `sent` | ERROR+ |
| myAlfred SQS integration | uat, test | message contains any of `MyAlfred`, `myAlfred`, `NotifyMyAlfredCompletionQueue` (no feature tag) | `posting to webhook` not followed by failure; `receiveMessage response` = poll count | `job failed`, `attempted too many times`, `failed to obtain token`, `token rejected (401)`, `MyAlfredCallbackSqsQueue::readyNow` |

Success markers are best-effort. If a module's success count is 0 but it has INFO traffic, show the top 3 INFO messages instead and say "success marker not matched".

## Steps

1. For each env, run one aggregate query over the window (and one over the previous window) per module: `total`, `success`, `failure`, `warning`. Keep queries aggregated; never `project *`.
   Example (UAT, document upload):
   ```
   insurancemarket_dev
   | where service == "IMCRM" and environment == "uat"
   | where tostring(['context.feature']) in ("quote-document-upload-imcrm","api-quote-document-upload")
   | summarize total=count(),
       failure=countif(level in ("ERROR","CRITICAL","ALERT","EMERGENCY")),
       warning=countif(level == "WARNING"),
       success=countif(level == "INFO" and (message contains "uploaded" or message contains "stored" or message contains "success"))
   ```
2. For each module/env with failures or warnings: top 5 messages (`substring(message,0,140)`) with counts. Lead codes are often inside the message itself (e.g. "for lead ZGW7826W"); quote them as samples. In `insurancemarket_prod` you may also read `context.quote_code`/`context.quote_uuid`; `insurancemarket_dev` does not have those fields, so don't reference them there (the query fails).
   APL notes: use one query per dataset with `case()` to label modules and `iff(_time > ago(24h), "today", "yesterday")` over a 48h window. `take_any()` and `any()` don't exist; group by the field instead.
3. Mark status per module/env:
   - 🔴 failures > 0 and (new message vs previous window, or failures ≥ 2× previous, or failures > 1,000)
   - 🔴 success dropped ≥ 80% vs previous window while the previous window had ≥ 20 successes
   - 🟠 failures > 0 but stable, or warnings ≥ 2× previous
   - ✅ no failures
   - ⚪ no logs at all in the window (say so; may mean nothing ran or logging broke)
4. Also flag any of my modules' error messages that have **no `context.feature`** (logging gap; my logging rules require a feature tag).

## Report format

Subject: `Axiom daily report — <YYYY-MM-DD> — <n> red, <n> orange`

```
Summary
🔴 <module> (<env>): <one line: what's failing, count, vs yesterday>
🟠 ...
✅ <modules with no failures, comma separated>

Per module
<Module> — <env>
  Success <n> (yesterday <n>) · Failures <n> (yesterday <n>) · Warnings <n>
  Top errors:
   - <count>× <message>  [sample: <quote code>]
  New today: <messages not seen in previous window, or "none">

Logging gaps
 - <message> (<env>, <count>×) has no context.feature

Suggested next step
 - <1-3 concrete actions, e.g. "MyAlfredCallbackSqsQueue::readyNow missing — check queue driver contract after the Laravel upgrade">
```

## Delivery

- `draft` (default): create a Gmail draft to `muhammad.waris@myalfred.com` with the subject and body above. Never send it.
- `chat`: print the report only.
- Also print the summary block in chat.

## Debugging deeper

For a specific failure, hand off to the matching repo skill: `document-upload`, `recommendation-engine-triage`, `myalfred-queue-integration`, `ppw-business-insurance`, or `prod-triage`.
