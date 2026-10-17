---
name: plan-cu
description: Plan a ClickUp task without creating anything — reads the CU (and its parent), finds which branch it belongs to (the one I give, an existing open feature branch, or a new one), reads the KB doc, skill and only the relevant code from the main checkout, and writes the implementation plan, then waits. No branch, no worktree, no build, no edits; only moves the CU to "in progress - development". When I then say "approved", run start-work (setup if missing) and build the plan. Use when I say "plan this CU", "plan <cu-id>", or "/plan-cu".
argument-hint: <cu-id | CU link> [branch: <existing-branch>] [repo]
---

# Plan a CU (read-only)

**Creates nothing.** No branch, no worktree, no composer/yarn/doppler, no file edits, no commits. The only write: the CU status (step 1).

1. **Read the CU** with the `clickup-reader` subagent (task + parent + last comments; the lead then does the status write), then move it to `in progress - development` with the `cu-status-start` rules from the `start-work` skill (step 0). Repo: the one I named; else the attached project's; else `blanka`.
2. **Find the branch** with the `branch-select` rules from the `start-work` skill (step 1): my `branch: …` → else CU id / parent CU id in a branch name → else an open, unmerged PR matching the feature → else "new `<type>/<name>-<cu-id>` from develop/main". If it's ambiguous, ask me once. State the decision in the first line.
3. **Read code from where it lives:** the existing branch's worktree if it has one; otherwise the main checkout (`D:\Afia Insurance\Projects\Office\blanka`) after `git fetch` — read files at the right ref with `git show origin/<branch>:<path>` or `origin/develop` without switching branches.
4. **Workflow (Office CLAUDE.md):** KB doc + skill for the area → only the relevant code (Explore sub-agent for broad searches) → if requirements are unclear, ask.
5. **Write the plan:** branch decision, files to change, approach, logging points (feature enum), tests, KB/skill updates, risks (migrations / data changes called out). Then **stop**.

## Next

- **"approved"** → follow `start-work` from step 1 with this branch decision: create/reuse the worktree, setup, first push (new branch only), rename the chat, then build exactly this plan (start-work step 7). No commit/push of the work.
- **"/start-work"** (in this same chat) → set up the worktree and reuse this plan; wait for "approved".
- Changes to the plan → update it and wait again.
