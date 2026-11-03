---
name: chat-mentions-watch
description: Every-8-minutes watcher for my Google Chat — finds new messages that @mention me or DM me, across all spaces, that I haven't answered, sorts each one (task, question, unclear, connect, FYI), drafts a short reply in my own style, fact-checks up to 3 tasks/questions per run (code + KB, Axiom, ClickUp, PR — read-only) into an answer draft, adds every ask to my assistant to-do list, and posts only the new ones with their numbered drafts to my "My Mentions" Chat space. The run never sends, replies, reacts or marks read. Later, "send N" (or "send N but change it to …") sends that one draft as me in its thread. Use when I say "check my mentions", "any new Chat mentions", "send 2", "send 2 answer", "review 2", "send 3 but change it to …", or when the scheduled run fires.
---

# Google Chat mentions watcher

**The scheduled run is read-only on Google Chat.** Never send, reply, react or mark read with the Chat connector during a run. The only post allowed is to my own "My Mentions" space through its webhook. Sending happens only in the "Send a draft" section, only when I say `send N`.

**Every mention:** read the 1–3 messages above it in the thread, and send nothing in that thread during a run. **Who does what:** `gchat-reader` only reads Chat. The lead (this session) sorts, fact-checks and writes every draft, and saves each draft with its `messageId`, `conversationId` and `threadId` in the state file. **Every draft and answer:** English in named spaces, Roman Urdu only in a 1:1 DM where the sender wrote Roman Urdu; short, polite, no emoji, no promised dates or results.

- Me in Chat: `users/105396637252591664896`. Timezone Asia/Karachi (PKT).
- Webhook: `C:\Users\Muhammad Waris\.claude\secrets\gchat-mentions-webhook.txt` (never print or log it).
- State: `C:\Users\Muhammad Waris\.claude\secrets\mentions-state.json` — `{"lastCheck": "<ISO UTC>", "seen": ["<messageId>", ...], "nextDraft": <int>, "drafts": [{"n", "createdAt", "messageId", "conversationId", "threadId", "space", "sender", "ask", "text"}]}`. Missing → `lastCheck` = 8 minutes ago, `seen` = [], `nextDraft` = 1, `drafts` = [].

## Steps (scheduled run or "check my mentions")

1. Read state. Window start = `lastCheck` minus 2 minutes (overlap so nothing slips between runs), but never more than 24 hours back: if `lastCheck` is older, use `now` minus 24 hours. Record `now` (UTC) before searching.
2. **Read Chat only through the `gchat-reader` agent** (read-only tools). Ask it for, since window start:
   - messages that @mention me, and DMs / group chats to me even without an @mention;
   - dropping: ids already in `seen`; messages from me; non-HUMAN senders; spaces named "Morning Brief" or "My Mentions"; alert spaces (name contains "Alert", "Monitoring", "Release Notes");
   - dropping answered ones (any later message from me in the same thread, or in the DM);
   - for each remaining one: space name (DMs → "DM · <sender>"), sender, time, text with `<chat-user>` tags replaced by names ("@me" for me), ids (`messageId`, `conversationId`, `threadId`), and the **1–3 messages just above it in the thread**.
   The lead (this session) does everything below.
3. **Sort** each message, always reading the 1–3 messages above it in the thread for context:
   - **task** — asks me to do something ("please assign", "merge", "check on stage", "share the result").
   - **question** — needs me to look into something or answer.
   - **unclear** — I can't tell what's needed (no context, missing env/lead/detail).
   - **connect** — "can we connect", "are you free", "please join".
   - **FYI** — I'm only in a `cc:` line or a tag list with no ask to me alone; PM/bot daily digests (per-project daily status posts); team-wide broadcasts or polls; "check whatsapp".
   - **bare tag** — only my tag, or an image with no text.
   Any DM that isn't FYI or a bare tag counts as an ask.
4. **Draft** one reply for task, question, unclear and connect. No draft for FYI or bare tag. Draft rules (from my real replies, 2026-09-29 → 2026-10-29):
   - Short: about 1–10 words. Polite, plain, no emoji. Never promise a date, a fix or a result I didn't state.
   - task → a short ack: "Checking" or "Let me review". Use "Let me check and share the result." only when the ask itself asks me to share a result.
   - question → "Checking", or one clarifying question if the ask is ambiguous.
   - unclear → one clarifying question for the missing detail, e.g. "Which environment, and what do you need to change?"
   - connect → "Sure".
   - English in named spaces. Roman Urdu only in a 1:1 DM where the sender wrote Roman Urdu.
   Give each draft the next number from `nextDraft` (numbers are never reused).
