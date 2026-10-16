---
name: clickup-my-threads
description: My ClickUp inbox for tasks that are not done — reads the comment threads on every task assigned to me and tells me where I'm @mentioned and still owe a reply, where someone reported an issue found, and where a new requirement or change was asked. Skips done, rejected and closed tasks. Use when I say "my ClickUp threads", "where am I mentioned", "what do I need to reply to", "any issue found / new requirement on my tasks", or "ClickUp inbox".
argument-hint: [days=7]
---

# ClickUp — my threads (not-done tasks)

Read-only. Never post, edit, change status or assign anything.

- Me: Muhammad Waris, ClickUp user id `73270543` (confirm with `clickup_resolve_assignees(["me"])` if a call fails).
- Window: comments from the last `<days>` days (default 7). Older threads only count if my mention is still unanswered.

## 1. Get my not-done tasks

`clickup_filter_tasks` with `assignees: ["73270543"]`, `include_closed: false`, `subtasks: true`, `order_by: updated`. Page until `has_more` is false.

Drop tasks whose status contains: `done`, `rejected`, `closed`, `cancel`, `duplicate`, `won't fix`.
`comms. sent! in production` is live but not done — keep it only if it was updated within the window (post-release issues show up there).

## 2. Read the threads

For each task (most recently updated first, max 40 tasks):
1. `clickup_get_task_comments(task_id)`.
2. For any comment with `reply_count > 0` that's inside the window or mentions me: `clickup_get_threaded_comments(comment_id)`.
3. Skip tasks with no comment inside the window and no open mention.

## 3. Classify (one task can hit several)

| Bucket | Rule |
|---|---|
| 🔴 **Needs my reply** | A comment or reply contains `@Muhammad Waris` (or `@Waris`), written by someone else, and I haven't commented in that task/thread after it. |
| 🟠 **Issue found** | Task status is `issues found`, or a comment in the window says the fix/feature isn't working: "issue found", "not working", "still", "bug", "failed", "error", "reopen", "again", "wrong", screenshots after a "ready to test" status. |
| 🟣 **New requirement / change** | Task status contains `new requirement`, or a comment asks for something beyond the original task: "new requirement", "also need", "can we add", "change request", "additionally", "enhancement". |
| ⚪ **FYI** | I'm mentioned only in a `CC:` line, or the comment is a plain update. List under FYI, don't count as pending. |

Judge by meaning, not only keywords. My own comments never count as pending.

## 4. Output

```
📬 ClickUp threads — <date> (last <days> days)
<N> need my reply · <N> issue found · <N> new requirement · <N> FYI

🔴 Needs my reply
1. <Task name> — <status>
   <Author>, <relative time>: "<one-line gist of what they asked>"
   🔗 <task url>
...
🟠 Issue found
...
🟣 New requirement / change
...
⚪ FYI (short list: task + one line)
```

- Sort each bucket by oldest unanswered first.
- Quote at most one short line per comment; summarise the rest.
- If nothing is pending: "Nothing waiting on you in ClickUp for the last <days> days."
- Note: this only covers tasks assigned to me. Mentions on tasks I'm not assigned to aren't visible to these tools — say so at the end in one line.
