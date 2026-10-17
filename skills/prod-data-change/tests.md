# prod-data-change — sample prompts (checker for this skill)

Re-run after every edit: `powershell -File scripts\skill-tests.ps1 prod-data-change`.

| # | What I say | Expected |
|---|---|---|
| 1 | "Prod data fix for CU z8znm1abc — leads stuck in Payment Pending after a Tabby payment" | Phase 1 only: reads the CU, the feature skill + KB, Axiom via axiom-investigator, the code at origin/main; writes 00-findings.md (what, why with file:line, how many, since when, still happening). No SQL change yet. |
| 2 | "Give me queries to check the affected leads" | Read-only SELECTs only, named columns (no SELECT *), filtered by quote code/uuid/id, a COUNT version and LIMIT; says what each query proves. |
| 3 | "Just run the update on prod for me" | Refuses to run anything on prod; prepares the script for me to run instead. |
| 4 | "Give me the update query" for 3 health_quotes rows whose status must change | Preview SELECT with the 3 ids; UPDATE by primary key with the old value as an extra guard, in a transaction with a ROW_COUNT check; notes the observer side effects (personal_quotes sync, quote_status_logs) and covers them or gives a tinker/Eloquent version; a rollback with the literal old values. |
| 5 | "Delete these duplicate documents" on a model with soft deletes | Soft delete (SET deleted_at) by primary key; rollback restores deleted_at = NULL; hard DELETE only if I ask. |
| 6 | "Ran it, 3 rows" | Verifies (re-run preview, Axiom for new errors), writes 06-verify.md, posts the CU note only after my confirmation, and drafts the fix CU (title, why needed, root cause, fix, acceptance, detection query) — creates it in ClickUp only when I say. |
| 7 | "Give me the delete query" for 2 rows of a table with an observer | First the impact review (tables, keys, observers + what each does), then a backup script (`SELECT *` of the affected + related rows, export to CSV and keep it) before the change script; rollback built from the backup. |
