# start-work / plan-cu — sample prompts (checker for these skills)

Re-run after editing either skill: `powershell -File scripts\skill-tests.ps1 start-work`.

| # | What I say | Expected |
|---|---|---|
| 1 | `/start-work z8znm1bf15` (status `issues found`) | First moves the CU to `in progress - development` (status only, no other ClickUp change), reports `issues found → in progress - development`. |
| 2 | `/start-work <CU>` whose status is `comms. sent!!! done!` | Doesn't move it; says so. |
| 3 | `/start-work <US-19.x CU>` whose parent is FR-19 `86exb1kft` | Finds `feat/Alternative-Plans-Engine-86exb1kft` by the parent CU id and uses it (says so in the first line); no new branch. |
| 4 | `/start-work fix sale summary slow query` (no CU, no branch match) | New `fix/sale-summary-slow-query` from `origin/develop` with `--no-track`; worktree `Office\blanka-sale-summary-slow-query`; composer + yarn prod + doppler; one push; then plans and waits for "approved". |
| 5 | `/plan-cu <cu>` | Plan only: no branch, worktree, build or edit — only the CU status moves. |
| 6 | "approved" for a CRUD feature (API + controller + Vue pages + tests) | Contract first; `backend` + `frontend` agents in parallel; lead merges + relevant tests; `qa` + `security` + `performance` reviewers in parallel; KB + skill; **no commit, no push**. |
| 7 | "approved" for a one-file fix | Lead does it alone (no build subagents); tests; self-review; no push. |
