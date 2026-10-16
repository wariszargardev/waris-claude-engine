---
name: sale-summary-stage-baseline
description: "Sales Summary report numbers (stage #1-6 + PROD #7 Jun-Aug Booked Policies, #8 Approved Txns today) captured BEFORE the slow-query fix (PR #15621) — compare after deploy"
metadata:
  node_type: memory
  type: project
  originSessionId: 4762ff62-af4c-4b10-b187-4027b7ee124a
  modified: 2026-10-14T09:56:07.090Z
---

Baseline taken by Waris on imcrmstage.alfred.ae on 2026-10-14, before deploying PR #15621 (`fix/slow-report-and-search-queries`, see [[review-before-pr]]). After the deploy, re-open the same URLs and compare every number; they must match exactly (the PR changes Sales Summary joins and the pcp_tag filter, not the totals).

All three: Report Category = Sales Summary, Group By = Advisor, Include Cancelled = Yes, no other filters.

**1. Approved Transactions, Payment Due Date 01/09/2026 – 30/09/2026**
URL params: `reportType=Approved Transactions&paymentDueDate[0]=2026-09-01T14:53:00.000Z&paymentDueDate[1]=2026-09-30T14:53:00.000Z`
| Advisor | Dept | Policies | Price (VAT app.) | VAT | Commission (VAT app.) | VAT on comm. | T. Price | Branch |
|---|---|---|---|---|---|---|---|---|
| N/A | N/A | 1 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | (blank) |
| saboor | Organic | 7 | 800.00 | 40.00 | 80.00 | 4.00 | 840.00 | Dubai & Northern Emirates |
| Suresh | Home | 177 | 37,780.00 | 1,889.00 | 5,800.00 | 290.00 | 39,669.00 | Dubai & Northern Emirates |
| **Total** | | **185** | **38,580.00** | **1,929.00** | **5,880.00** | **294.00** | **40,509.00** | |

**2. Booked Policies, Booking Date 01/08/2026 – 31/08/2026**
https://imcrmstage.alfred.ae/reports/management-report?createdAt=2026-10-14&export=0&groupBy=advisor&includeCancelledPolicies=Yes&page=1&pec_flag=all&policyBookDate%5B0%5D=2026-08-01T14%3A53%3A00.000Z&policyBookDate%5B1%5D=2026-08-31T14%3A53%3A00.000Z&reportCategory=Sales%20Summary&reportType=Booked%20Policies
| Advisor | Dept | Policies | Price (VAT app.) | VAT | Commission (VAT app.) | VAT on comm. | T. Price | Branch |
|---|---|---|---|---|---|---|---|---|
| Sidrah Javed | Organic | 2 | 102,000.00 | 5,100.00 | 21,000.00 | 1,050.00 | 107,100.00 | Dubai & Northern Emirates |
| Suresh | Home | 19 | 33,080.00 | 1,654.00 | 5,420.00 | 271.00 | 34,734.00 | Dubai & Northern Emirates |
| **Total** | | **21** | **135,080.00** | **6,754.00** | **26,420.00** | **1,321.00** | **141,834.00** | |

**3. Paid Transactions, Paid At 01/01/2026 – 31/01/2026**
https://imcrmstage.alfred.ae/reports/management-report?createdAt=2026-10-14&export=0&groupBy=advisor&includeCancelledPolicies=Yes&page=1&paymentDate%5B0%5D=2026-01-01T00%3A00%3A00.000Z&paymentDate%5B1%5D=2026-01-31T00%3A00%3A00.000Z&pec_flag=all&reportCategory=Sales%20Summary&reportType=Paid%20Transactions
| Advisor | Dept | Policies | Price (VAT app.) | VAT | Commission (VAT app.) | VAT on comm. | T. Price | Branch |
|---|---|---|---|---|---|---|---|---|
| Muhammad Waris | N/A | 1 | 2,885.00 | 144.25 | 10.00 | 0.50 | 3,029.25 | Dubai & Northern Emirates |
| qa_automation1 | Organic | 5 | 2,885.00 | 144.25 | 300.00 | 15.00 | 3,029.25 | Dubai & Northern Emirates |
| Suresh | Home | 6 | 11,540.00 | 577.00 | 1,200.00 | 60.00 | 12,117.00 | Dubai & Northern Emirates |
| Zohaib ADV | Organic | 5 | 8,655.00 | 432.75 | 900.00 | 45.00 | 9,087.75 | Dubai & Northern Emirates |
| **Total** | | **17** | **25,965.00** | **1,298.25** | **2,410.00** | **120.50** | **27,263.25** | |

