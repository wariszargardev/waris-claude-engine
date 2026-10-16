---
name: standup-history-oct25-sep26
description: "De-duplicated summary of the user's daily standups in Google Chat standup space (Oct 2025 – Sep 2026) — workstreams, CU ids, outcomes, people"
metadata:
  node_type: memory
  type: project
  originSessionId: 5a20d0d2-6fa5-4048-8b2d-575be40af2dc
  modified: 2026-10-14T15:59:08.439Z
---

Source: Google Chat space `spaces/AAAAbPo0wLA` (team daily standup; oldest msg 2024-01-15). User posts as **two accounts**: old `users/102340617184663758670` (shows "Deleted User", until 2026-04-17) and current `users/105396637252591664896` (from 2026-04-20). Search both ids. 226 standups 2025-10-02 → 2026-09-23 (none after; ~3-week gap as of 2026-10-14). Blockers section always "None".

**Why:** user asked to keep a non-duplicated summary of their work history for reports/reviews.
**How to apply:** use for weekly/monthly reports, appraisal write-ups, "what did I work on" questions. Day-level detail for Feb–Oct 2026 is in the weekly report sheets — see [[weekly-report-sheets]]; refetch the space for newer posts.

## Workstreams (period → status at last mention)
- **CRM payment engine + Blanka integration** (Oct 2 – Jan 13): route docs, cleanup, APIs (listing/void/decline/split/link/capture/create/update) integrated into Blanka Nov; PR merged to develop Jan 13. Pest payment tests (Dec 18 – Feb 4).
- **BNPL / Tabby** (86ev23rfu, 86ex40w6k, 86ex5y0fq, 86ex0mzjy; Oct 9 – Aug 24): FRD/estimate Oct; req A + capture Dec; fallback/Travel mixed-enquiry Jan; UAT Mar 11, upfront/split rule, multi-payment Mar 17, demo Mar 27; copy-link + company-car offline fix Apr; Stage PR May 12–15; last: Stage PR updated Aug 24.
- **Cyber Insurance** payments/docs (Oct 14 – Dec 11): Manage Payment, Void button, UAT fixes.
- **Payments fixes** Oct–Nov: CC option disabled w/ broker commission, auto-capture mismatch, TRA-QCMSZCU4, book-policy emails, child-lead email, stuck CC commands. Payment KT to Zohaib (from Oct 27).
- **Member Details lock** on Authorized/Paid + **Price match tag** (Nov 6 – Feb 11): PROD hotfix Nov 18.
- **Spatie access logs** (Nov 21 – Jan 14): 30-day cleanup, testing server.
- **Private document URL** (Nov 28 – Sep 3): Test/UAT Dec 16, PROD Jan 30; post-migration fixes Feb.
- **Claims documents** (Dec 29 – Mar 18): utility, seeder, PROD storage Feb 24.
- **VAT sync Policy Details vs Manage Payments** (Jan 20 – Feb 19): PROD hotfix Feb 19.
- **Savings 2.0** (86ewu46jm; Feb 3 – Mar 5): payment mapping, exchange rate.
- **Lead Vault / Bahrain** (Feb 11 – Aug 25; 86exhq3dk, 86exn4xjr, 86exu72ew, 86exuywck, 86exhmv9r, 86exv1np0): payment/doc APIs, BOR endpoints, approve/decline, delete API, DTOs; KT to Amir Aug 25.
- **Permission to Modify Plan / Reset Manage Payments** (86ewyarpe; Mar 31 – May 15): Stage/Prod PRs May 15.
- **UAE PASS FR 03 Health** (86exdnjt5/86exdn918/86exdn6vh; Apr 17 – May 22): deployed May 22.
- **Lead History standardisation** (86exgxpva, 86eycewya; May 8 – Jul 28): PR May 15.
- **Compliance doc 86ewkt3px**, document_type_id scripts (May).
- **MyAlfredWelcome / SQS** (86exvzpqt, 86exmxn10): SQS CPU fix Jun; Horizon test planned Sep.
- **Chronicle audit logging** (May 20 – Jun 5). **BOR SQS** (86extk9c4, 86ey4e10h; Jun).
- **Tax invoice sharing 86exwwtpb / War & Terrorism 86exv3e17** (Jun 9 – Jul 31): War handbook PROD Jul 30. Travel expiry 86exgfppj PROD Jun 5.
- **FR-19 Alternative Plans Engine** (86exb1kft + US 86exb1mae, 86exb28an, 86exb2958, 86exb2a00, 86exb2aqd, 86exke96j, 86exke5g7, 86exnc693, 86exnc95p; CR z8znm0zcb5, config z8znm0zca5; Jul 6 – Sep 23): FRD with Jawad/Shereen, UAT PR Aug 14–18, SMTP emails, UAT email fixes Sep (z8znm0vq38, z8znm11g50, z8znm11g3j, z8znm0wdwk, z8znm0vqde). Planned but never reported done: T-16/T-6/T-2 reminders + Alternate Plans content (z8znm0vqpz, z8znm0vqkr, z8znm0vqj8, z8znm0vr32, z8znm0vpvx). KT to Haider & Waleed planned.
- **PPW Business Insurance** (86expt4k8, 232ey-147498/232ey-365318; Aug 6 – Sep 23): emails WebEngage→Mailer, SQA fixes, Stage validated, prod deploy supported Sep 22.
- **Customer Email/Phone Forcing Function** (86ey84htw; Sep 1–8): tested all LoBs.
- **Blanka auth migration off legacy myAlfred auth** (Sep 14 →): UAT deploy in progress.
- Misc Sep: IMCRM↔Oracle payment method z8znm0wa0b, passport limit z8znm0wb6t, membership upgrade webhook z8znm0ur0a.

