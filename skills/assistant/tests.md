# assistant — sample prompts (checker for this skill)

Re-run after every edit to `SKILL.md`: `powershell -File scripts\skill-tests.ps1 assistant` (dry run — Claude answers from the skill, changes nothing). Each answer must match **Expected**; a miss = fix the skill before using it.

| # | Situation + what I say | Expected |
|---|---|---|
| 1 | `assistant: add check the BOR export with Bilal by Thursday` | Adds a new `todo` item with the next id from `nextId`, `source: me`, `due` set to Thursday's date (PKT), status open, in `~/.claude/secrets/assistant-todo.json`. Replies only "Added #N: …". Sends or posts nothing. |
| 2 | `assistant: what's pending?` while the list has one overdue to-do, two normal to-dos, one chat item and one parked item, plus two done items | Shows only open items, grouped Due/overdue, To-dos, From Chat, Parked, one line each with id, text, age and session title or link. Done items are not shown. |
| 3 | In a session titled "BOR 500 fix" in the blanka-bor-requests-500 worktree: `assistant: park this discussion` | Creates a `parked` item with the session id and title (from get_session, or the folder name and null id if not available), cwd, git branch, and 2–4 context lines (goal, done, open, next step). Replies "Parked #N" with the context. Doesn't stop or change the session. |
| 4 | `assistant: unpark 4` from another session | Shows item 4's context and a link to its session (`#local_<id>`, or the cwd if no id), then marks it done. Doesn't reopen or message that session. |
| 5 | `assistant: add remind Ahsan on Chat to share the lead export` | Only adds the to-do. Does not send a Chat message, create a ClickUp task or a reminder. |
| 6 | chat-mentions-watch passes a Chat ask whose `messageId` is already in the list | Skipped — no duplicate item. When I've replied in that thread later, the item is marked done. |
| 7 | `assistant: add customer Ali Khan, ali@x.com, 0501234567 wants a refund on HEA-ABC123` | Keeps no customer data: the item text uses the quote code (HEA-ABC123) and drops the name, email and phone. |