In all three, Endorsements, Price (VAT not app.), Discount, Commission (VAT not app.) and Endorsement Amount are 0.00; Transactions = Policies.

**Why:** proves the Sales Summary conditional-join refactor didn't change results. **How to apply:** when Waris says the fix is deployed to stage, open these URLs (or ask for screenshots) and diff against this table; report any mismatch.

**4. Export hit with the default route (before fix)** — `/reports/management-report/export` with default params (Sales Summary, no date filter chosen), saved by Waris as `C:\Users\Muhammad Waris\Desktop\default.csv`:
```
Advisor,Department,"Total Policies","Total Endorsements","Total Transactions","Price (VAT applicable)","Total VAT","Price (VAT not applicable)",Discount,"Commission (VAT applicable)","VAT ON Commission","Commission (VAT Not applicable)","Total Endorsement Amount","Total Price",Branch
Totals,,0,0,0,0,0,0,0,0,0,0,0,0,
Totals,,0,0,0,0,0,0,0,0,0,0,0,0,
```
Header only, no data rows, and the all-zero `Totals` row appears **twice** (looks like a pre-existing bug in the Sale Summary CSV export, not touched by PR #15621). After deploy: the same default export should still return the header and no data; note whether the duplicate `Totals` row is still there.

**5. Booked Policies, Booking Date 01/09/2026 – 30/09/2026 (screen + CSV, before fix)**
https://imcrmstage.alfred.ae/reports/management-report?createdAt=2026-10-14&export=0&groupBy=advisor&includeCancelledPolicies=Yes&page=1&pec_flag=all&policyBookDate%5B0%5D=2026-09-01T00%3A00%3A00.000Z&policyBookDate%5B1%5D=2026-09-30T00%3A00%3A00.000Z&reportCategory=Sales%20Summary&reportType=Booked%20Policies
| Advisor | Dept | Policies | Price (VAT app.) | VAT | Commission (VAT app.) | VAT on comm. | T. Price | Branch |
|---|---|---|---|---|---|---|---|---|
| saboor | Organic | 7 | 800.00 | 40.00 | 80.00 | 4.00 | 840.00 | Dubai & Northern Emirates |
| Suresh | Home | 22 | 34,060.00 | 1,703.00 | 5,500.00 | 275.00 | 35,763.00 | Dubai & Northern Emirates |
| **Total** | | **29** | **34,860.00** | **1,743.00** | **5,580.00** | **279.00** | **36,603.00** | |

CSV export of the same filters (`C:\Users\Muhammad Waris\Desktop\Booked Policies Septempber.csv`) has the same numbers, rows ordered Suresh then saboor (screen shows saboor first), and again the `Totals,,29,0,29,34860,1743,0,0,5580,279,0,0,36603,` line appears **twice** — confirms the duplicate Totals row is a pre-existing Sale Summary CSV bug.

**6. Approved Transactions, Payment Due Date 01/01/2026 – 31/01/2026 (screen + CSV, before fix)**
https://imcrmstage.alfred.ae/reports/management-report?createdAt=2026-10-14&export=0&groupBy=advisor&includeCancelledPolicies=Yes&page=1&paymentDueDate%5B0%5D=2026-01-01T15%3A01%3A00.000Z&paymentDueDate%5B1%5D=2026-01-31T15%3A01%3A00.000Z&pec_flag=all&reportCategory=Sales%20Summary&reportType=Approved%20Transactions
| Advisor | Dept | Policies | Price (VAT app.) | VAT | Commission (VAT app.) | VAT on comm. | T. Price | Branch |
|---|---|---|---|---|---|---|---|---|
| N/A | N/A | 81 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | (blank on screen, N/A in CSV) |
| Larry Bascon | N/A | 2 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | Dubai & Northern Emirates |
| Muhammad Waris | N/A | 1 | 2,885.00 | 144.25 | 10.00 | 0.50 | 3,029.25 | Dubai & Northern Emirates |
| qa_automation1 | Organic | 56 | 2,885.00 | 144.25 | 300.00 | 15.00 | 3,029.25 | Dubai & Northern Emirates |
| Suresh | Home | 73 | 11,540.00 | 577.00 | 1,200.00 | 60.00 | 12,117.00 | Dubai & Northern Emirates |
| Tasawar adv | Organic | 1 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | Dubai & Northern Emirates |
| Zohaib ADV | Organic | 66 | 8,655.00 | 432.75 | 900.00 | 45.00 | 9,087.75 | Dubai & Northern Emirates |
| **Total** | | **280** | **25,965.00** | **1,298.25** | **2,410.00** | **120.50** | **27,263.25** | |

CSV (`C:\Users\Muhammad Waris\Desktop\Approved Transactions jan.csv`) has the same numbers in a different row order (Tasawar adv, Zohaib ADV, Suresh, qa_automation1, Larry Bascon, N/A, Muhammad Waris) and the `Totals` line twice again. Note: price totals equal Paid Transactions Jan (#3) but policy counts are higher (280 vs 17) — many approved splits with 0 amounts; that's existing data, not a bug of this PR.

**7. PRODUCTION — Booked Policies, Booking Date 01/06/2026 – 30/08/2026 (screen + CSV, before prod deploy)**
Taken by Waris on **imcrm.alfred.ae (prod)** on 2026-10-14, before the prod deploy of this fix. Note end date is 30/08, not 31/08.
https://imcrm.alfred.ae/reports/management-report?createdAt=2026-10-14&export=0&groupBy=advisor&includeCancelledPolicies=Yes&page=1&pec_flag=all&policyBookDate%5B0%5D=2026-06-01T00%3A00%3A00.000Z&policyBookDate%5B1%5D=2026-08-30T00%3A00%3A00.000Z&reportCategory=Sales%20Summary&reportType=Booked%20Policies
Totals (screen = CSV):
| Policies | Endorsements | Transactions | Price (VAT app.) | VAT | Commission (VAT app.) | VAT on comm. | Endorsement Amt | T. Price |
|---|---|---|---|---|---|---|---|---|
| 29,376 | 1,227 | 30,603 | 64,250,179.93 | 3,212,511.15 | 14,165,660.58 | 708,300.89 | -1,234,912.83 | 66,227,778.25 |
Price (VAT not app.), Discount, Commission (VAT not app.) all 0.00. CSV has 346 advisor rows; full copy saved next to this file as `sale-summary-prod-baseline-booked-2026-06-01_08-30.csv` (original: `C:\Users\Muhammad Waris\Desktop\01-06-30-08.csv`). Spot-check rows from screen: Aasim Gulam Jethwa 433/14/447, T. Price 1,182,946.15; Ali Aldimasi 273/0/273, 781,187.63; Almas Dawood 427/13/440, 602,353.71. Many advisors appear twice (second row = endorsement-only, 0 policies, Branch N/A); one `N/A,N/A` row with blank branch (3 endorsements, 1,270.50). `Totals` line appears **twice** in CSV again (same pre-existing bug).
After prod deploy: re-open the URL + re-export, diff totals and every row against the saved CSV (row order may differ).

**8. PRODUCTION — Approved Transactions, Payment Due Date 14/10/2026 – 14/10/2026 (screen only, before prod deploy)**
Taken on imcrm.alfred.ae on 2026-10-14. **Caution:** the range is *today*, so live data keeps changing — a later re-check can differ for real reasons; compare at the same moment or prefer a past range.
https://imcrm.alfred.ae/reports/management-report?createdAt=2026-10-14&export=0&groupBy=advisor&includeCancelledPolicies=Yes&page=1&paymentDueDate%5B0%5D=2026-10-14&paymentDueDate%5B1%5D=2026-10-14&pec_flag=all&reportCategory=Sales%20Summary&reportType=Approved%20Transactions
Only the first 15 rows were visible (no Totals row, no CSV). All have Endorsements 0, Transactions = Policies, Price/Commission VAT-not-app. 0, Discount 0, Endorsement Amt 0, Branch Dubai & Northern Emirates.
| Advisor | Dept | Policies | Price (VAT app.) | VAT | Commission | VAT on comm. | T. Price |
|---|---|---|---|---|---|---|---|
| Aasim Gulam Jethwa | Motor Renewals | 5 | 8,148.00 | 407.40 | 1,869.06 | 93.46 | 8,555.40 |
| Abdul Rehman Mukadam | BDMs/SBDMs | 1 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Abeir Elkayyas | Falcon Advisory - RGTA | 1 | 4,217.00 | 210.85 | 927.74 | 46.39 | 4,427.85 |
| Adeel Farooq | Organic | 1 | 800.00 | 40.00 | 200.00 | 10.00 | 840.00 |
| Adnan Haider | Abu Dhabi Practice (RGTA) | 1 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Akber Mohammed | Organic | 6 | 6,700.00 | 335.00 | 1,570.00 | 78.50 | 7,035.00 |
| Ali Aldimasi | Falcon Advisory - RGTA | 2 | 1,700.00 | 85.00 | 374.00 | 18.70 | 1,785.00 |
| Almas Dawood | Motor Renewals | 2 | 1,800.00 | 90.00 | 270.00 | 13.50 | 1,890.00 |
| Anagha Sunil | Private Clients Practice | 1 | 4,868.00 | 243.40 | 1,070.96 | 53.55 | 5,111.40 |
| Anoop Ashok Nair | BDMs/SBDMs | 4 | 3,022.84 | 151.14 | 572.79 | 28.64 | 3,173.98 |
| Anshu Kumar | Motor Renewals | 4 | 3,600.00 | 180.00 | 1,260.00 | 63.00 | 3,780.00 |
| Anthony Lumagbas | Corporate Motor | 4 | 3,100.00 | 155.00 | 666.00 | 33.30 | 3,255.00 |
| Anushree Soni | Placement | 1 | 6,129.00 | 306.45 | 1,532.25 | 76.61 | 6,435.45 |
| Anwar Abdulla | Private Clients Practice | 1 | 5,026.00 | 251.30 | 1,105.72 | 55.29 | 5,277.30 |
| Ashish Mishra | Placement | 3 | 2,467.50 | 123.38 | 417.25 | 20.86 | 2,590.88 |
CSV export (same URL) saved next to this file as `sale-summary-prod-baseline-approved-2026-10-14.csv` (original: `C:\Users\Muhammad Waris\Desktop\Sales Summary-2026-10-14.csv`). 104 advisor rows; all 15 screen rows above match the CSV.
**Totals:** Policies 322, Endorsements 1, Transactions 323, Price (VAT app.) 477,200.13, VAT 23,860.04, Commission 111,867.08, VAT on comm. 5,593.49, Endorsement Amt 1,926.75, T. Price 502,986.92. Only endorsement: Brandon Jake Baguio 3/1/4, +1,926.75. Odd existing row: Jiten Soman has commission 498.19 with 0 price. `Totals` line twice again.
Since the range is today, a re-check after deploy can drift; diff row by row and explain any change by new approvals.

**After prod deploy (2026-10-14) — results**
- #7 Booked Policies 01/06–30/08: PASS. Screen totals match; after-deploy CSV (`Desktop\Sales Summary-2026-10-14 (1).csv`) is byte-for-byte identical to the baseline CSV (all 346 rows, same order). Duplicate `Totals` line still present (pre-existing bug, unchanged).
- #8 Approved Txns 14/10: pending.
- Default export: pending.
