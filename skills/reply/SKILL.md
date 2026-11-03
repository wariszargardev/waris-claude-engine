---
name: reply
description: Draft my reply to a Google Chat thread, ClickUp task/comment, GitHub PR or Gmail thread from its link — reads the thread, finds what is asked of me, checks the facts in the right place (repo code + knowledge base, Axiom logs, ClickUp, the PR), drafts the answer in my tone, shows it, and posts it only when I say "send". Emails are only ever saved as Gmail drafts. Also holds the fact-check recipe chat-mentions-watch uses for its answer drafts. Use when I say "/reply <link>", "reply to this", "draft a reply for <link>", "answer this thread", or "send" / "send but change it to …" after a reply draft.
---

# Reply to a link

**Nothing is posted until I say `send`** (or `send but change it to …`) in this session after seeing the draft. Scheduled runs never use this skill to post (the `chat-send-guard` hook blocks Chat writes there anyway).

- Me in Chat: `users/105396637252591664896`. Timezone Asia/Karachi (PKT).
- Read through the read-only agents: Chat → `gchat-reader`, ClickUp → `clickup-reader`, logs → `axiom-investigator`. PRs → `gh` (read commands only until I say send). Gmail → `get_thread`.

## 1. Read the thread
| Link | Read |
|---|---|
| `mail.google.com/chat/…/space/<id>[/<threadId>]` or `chat.google.com/…` | `gchat-reader`: the thread (or the last 20 messages of the space), sender names, ids (`conversationId`, `threadId`, `messageId`). |
| `app.clickup.com/t/<id>` (optional `?comment=`) | `clickup-reader`: task name, status, description, the comment thread. |
| `github.com/<owner>/<repo>/pull/<n>` (optional `#discussion_r…`) | `gh pr view <n> --repo <owner>/<repo> --json title,body,state,headRefName,comments,reviews` and `gh api repos/<owner>/<repo>/pulls/<n>/comments` for inline threads. |
| `mail.google.com/mail/…` | Gmail `get_thread`. |

Find **the ask to me**: the latest message that mentions me or is addressed to me, and that I haven't answered. No ask found → say what the thread is about in 2 lines and ask me what to reply.

## 2. Fact-check (shared recipe — also used by chat-mentions-watch)
Answer from evidence, never from memory or guesses. Pick only the sources the ask needs:
- **Code / behaviour** ("why does X…", "is Y supported", "which field…"): the repo the thread is about under `D:\Afia Insurance\Projects\Office\` (blanka by default). Activate the repo's domain skill for that area first (blanka `CLAUDE.md` table), read its KB (`knowledge-base/…`, `.claude/knowledgebase/…`), then only the relevant code. Read `develop` / the default branch, unless the ask names a branch. Broad search → Explore subagent.
- **A lead / quote code / failure** ("lead X stuck", "email not sent"): `axiom-investigator` for the logs; Boost `database-query` only for local/test DBs. Never prod SQL.
- **Status / scope** ("is it on UAT", "when is it done"): `clickup-reader` for the CU, `gh` for PR state and the env branches (`git log origin/<env-branch>` for whether a commit is deployed).
- **A PR review comment**: the diff lines it points at.
Record each fact with its source (file:line, Axiom query, CU, PR). Can't confirm → say so in the draft ("I'll check X and update"), don't invent.

## 3. Draft in my tone
Every draft, in every place: **answer first · no emoji · no promised dates or results I didn't state · English (Roman Urdu only in a Roman Urdu 1:1 DM) · tags as ids**.
- Answer first, then at most 1–3 short supporting lines. Plain English, short sentences, polite, no emoji, no filler ("Hope this helps").
- Never promise a date, fix or result I didn't state. Unsure → one clarifying question.
- Chat: English in named spaces; Roman Urdu only in a 1:1 DM where the sender wrote Roman Urdu. Tags only as `<users/ID>` (ids from the thread / `list_memberships`), never typed `@Name`.
- ClickUp: tag people by their ClickUp user id. PR: GitHub `@login` only for real logins.
- No customer data (names, emails, phones, Emirates ID, policy numbers of real people) in the text; quote codes and CU ids are fine. No secrets, tokens or env values.

Show me:
```
Reply to <sender> in <place> — "<ask, one line>"
Draft:
<text>
Checked: <source 1>; <source 2>
```

## 4. Send (only on my "send")
- Text = the draft, or exactly my text after "change it to".
- Re-check the thread first: if I've already replied after the ask, say so and send nothing.
- Chat → `send_message` in the same `conversationId` + `threadId`.
- ClickUp → reply in that comment thread (or a task comment if there was no thread).
- PR → `gh pr comment` or a reply to the review thread (`gh api …/pulls/<n>/comments/<id>/replies`). Don't resolve threads unless I ask.
- Gmail → `create_draft` in that thread only. **Never send an email**, even if I say send — tell me the draft is in Gmail.
- Confirm in one line: what was sent, where, with the link. Then, if `assistant-todo.json` has an open item with this `messageId` or `link`, mark it done.
