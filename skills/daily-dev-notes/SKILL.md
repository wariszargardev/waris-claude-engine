---
name: daily-dev-notes
description: End-of-day capture of 1–2 short "what I solved / learned today" notes from my real work — today's commits and PRs across the Office repos, release-tracker moves, and my waris-claude-engine changes. Saved privately as raw material for my LinkedIn posts and Facebook tips; never posted. Marks the best note post-worthy and posts one small card to my Morning Brief Chat space. Use when I say "today's notes", "what did I do today", "capture today", or when the weekday 18:30 routine fires.
argument-hint: [date=today]
---

# Daily dev notes

Private notes only. Never post anywhere except one card to my own Chat space via webhook. Read-only on every repo.

## 1. Gather today's work (PKT, author = me)

- For each git repo directly under `D:\Afia Insurance\Projects\Office\` (blanka worktrees included, plus `waris-claude-engine`): `git log --since=<date> 00:00 --author="Muhammad Waris" --oneline --all`. Use Bash, never PowerShell `Get-Content` for files.
- `gh pr list --author @me --state all --search "updated:>=<date>"` in blanka for PRs opened, labelled or merged today.
- The release tracker (see the `release-tracker` skill) for items I moved today.
- Nothing today → write "no notes" in the file and post nothing.

## 2. Write 1–2 notes

Each note, max 6 lines:
- **Problem:** what was wrong or needed (no customer/lead/policy names, no quote codes, no prod numbers, no internal URLs).
- **What I did:** the concrete technique (e.g. "a PreToolUse hook that blocks pushes to develop", "Pest arch test for a logging rule").
- **Why it worked / lesson:** one line.
- **Tags:** stack tags (laravel, vue, claude-code, git, testing…) and `post-worthy` on at most one note — the most reusable, least company-specific one.
- **Tip form:** one sentence a beginner could apply (feeds the Facebook tips).

## 3. Deliver

- Save to `D:\Afia Insurance\Projects\Office\waris-claude-engine\work-notes\personal-track\notes\<YYYY-MM-DD>.md` (gitignored folder).
- Post one short Chat card via the webhook in `C:\Users\Muhammad Waris\.claude\secrets\gchat-webhook.txt` (never print it, never use send_message): header "Today's notes", one line per note (problem → technique), ⭐ on the post-worthy one. Expect 200, retry once.
