---
name: assistant
description: My personal assistant — holds my to-do list and parked discussions across all Claude sessions. Use when I type "assistant: add …", "assistant: what's pending?", "assistant: done N", "assistant: park this discussion", "assistant: unpark N", "assistant: drop N", or ask "what's on my list", "what did I park". Also receives Chat asks from chat-mentions-watch (source = chat). Keeps everything in one local file; never sends, posts or changes anything outside that file.
---

# Personal assistant

One list, shared by every session: `C:\Users\Muhammad Waris\.claude\secrets\assistant-todo.json` (outside git, never print the whole file, never share it).

```json
{"nextId": 1, "items": [
  {"id": 1, "type": "todo|parked", "text": "<one line>", "status": "open|done|dropped",
   "createdAt": "<ISO UTC>", "doneAt": null, "due": null,
   "source": "me|chat|session",
   "session": {"id": "<local_… or null>", "title": "<session title>", "cwd": "<folder>", "branch": "<git branch or null>"},
   "context": "<2–4 lines: where it stands, next step>",
   "link": "<Chat / ClickUp / PR link or null>",
   "messageId": "<Chat message id, chat items only>"}
]}
```
Missing file → create it with `{"nextId": 1, "items": []}`. Ids are never reused.

## Commands

| I type | Do |
|---|---|
| `assistant: add <text>` (optional "by <day>") | New `todo`, `source: me`, `due` as ISO date if I gave one (PKT). Reply: `Added #N: <text>`. |
| `assistant: what's pending?` / "what's on my list" | Open items only, grouped: **Due/overdue** (by due date), **To-dos**, **From Chat**, **Parked**. One line each: `#N · <text> · <age> · <session title or link>`. Nothing open → "Nothing pending." |
| `assistant: done N` (or several: `done 3 5`) | `status: done`, `doneAt` = now. Reply `Done #N`. |
| `assistant: drop N` | `status: dropped`. |
| `assistant: park this discussion` (optional note) | New `parked` item from **this** session: `session.id` and `session.title` from `mcp__ccd_session_mgmt__get_session` (current session; if not available, use the cwd folder name as title and `id: null`), `cwd`, `branch` (`git branch --show-current`), and `context` = 2–4 lines I would need to pick it up: the goal, what is done, what is open, the next step. Reply `Parked #N` + the context lines. |
| `assistant: unpark N` | Show item N's context and its session as a link `[title](#local_<id>)` (or the cwd if no id), then mark it `done`. Don't reopen or change that session. |

## Rules
- Only this file changes. Never send a message, post, comment, create a ClickUp task or reminder from here.
- No secrets, tokens, passwords or customer data (names, emails, phones, Emirates ID) in `text` or `context`. Quote codes and CU ids are fine.
- Chat items (`source: chat`) are added by `chat-mentions-watch`: skip if an item with the same `messageId` exists. When the watcher sees I've replied in that thread, it marks the item `done`.
- Keep `done`/`dropped` items 30 days, then remove them.
- Replies are short. Dates and ages in PKT.
