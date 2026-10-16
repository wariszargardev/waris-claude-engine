---
name: chat-mentions-watch
description: Every-30-minutes watcher for my Google Chat — finds new messages that @mention me or DM me, across all spaces, that I haven't answered, and posts only the new ones to my "My Mentions" Chat space. Never replies, reacts or marks anything read. Use when I say "check my mentions", "any new Chat mentions", or when the scheduled 30-minute run fires.
---

# Google Chat mentions watcher

**Read-only on Google Chat.** Never send, reply, react or mark read with the Chat connector. The only post allowed is to my own "My Mentions" space through its webhook.

- Me in Chat: `users/105396637252591664896`. Timezone Asia/Karachi (PKT).
- Webhook: `C:\Users\Muhammad Waris\.claude\secrets\gchat-mentions-webhook.txt` (never print or log it).
- State: `C:\Users\Muhammad Waris\.claude\secrets\mentions-state.json` — `{"lastCheck": "<ISO UTC>", "seen": ["<messageId>", ...]}`. Missing → `lastCheck` = 30 minutes ago, `seen` = [].

## Steps

1. Read state. Window start = `lastCheck` minus 2 minutes (overlap so nothing slips between runs). Record `now` (UTC) before searching.
2. Google Chat `search_messages`:
   - `{mentionsMe: true, startTime: <window start>}`, `pageSize: 100`, follow `nextPageToken`.
   - `{conversationTypes: ["DIRECT_MESSAGE","GROUP_CHAT"], startTime: <window start>}`, `pageSize: 100` — DMs/group chats to me even without an @mention.
3. Drop: messages already in `seen`; messages from me; non-HUMAN senders; spaces named "Morning Brief" or "My Mentions"; alert spaces (name contains "Alert", "Monitoring", "Release Notes").
4. Drop answered ones: `list_messages` on the message's `conversationId` + `threadId` (DMs without threads: the conversation) with `startTime` = its `createTime`. Any later message from `users/105396637252591664896` → answered, drop.
5. Classify: **Asks me** (I'm addressed or asked: "can you", "please", "?", "ETA", "join", "check", "connect", or any DM) vs **FYI** (I'm only in a `cc:` line / tag list with no ask).
6. Space names: `search_conversations` (`pageSize: 1000`) → `conversationId` → `displayName`; DMs → "DM · <sender>". Replace `<chat-user data-user="users/…">` tags with the known display name, "@me" for me, otherwise drop the tag.
7. **Nothing new → post nothing.** Just update state and stop.
8. Otherwise post ONE message (plain text JSON `{"text": ...}` to a temp UTF-8 file, then `curl -s -o /dev/null -w "%{http_code}" -X POST -H 'Content-Type: application/json; charset=UTF-8' --data-binary @<file> "<webhook>"`; delete the file):

```
*💬 <n> new mention(s) — <h:mm AM/PM> PKT*

1. <https://mail.google.com/chat/u/0/#chat/space/<spaceId>|<Space name>> · <Sender> · <relative time>
   "<the ask, one line, max ~120 chars>"
2. ...

_FYI (cc only): <n> — <Space names>_
```
   Asks first, oldest first; max 10 then "+N more". Times in PKT. Only show the FYI line if there are FYIs.
9. Update state: `lastCheck` = `now`; append the posted/dropped-as-FYI message ids to `seen`; keep only the last 500 ids.
10. Send a PushNotification only when there's at least one **Asks me**: "<n> new Chat mention(s) — <first sender>: <short ask>".
