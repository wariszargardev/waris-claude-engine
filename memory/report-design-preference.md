---
name: report-design-preference
description: "Muhammad likes reports as a polished dashboard page (artifact), not long chat text; the morning-brief dashboard design is the approved reference"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 5b9e8bb9-6adf-4cd0-b648-8976abe834fe
  modified: 2026-10-15T07:18:36.573Z
---

Muhammad wants reports and digests summarized and shown as a good-looking page, not long chat text. On 2026-10-09 he approved the morning-brief dashboard (https://claude.ai/artifact/LceAGA8mXNd9q4kBXeWDah) with "this is good". Its layout: a header with status pills, then Top 3, then a 2×2 card grid with colored status bars. He also likes serif reading pages for lessons.

**Why:** he scans for what needs action. Long chat output is hard to read.
**Routines (2026-10-15):** every routine report must follow this dashboard pattern. Chat webhooks can't attach PDFs, so he chose a page link over PDF. Local routines: publish the dashboard page (Artifact) + post ONE cardsV2 summary card with an "Open full report" button via webhook. Cloud routines (no Artifact tool): post ONE cardsV2 dashboard card via webhook (Status pills, count strip via `columns`, one decoratedText per item, colours red #b3261e / amber #b06000 / green #1e7d4f / grey #80868b). The cloud Morning Brief has no release pipeline section — only Top 3, ClickUp threads, my tasks, meetings (agenda from Calendar + Drive). See [[routines-post-unread-via-webhook]].

**How to apply:** for any recurring report (daily, weekly, deploy status), reuse that dashboard style (template at `~/.claude/skills/morning-brief/dashboard-template.html`). Keep the chat reply to a short summary plus the link. Related: [[claude-code-learning-plan]].
