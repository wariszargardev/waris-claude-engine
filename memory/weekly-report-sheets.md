---
name: weekly-report-sheets
description: "User's two weekly-report files in Google Drive (long xlsx Weeks 5–18, Short Weekly Reports Sheet May–Oct 2026) — IDs, how to read them, layout and conventions"
metadata:
  node_type: memory
  type: reference
  originSessionId: 5a20d0d2-6fa5-4048-8b2d-575be40af2dc
  modified: 2026-10-14T15:37:54.200Z
---

Both files are owned by the user, in the same Drive folder (parent `1Z1eur6R_k4hLthpq9MISffP2RCVt8PK8`). Read via the Google Drive connector.

**How to read:** `read_file_content` only returns ~4 sample rows per tab. For full data, `download_file_content` (Short: exportMimeType xlsx) → output is saved to a tool-results JSON → decode base64 with node (no Python on this machine) → unzip → parse `xl/sharedStrings.xml` + `xl/worksheets/sheetN.xml` (map names via `xl/_rels/workbook.xml.rels`).

## 1. "Muhammad Waris Weekly Reports.xlsx" (long format) — ID `1O08z0ydAJmSubWPu4xJ928GkwGxrQLOL`
- Uploaded .xlsx (not a native Sheet); last modified 2026-05-08. Superseded by the Short file from May 2026.
- Tabs: Week 5–15, 17, 18 (no "Week 16" tab; tab "Week 15" actually holds Week 16 = 20–24 Apr; Week 8 header dates incomplete).
- Each tab: header block (Role: Engineering, Week Number, Start/End Date, Label, Total Weekly Hours Worked — usually 42.5, Holiday/Leaves, Note) → **Weekly Allocation Summary** (Project Name | % Allocation | Hours Spent | Key Focus Area) → **Detailed Task Report** (Project | Task Name | Task Link | Description | Est Hours | Hours Spent This Week | Total So Far | Status).
- Projects: Blanka, IMCRM, Lead Vault (Bahrain/BOR), Internal, Meeting. Feb weeks: no per-task hours. From Week 9: one row per day per project ("2026-03-03 – …", combined activities). From Week 9 the "% Allocation" column holds 25-point-scale values, not real percents.
- Themes: Feb Blanka-heavy (Savings 2.0, private docs, payments); Feb–Apr Lead Vault/Bahrain payment+document+BOR APIs; Mar–Apr BNPL/Tabby; Apr–May FR 03 UAE PASS, document types, lead history.

## 2. "Short Weekly Reports" (native Google Sheet) — ID `1cfZ5f-ZiuWSFUnLESHjHGnHcJW0CkC83F1ZJdzYIqi0`
- Current/active file; last modified 2026-10-09. 23 week tabs from 4–8 May 2026 to 5–9 Oct 2026, plus an empty "Sheet24".
- Each tab: 4 columns — Date (From-To) | CU (comma-separated ClickUp ids) | Task / Description (Grouped) | Allocation %. Rows sorted by allocation desc, then `TOTAL | 25` row (from June 8 onward).
- **Conventions:** allocations for a week sum to **25**; a full leave/holiday day = **5.0** row ("Leave – 11-June", "Public Holiday – 15-June", "Medical Leave – 28-Sep", "Half Day Leave – 2-Oct" 2.41); leave weeks get a merged note row 1: "Note: Worked 4 days — 1 day leave (DD-Mon)".
- Grouped categories reused: "IMCRM – Alternative Plans Engine" (CU 86exb1kft, FR-19), "IMCRM – PPW enhancement" (86expt4k8, 232ey-365318), "IMCRM – Other", "Meetings & syncs", "Internal – Dev Tools & Environment Setup", "Internal – Daily & Weekly Reporting", "Bahrain & IMCRM – BOR / document types", "IMCRM – BOR SQS", "IMCRM – Lead history standardisation" (86exgxpva).
- Quirks: tab "7-July-2026 - 11-July-2026" holds data dated 6–10 July; 27-July tab sits before 20-July tab; 7-Sep tab uses "IMCRM - …" (hyphen, longer names) instead of "IMCRM – …".
- Leaves recorded: 11-Jun, 15-Jun (holiday), 30-Jun, 11-Aug, 28-Aug (holiday), 24-Sep, 28-Sep (medical), 2-Oct half day.

Related: [[report-design-preference]]

## 3. "Muhammad Waris – Work Summary (Oct 2025 – Oct 2026)" — current ID `1GLNTLDRN8Cj1taLSGweVqp62-5bsj9acXfnmTbOtxTw` (v2; v1 `13f7VJ…` renamed "OLD – …", safe to delete)
- Built 2026-10-14 for the user's 3-year increment discussion with their manager. Tabs: **Major Projects** (26 rows, last = Production support: 117 prod issues / 23 DB changes / 86 test-UAT-stage issues) and **Minor Work** (24 rows). Columns: # | Title | CU (ClickUp) | Description (manager-friendly) | Period | Status. No CU → "Internal improvement".
- FR-12 was folded into FR-19 (86exb1kft) per user. CRM payment engine CU 86erz1wgp is a best guess — confirm with user.
- Source JSON + builder: scratchpad `increment_sheet.json`, `build_xlsx.js` (node xlsx writer; no Python/zip on machine).
- v2 (user-approved structure): Major = the user's own 19-item list in their order (FR-19, PPW, CRM payment engine, Private doc URL, BNPL, Lead Vault, Cyber & Savings, Activity Logs, BOR SQS, myAlfred, Claims, Life & Savings, UAE PASS, Lead History, Compliance, Chronicle, Tax invoice + W&T, Forcing Function, Manage Payments) with 1–2 line descriptions; everything else (30 rows) in Minor, Production support last. Only 4 columns (#, Title, CU, Description) — user wants NO dates/status/"live on"/"stage" wording. Key phrases bold dark-blue (built via `build_v2.js`, `**…**` markers in `increment_v2.json`).
- **Final (2026-10-15):** "Muhammad Waris – Major Projects (Final)" ID `14nx1XbXSkX_Z-JomvLl99hPTv1TXGnGnqk5kE1tO1is` — single tab, user-edited 19-row Major list (CRM Payment Engine = Internal improvement, row 11; Cyber CU = Internal improvement), key phrases bold dark-blue. Source `v3.json` + `build_v3.js`; CSV copy at Office\claude\Waris_Major_Projects.csv.