## Oct 2026 tasks (from Short sheet + ClickUp, after last standup)
z8znm1a1px policy schedule/docs temp URL at call start (IMCRM call-centre tools, UAT) · z8znm1a6zk CR more renewal reminders after expiry (UAT) · z8znm1a1ng Alternative plans sorting (UAT) · z8znm14ykd PPW disabled for Group Medical (done) · prod: z8znm13mcq Travel age-mix child lead status, z8znm15cnb ADNIC CC payment link, z8znm164r2 AED 0.40 shortfall, z8znm108zc Proforma client details, z8znm18jhm Alfred Coins.

## User's own achievement list (2026-10-14)
User keeps a short self-written list of 17 headline items (CRM payment engine, Cyber, activity logs, private doc URL, Claims docs, Life/Saving payments, Savings, Lead Vault Bahrain, BNPL, UAE PASS, Lead History, Compliance doc, Chronicle (UAT only), Tax invoice + War & Terrorism, Reco engine, PPW, Forcing Function). Items NOT in it were given back as a gap list: auth migration, 86ewyarpe, Member Details lock + Price match, multi-doc tabs/watermark, VAT sync, 9-digit premium, PDF performance, logging, Trade Licence/Passport compliance, welcome email/SQS/membership webhook, BOR SQS/email, Life reminder FRD, Travel expiry, Smartphone NGI, IMCRM↔Oracle, call-centre temp URL, prod support, KT sessions.

## Key people by area
Payments: Haziq, Zohaib, Ahsan, Neema, Mahak, Suresh, Inakshi · BNPL: Haziq, Dinesh, Amir, Moid · Docs: Haseeb, Arslan, Zaib Khan, Jawad, Kamran · Savings: Kristina, Usman Ahmed/Akram · Bahrain: Sharjil, Attique, Faisal, Ammad · UAE PASS: Qasim, Tasawar · FR-19: Jawad, Shereen, Haider, Waleed, Bilal Ahmed · PPW: Neema, SQA · Auth: Kashan, Noman.

Leave/holiday gaps: Oct 10/20/24, Nov 17, Dec 1–2, Jan 8/15–16/21–27, Feb 17, Mar 19–23 (Eid), May 26–29, Jun 11–15/30, Aug 11/28, Sep 24 (leave), Sep 28 (medical).