4b. **Review and answer** (task and question only, max 3 per run, oldest first; the rest get `review N` in the post): follow the fact-check recipe in the `reply` skill (step 2), read-only. It shows in the post as an `answer N` line with its sources. If the evidence answers the ask, write an **answer draft** for the same number (`answer` field): the answer first, 1–3 short lines, my tone, no customer data, plus `checked` = the sources (file:line, Axiom query, CU, PR). If it doesn't, no answer draft and `checked` = what is missing (e.g. "need the quote code"). Never act on a task (no code change, no ClickUp update, no deploy) — only look.
5. **Nothing new → post nothing.** Just update state and stop.
6. Otherwise post ONE message (plain text JSON `{"text": ...}` to a temp UTF-8 file, then `curl -s -o /dev/null -w "%{http_code}" -X POST -H 'Content-Type: application/json; charset=UTF-8' --data-binary @<file> "<webhook>"`; delete the file):

```
*💬 <n> new mention(s) — <h:mm AM/PM> PKT*

1. <https://mail.google.com/chat/u/0/#chat/space/<spaceId>|<Space name>> · <Sender> · <relative time> · <type>
   "<the ask, one line, max ~120 chars>"
   ↳ draft <N>: "<draft text>"        (task items add: · action for me)
   ↳ answer <N>: "<answer draft>" · checked: <sources>      (only when 4b found one; else "· review <N>: <what's missing>")
2. ...

_Tagged, no text: <n> — <Space names>_
_FYI: <n> — <Space names>_
_Reply with "send <N>", "send <N> answer", "review <N>" or "send <N> but change it to …" in Claude._
```
   Asks first, oldest first; max 10 then "+N more". Times in PKT. Show the "Tagged" / "FYI" lines only when non-zero; show the last line only when there is at least one draft.
   **Post failed** (HTTP code not 2xx): don't update state (so the next run reports the same items), send a PushNotification "My Mentions post failed (HTTP <code>) — check the webhook", and stop.
7. Update state: `lastCheck` = `now`; append every reported or FYI message id to `seen` (keep the last 500); append each new draft to `drafts` with its ids, space, sender, ask and `createdAt`; drop drafts older than 24 h; set `nextDraft`. Drafts also keep `answer` and `checked` when 4b ran.
7b. **To-do list:** for each task / question / unclear / connect item, add a `source: chat` to-do to `assistant-todo.json` — **skip it if that `messageId` is already in the file** (format in the `assistant` skill): `text` = "<Sender> (<space>): <ask>", `link` = the space link, `context` = draft N and the answer/missing line. For open chat to-dos whose thread now has a later reply from me, mark them `done`.
8. Send a PushNotification only when there's at least one ask: "<n> new Chat mention(s) — <first sender>: <short ask>".

## Send a draft ("send N" / "send N but change it to …")

Only in an interactive session, only on my explicit `send N`. Never as part of a scheduled run.

1. Read draft N **from the state file** (a new session doesn't remember the post). Not found or older than 24 h → say so and send nothing.
2. Check the thread (via `gchat-reader`): if I've already replied after the mention, say so and send nothing.
3. Text = draft N's text; with `send N answer`, draft N's `answer` (none saved → say so and send nothing); or exactly my text after "change it to".
4. Send it as me with **`mcp__google-chat-waris__send_message`** (my own Chat app, so it shows my app name, not "Alfred AI"): `space` = draft N's `conversationId`, `thread` = its `threadId` (DMs: the DM space). Only if that server is not connected or not signed in, say so and ask before falling back to the Chat connector `send_message`.
5. Confirm: what was sent, to whom, in which space/thread, with the link. Mark draft N as sent in state and its to-do `done` in `assistant-todo.json`. Send nothing else.

## Review a draft ("review N")

Interactive only. Load draft N from state, then run the `reply` skill from step 2 (fact-check) on that message: show the answer draft and its sources, save it as draft N's `answer`, and send only on my `send N answer`.
