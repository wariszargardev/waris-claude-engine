---
name: user-profile-and-pain-points
description: "Who Muhammad is (senior SE, Blanka/IMCRM), his Claude Code level, and the full list of manual pain points he wants automated"
metadata:
  node_type: memory
  type: user
  originSessionId: b59fa4d5-d37c-4d3d-abf2-abc4913dda3b
  modified: 2026-10-07T12:48:46.512Z
---

Muhammad Waris is a senior software engineer at Alfred/InsuranceMarket. His daily work is feature enhancements, bug fixes and issue tracing, mostly in the Laravel `blanka` (IMCRM) repo. He writes in Roman Urdu mixed with English. Answer in short, plain English.

**Current Claude Code level (as of 2026-10-07):** basic. He opens the Code tab, adds a project folder and describes the task. He knows skills only in outline (instructions Claude follows). He doesn't know Artifacts, scheduling or the design tools. He doesn't plan features with Claude or understand in depth how Claude works through a feature. He gives alfred-orchestrator some basic instructions and it follows them.

**Manual pain points (his numbered list):**
- Axiom: he opens Axiom himself to check logs for issues and for his features. He wants a skill that runs daily, analyzes the logs and reports status.
- Fixes need manual steps.
- PR loop: create the PR, add labels on GitHub, wait for comments, remove the label, resolve comments, re-add the label. This repeats until everything is resolved, and nothing deploys until then.
- Test/UAT deploys: check the test/UAT deployment branch, cut a branch from it, merge the feature, resolve conflicts, build the bundle, push, add labels, resolve comments.
- Production issues and lead processing sometimes need DB changes.
- ClickUp: he checks threads, tags and task assignments by hand.
- He forgets status: which fix or improvement is on test/stage/prod and whether it needs a retest.
- Some enhancements have no CU task. He needs one place to note them so he can quickly see what's on test, stage or prod.
- He writes daily and weekly summaries by hand.
- He keeps checking Gmail for mentions and emails, meeting invites, and how many meetings are scheduled.
- He repeats instructions every session: no code comments, composer/yarn install on a new worktree, branch pattern, when to create skills. He wants one instructions file that Claude follows every time (see [[blanka-worktree-and-no-commit]]).
- He wants to learn skills and MCP (how they work, how to see what's installed) and have everything "at his fingertips."

**Goal:** go from beginner to master. Routine work should run automatically and report to him, so he can focus on improvement and skill growth that benefit the company.

**Separate personal track:** keep up with developer trends, get a professional photo, and post regularly on LinkedIn. Possible tie-in: a weekly trends digest and post drafts based on what he built.

**Canonical list:** `D:\My Claude Code Learning — Gaps & Goals.pdf` (created 2026-10-07). It lists 29 numbered items in sections A–I: A knowledge gaps, B repeated instructions, C issue tracing/fixes, D PR+deploy flow, E tracking/status, F communication/daily routine, G learning approach, H professional growth, I end goal. It adds item 23: YouTube/Google learning confuses him because there's no clear order, so teach in a strict sequence. The PDF is image-only (Print to PDF), so text extraction fails. To read it, render it with pdf.js in the browser pane. Refer to items by their PDF numbers.

See [[claude-code-learning-plan]].
