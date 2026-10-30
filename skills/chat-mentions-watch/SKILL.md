---
name: chat-mentions-watch
description: Every-8-minutes watcher for my Google Chat — finds new messages that @mention me or DM me, across all spaces, that I haven't answered, sorts each one (task, question, unclear, connect, FYI), drafts a short reply in my own style, and posts only the new ones with their numbered drafts to my "My Mentions" Chat space. The run never sends, replies, reacts or marks read. Later, "send N" (or "send N but change it to …") sends that one draft as me in its thread. Use when I say "check my mentions", "any new Chat mentions", "send 2", "send 3 but change it to …", or when the scheduled run fires.
---

# Google Chat mentions watcher

**The scheduled run is read-only on Google Chat.** Never send, reply, react or mark read with the Chat connector during a run. The only post allowed is to my own "My Mentions" space through its webhook. Sending happens only in the "Send a draft" section, only when I say `send N`.

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
3. **Sort** each message, using the text and the messages above it:
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
5. **Nothing new → post nothing.** Just update state and stop.
6. Otherwise post ONE message (plain text JSON `{"text": ...}` to a temp UTF-8 file, then `curl -s -o /dev/null -w "%{http_code}" -X POST -H 'Content-Type: application/json; charset=UTF-8' --data-binary @<file> "<webhook>"`; delete the file):

```
*💬 <n> new mention(s) — <h:mm AM/PM> PKT*

1. <https://mail.google.com/chat/u/0/#chat/space/<spaceId>|<Space name>> · <Sender> · <relative time> · <type>
   "<the ask, one line, max ~120 chars>"
   ↳ draft <N>: "<draft text>"        (task items add: · action for me)
2. ...

_Tagged, no text: <n> — <Space names>_
_FYI: <n> — <Space names>_
_Reply with "send <N>" or "send <N> but change it to …" in Claude._
```
   Asks first, oldest first; max 10 then "+N more". Times in PKT. Show the "Tagged" / "FYI" lines only when non-zero; show the last line only when there is at least one draft.
   **Post failed** (HTTP code not 2xx): don't update state (so the next run reports the same items), send a PushNotification "My Mentions post failed (HTTP <code>) — check the webhook", and stop.
7. Update state: `lastCheck` = `now`; append every reported or FYI message id to `seen` (keep the last 500); append each new draft to `drafts` with its ids, space, sender, ask and `createdAt`; drop drafts older than 24 h; set `nextDraft`.
8. Send a PushNotification only when there's at least one ask: "<n> new Chat mention(s) — <first sender>: <short ask>".

## Send a draft ("send N" / "send N but change it to …")

Only in an interactive session, only on my explicit `send N`. Never as part of a scheduled run.

1. Read draft N **from the state file** (a new session doesn't remember the post). Not found or older than 24 h → say so and send nothing.
2. Check the thread (via `gchat-reader`): if I've already replied after the mention, say so and send nothing.
3. Text = draft N's text, or exactly my text after "change it to".
4. Send it as me with the Chat connector `send_message` (`conversationId` + `threadId` of draft N; DMs: the DM conversation).
5. Confirm: what was sent, to whom, in which space/thread, with the link. Mark draft N as sent in state. Send nothing else.
