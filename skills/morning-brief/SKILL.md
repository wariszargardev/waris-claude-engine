---
name: morning-brief
description: My weekday 9:00 morning brief, posted to my Google Chat space "Morning Brief" — new ClickUp tasks and ClickUp/Google Chat mentions or questions I haven't replied to (Mondays look back over the weekend for anything I haven't answered or updated), my tasks grouped by status with time in status, today's meetings in Pakistan time with 5-minute-before reminders and agenda summaries, and my blanka branches whose PRs aren't merged to develop (stage) yet — branches with no PR get one created via create-pr (feat/fix → develop, hotfix → main). Read-only everywhere else. Use when I say "morning brief", "daily brief", "what do I need to know today", or when the scheduled 9:00 run fires.
---

# Morning brief

**Read-only, with one exception:** part 4 creates missing PRs through the `create-pr` skill. Otherwise never merge, close, label or comment on a PR, and never merge any PR at all. Never change a ClickUp task (status, assignee, comment, time). Never accept/decline invites. Never send email (except the Gmail fallback in Delivery) and never create drafts. Never push or change branches except what `create-pr` does for a missing PR.

Run the parts below. If one part fails (connector not signed in, timeout), write "⚠️ <part> unavailable: <reason>" in that section and continue. Never stop the whole brief for one part.

**Window:** since the last brief — normally the last 24h. **On Monday**, use since Friday 09:00 (the whole weekend).

- Me in ClickUp: Muhammad Waris, user id `73270543`. Timezone: Asia/Karachi (PKT).

**Subagents:** run parts 1 + 2 through the `clickup-reader` agent (Haiku) and the PR/branch checks of part 4 through `pr-plumber` (Haiku); start independent parts in one message so they run in parallel. The lead only merges their summaries and writes the messages.

## 1. ClickUp — what needs me first

### 1a. New tasks assigned to me
`clickup_filter_tasks` with `assignees: ["73270543"]`, `include_closed: false`, `order_by: created`. Keep tasks created (or newly assigned to me) inside the window. For each: name (link), list, status, priority, due date, who created it, one-line summary of the description.

### 1b. Threads where I'm tagged or asked something
Follow the `clickup-my-threads` skill with the window above. List:
- **Question / tagged, waiting on me** — someone @mentioned me or asked me something and I haven't replied after it. Show who, when, the question in one line.
- **Issue found** and **New requirement / change** — as that skill classifies them.

### 1c. Monday only — weekend follow-ups I owe
For my not-done tasks with any activity since Friday 09:00: list the ones where the latest comment is not mine, or where I haven't commented or updated the task since someone else did. Show the task, who wrote last, when, and what they need.

## 1d. Google Chat — mentions and questions I haven't answered

Google Chat connector. Me in Chat: `users/105396637252591664896`. Same window as above (Monday = since Friday 09:00).
1. `search_messages` with `mentionsMe: true`, `startTime` = window start (ISO, UTC), `pageSize: 100`; follow `nextPageToken`.
2. Also `search_messages` with `conversationTypes: ["DIRECT_MESSAGE","GROUP_CHAT"]`, `isUnread: true`, same `startTime` — direct questions to me that may not @mention me.
3. Skip: messages sent by me, bot/app senders (`userType` not HUMAN), alert spaces (names containing "Alert", "Monitoring", "Release Notes"), and Morning Brief itself.
4. **Replied or not:** for each thread (`threadId`), `list_messages` with `conversationId`, `threadId` and `startTime` = the mention's `createTime`. If any later message has sender `users/105396637252591664896` → replied, drop it. For DMs without threads, use the conversation instead of the thread.
5. Classify what's left:
   - **Waiting on me** — I'm addressed at the start of the message or asked something ("can you", "please", "?", "eta", "join", "check", "connect").
   - **FYI** — I only appear in a `cc:` line or in a list of tags with no ask.
6. Space name: from `search_conversations` (map `conversationId` → `displayName`); DMs show as "DM · <sender>". Replace `<chat-user data-user="users/…">` tags with the person's display name where known, otherwise "@someone"; my own tag becomes "@me".
7. Each item: space · sender · relative time · the ask in one line (max ~120 chars). Link: `https://mail.google.com/chat/u/0/#chat/space/<spaceId>` (spaceId = part after `spaces/`). Oldest waiting first. Max 10, then "+N more".

## 2. ClickUp — my tasks by status, with time in status

Follow the `clickup-release-status` skill (exact status names). **Ignore `comms. sent!!! done!`** entirely. Group in this order and skip empty groups:

1. 🔴 **Issues found** (`issues found` status, plus not-done tasks tagged `issue`)
2. 🎭 **Ready for staging / stage testing** (`ready for staging`, `ready to test - stage`, `in progress - staging test`)
3. 🧪 **Testing on UAT / test / dev** (`ready to test - uat`, `in progress - uat test`, `ready to test - test`, `in progress - test`, `ready to test - dev`, `in progress testing - dev`)
4. 📣 **Ready for comms & prod** (`ready for comms & for prod`)
5. 🚀 **Comms sent — in production** (`comms. sent! in production`, only updated in the last 30 days)
6. 🛠 **In progress / waiting on BA or business** (everything else that's not done)

**Time in status:** call `clickup_get_bulk_tasks_time_in_status` with the task ids (in batches) and show for each task: status, **days in current status**, last updated. Flag ⏳ when a task has been in a testing / staging / prod-ready status more than 3 days, and ⚠️ when it's past its due date.

## 3. Meetings today (PKT)

From Google Calendar, today in Asia/Karachi (don't pass a timeZone; the server resolves the calendar's zone). For each meeting: **start–end in PKT (e.g. 11:30–12:00 PKT)**, title, organizer, attendees (names, max 8, then "+N"), video link yes/no, my response. Recurring meetings I never answered (e.g. Daily Standup) show as "recurring" — not as new invites.

Also: number of meetings, total hours, pending invites (today + next 2 working days), free 60+ minute blocks between 09:00 and 18:00.

### 5-minute-before reminders
For every meeting today that starts more than 6 minutes from now:
1. `list_scheduled_tasks` first; skip if a task titled `meeting-prep-<eventId>` already exists.
2. `create_scheduled_task` (one-time, `fireAt` = start − 5 min, ISO with `+05:00`), title `meeting-prep-<eventId>`, prompt:
   > Read-only. Fetch Google Calendar event `<eventId>` (it may have changed). If it was cancelled or I declined, do nothing. Otherwise send a PushNotification: "In 5 min (<start> PKT): <title>". Then post a short prep note to my Chat space (Delivery step 2): time in PKT, organizer, who is in the meeting, video link, and the **agenda summarised in 3–5 bullets** from the event description/attachments (say "No agenda shared" if empty). Never send email, never respond to the invite.

## 4. Blanka branches not on stage yet

Repo: `D:\Afia Insurance\Projects\Office\blanka` (run `git -C` against it; `git fetch origin --prune` first). Read-only for everything except step 4 (create missing PRs). Never merge any PR.

1. Branches = local branches (`git -C <repo> for-each-ref refs/heads --format='%(refname:short)'`), excluding: `main`, `develop`, `test-env-deployment`, `uat-env-deployment`, `new-dev-env-deployment`, and **any branch whose name contains `test`, `uat` or `dev-deployment`/`-deployment`**.
   Also always ignore: `feat/health-renewal-MVP-86ew63z6m`.
2. For each branch: `gh pr list --repo InsuranceMarket-ae/blanka --head <branch> --state all --json number,state,baseRefName,title,url,mergedAt,labels`.
3. Group:
   - ⏳ **PR open into develop — pending stage merge**: number + title + link, labels (`ready for review`?), days open.
   - 🆕 **No PR yet** (separate list): branch name, last commit date, which worktree has it (`git worktree list`).
4. **Create the missing PRs** — after posting the brief, for each 🆕 branch run the `create-pr` skill:
   - `feat/…` or `fix/…` → `create-pr` with target `develop` for `<branch>`.
   - `hotfix/…` → `create-pr` with target `main` (hotfix) for `<branch>`.
   - **Skip and report instead** (don't create) when: the branch's worktree has uncommitted changes; the branch has 0 commits ahead of its base (`git rev-list --count origin/<base>..<branch>`); or its last commit is under 2 hours old (likely still in progress).
   - Run them one at a time; one failing doesn't stop the others. Never merge.
   - Then post one extra message to the Morning Brief space: `*🌿 PRs created — <n>*` with each PR link, base, label status, and the skipped branches with the reason.
   - ✅ PR merged into develop → on stage, **skip**. PR only into `main` → list under "Other".
   - ⚪ PR closed without merge → list under "Other".

## 5. Release tracker

Run the `release-tracker` skill's **Refresh** (it writes to the tracker page's own database — allowed; still nothing in ClickUp/GitHub changes). Collect: urgent items, flagged items, notes older than 14 days, and counts per stage.

## Output — separate, easy-to-read sections

**Never mix sections.** Post **7 separate Chat messages**, in this order, each standing on its own (message 5 = `*📋 Release tracker — <n> need attention*`: urgent + flagged items as numbered entries, a counts line `To do 2 · Test 1 · UAT 0 · Stage 1 · Prod 0`, then the page link https://claude.ai/artifact/988rbaConLHDi6ia4Sjwy9):

| # | Message | Contains only |
|---|---|---|
| 0 | ☀️ Summary | date, counts, Top 3 |
| 1 | 🔔 Needs my reply | part 1a–1c — ClickUp (new assigned, waiting on me, issue found, new requirement, Monday follow-ups) |
| 1b | 💬 Google Chat — waiting on me | part 1d (waiting on me, then FYI count only) |
| 2 | 📋 My tasks by status | part 2 |
| 3 | 📅 Meetings today | part 3 |
| 4 | 🌿 Blanka — not on stage yet | part 4 |

**Readability rules (every message):**
- First line = header in bold with a count, e.g. `*🔔 Needs my reply — 3*`. Then one blank line.
- Sub-groups get their own bold line with a count (`*Waiting on me (2)*`). Skip empty sub-groups; if the whole section is empty, post one line: `✅ Nothing here today.`
- **One item = one numbered entry, max 2 lines:**
  - line 1: what it is, as a link — `1. <url|Task or PR name>`
  - line 2: indented, the facts separated by ` · ` — who / status / days / what's needed.
- Plain words, no jargon or raw status codes where a plain word works ("waiting 4 days", not "4d"). Times always `11:30 AM PKT`.
- Max 8 items per sub-group, then `+N more` with a link to the list.
- Blank line between sub-groups. No tables, no walls of text.

**Templates:**

```
*☀️ Morning brief — Mon, 12 Oct*

3 need my reply · 1 issue · 5 meetings · 6 PRs not on stage

*Top 3 today*
1. Reply to Suad on <url|Customer Email Forcing Function> — waiting 2 days
2. <url|PR #15322> bor-requests-500 — labelled, waiting for merge
3. 11:30 AM PKT Health Renewal scrum — agenda below in Meetings
```

```
*🔔 Needs my reply — 3*

*Waiting on me (1)*
1. <url|Customer Email Address - Forcing Function>
   Suad Ajmal · 2 days ago · "Add only Fayaz as the override employee"

*New tasks assigned (1)*
1. <url|Alternative plans sorting order>
   Health · Ready to test UAT · due 15 Oct · from Shereen

*Issue found (1)*
1. <url|Smartphone NGI policy mapping>
   Rucha · yesterday · "Quote number still not mapped"
```

```
*💬 Google Chat — waiting on me — 2*

1. <url|Health Renewals> · Hassan Naeem · 30 min ago
   "Is any deployment in progress? Plan details not showing in the email"
2. <url|DM · Noman Ali> · Fri
   "can we connect?"

_FYI (cc only): 4_
```

```
*📋 My tasks by status — 24*

*🔴 Issues found (1)*
1. <url|Smartphone NGI policy mapping>
   In this status 3 days ⏳ · last update yesterday

*🎭 Ready for staging (2)*
1. <url|Restrict Tabby Payment - Send update>
   In this status 19 days ⏳
```

```
*📅 Meetings today — 4 (2.5 h)*

1. *11:30 – 12:00 PM PKT* · Health Renewal scrum
   Organizer Ahsan · 6 people · Meet link ✅
2. *03:00 – 04:00 PM PKT* · Sprint planning
   Organizer Faisal · 12 people · Meet link ✅ · ⚠️ not answered yet

*Free time:* 12:00 – 03:00 PM PKT
*Reminders:* set 5 min before each meeting
```

```
*🌿 Blanka — not on stage yet — 7*

*PR open, not merged to develop (6)*
1. <url|#15401 Book Policy Email: verify attachments>
   ready for review · open 6 days

*No PR yet (1)*
1. fix/sale-summary-report-slow-query
   last commit today
```

"Top 3" ranks: question/tag waiting on me (ClickUp or Google Chat) from a manager/PM > issues found on my task > new assigned task with a due date > stage/prod-ready items stuck ⏳ > PRs open with no label.

The 5-minute meeting reminder is its own single message, same style:
```
*⏰ In 5 min — 11:30 AM PKT · Health Renewal scrum*
Organizer Ahsan · Meet link: <url|join>
*With:* Ahsan, Shereen, Bilal +3
*Agenda:*
• ...
• ...
```

## Delivery

**Only to my Google Chat space "Morning Brief"**, via its webhook in `~/.claude/secrets/gchat-webhook.txt` (never print or log the URL). No email, no drafts.
1. Post the **6 sections as 6 separate messages**, in order (Summary, Needs my reply, Google Chat waiting on me, My tasks by status, Meetings today, Blanka not on stage), using the Chat templates above.
   For each: write `{"text": "<message>"}` to a temp JSON file (UTF-8), then `curl -s -o /dev/null -w "%{http_code}" -X POST -H 'Content-Type: application/json; charset=UTF-8' --data-binary @<file> "<webhook>"`. Expect 200. Delete the temp file.
   Chat formatting: `*bold*`, `_italic_`, links `<url|text>`. Keep each message under 4,000 characters; split a section into "(1/2)", "(2/2)" if longer.
2. **5-minute meeting reminder:** one message per meeting in the space (the ⏰ template), plus a PushNotification.
3. **Fallback only if the webhook file is missing or a POST fails:** send the same content as ONE email to `muhammad.waris@myalfred.com`, built from `email-template.html` in this folder (navy header, count strip, Top 3, one card per section with a coloured left stripe and count badge, items as title link + grey facts line + text status chip; 15px text, inline styles only) and add the Gmail label `Label_21` ("Morning Brief"), and say in the first line that Chat failed.
4. Never send to anyone else.
