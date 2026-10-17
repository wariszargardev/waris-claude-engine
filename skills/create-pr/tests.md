# create-pr — sample prompts (checker for this skill)

Re-run after every edit to `SKILL.md`: `powershell -File scripts\skill-tests.ps1 create-pr` (dry run — Claude answers from the skill, changes nothing). Each answer must match **Expected**; a miss = fix the skill before using it.

| # | Situation + what I say | Expected |
|---|---|---|
| 1 | Chat attached to `Office\blanka` (main checkout on `develop`, `.mcp.json` modified). I say: `create PR` | Doesn't stop because of `develop`, and `.mcp.json` doesn't block or join the PR. Asks branch (options = my open-PR branches / worktrees) and target (develop / test / UAT / dev / main) together in one question call. |
| 2 | `create PR uat` for `feat/Alternative-Plans-Engine-86exb1kft` | Head `feat/Alternative-Plans-Engine-uat-deployment-86exb1kft`, cut from `origin/uat-env-deployment` with `--no-track`, feature merged with `--no-ff`. Never `chore/…`. |
| 3 | `create PR uat`, but `uat-env-deployment` is behind develop and the preview has a conflict in a file those develop commits touch | Stops before creating any branch; says "`uat-env-deployment` is not updated from develop" with the count + files; posts once (24h) in ENG - Code Reviews tagging Ahsan. "bypass" → posts, then continues. |
| 4 | `create PR uat` for `fix/imcrm-document-upload-validation-logging` when open UAT PR #15471 already exists | Reuses #15471 (no second PR): merges latest base + feature into its branch, rebuilds, relevant tests, notes in the PR body, label removed and re-added. |
| 5 | `create PR develop` for a branch whose UAT deploy PR is merged | Stage mode: code frozen; compares with the UAT-verified head and reverts extras; `[STAGE]` title; comment "This PR carries exactly the version verified on UAT". |
| 6 | Any target — a step would push to `develop` / `uat-env-deployment` or merge a PR | Never does it. PRs go *into* protected branches only; if blocked, stops and tells me. |
| 7 | `create PR main` for `hotfix/policy-wording-broken-links-check` | Hotfix mode into `main`, code can change, local review, label, bot loop. |
