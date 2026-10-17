# Rules — Muhammad Waris (Office)

_Scope: work under `D:\Afia Insurance\Projects\Office\` (blanka and the other office repos). Procedures live in skills; this file holds only the rules that apply everywhere._

## Communication
- Reply in short, plain English. I may write in Roman Urdu; understand it, answer in English.
- Give the answer first. Explain more only if I ask.
- When a task is done, end with a short status: what changed, what was tested, what is pending.

## When to ask me
- **Ask (plan + wait for "approved"):** only before writing or changing code for a feature, fix or hotfix.
- **Don't ask, run end to end:** branch/worktree setup, "create PR", deploys, stage/prod PRs, PR comments, clearing a worktree, release-tracker updates. My request is the approval; only the skill's hard stops can stop it.
- Always ask before DB migrations, data changes, or anything that changes test/UAT/stage/prod outside those skills.

## Company engine first (alfred-orchestrator)
- Team standard: `Office\claude` (`InsuranceMarket-ae/claude`), linked as `waris-claude-engine/company/alfred-orchestrator`. My rules are a layer on top.
- Before starting work: `git -C "D:\Afia Insurance\Projects\Office\claude" fetch`; behind → `git pull --ff-only` and tell me to run `/plugin marketplace update alfred` + `/reload-plugins`.
- Use its skills and agents before improvising (pickup-cu/verify-cu, kb-builder, planner, qa/security/performance reviewers, find-bugs, pr-writer, git-worktree-discipline) and follow its conventions (`knowledge-base/`, `plans/`, one worktree per feature, push once).
- On a clash my approval gates win (no bypass mode, no autonomous orchestrate-feature unless I ask); point out other clashes. Never edit the company repo for personal work.

## Workflow (feature / fix / hotfix)
1. Analyze: CU → KB doc + skill for the area → only the relevant code (Explore sub-agent for broad searches). Unclear requirements → ask.
2. Plan: files, approach, logging points, tests, KB/skill updates, risks. Stop for "approved"; no edits before.
3. Implement exactly the plan; anything new → stop and update the plan with me.
4. Run only the relevant tests. 5. Self-review with `pr-review` (or `/code-review`), fix gaps, report.

## Code
- No code comments unless I ask. Follow the file's and repo's existing style.
- Add or update tests for changed behaviour and run them before saying it's done.

## Logging (blanka / IMCRM)
- Log at entry, key decisions, external calls, failures and the final result.
- Every entry point (controller action, job/command `handle`, listener) starts with `LoggerService::startQuoteLogging($lead, LoggerFeatureEnum::<FEATURE>)`, or `startFeatureLogging(LoggerFeatureEnum::<FEATURE>)` when there's no lead. Add an enum case if none fits.
- `LoggerService::info('<clear message>', [<context>])` — exactly two params. Errors: `LoggerService::error('<message>', [<extra>], $exception)`.

## Feature deliverables (every feature / fix / hotfix)
- Before "done": a KB doc `knowledge-base/<feature>/README.md` (flow, entry points, rules, logging, config, tests) and a repo skill `.claude/skills/<feature>/SKILL.md` (points to the KB, how to debug in Axiom). Update existing ones first; never duplicate.
- Skill `description` ≤1024 chars (aim <900), folder = `name`. The skill-check hook copies it to `~/.claude/skills` and zips it to `Office\skills-upload\` — tell me to re-upload the zip. List KB + skill paths in the status.

## Git (safety — always)
- Never commit or push unless I ask ("create PR", a deploy, a release PR). Only exception: `/start-work` pushes a new branch once after setup.
- **Protected** in company repos (list in `waris-claude-engine/hooks/protected-branches.json`; today `main`, `develop`, `test-env-deployment`, `uat-env-deployment`, `new-dev-env-deployment`): I may open PRs *into* them, but never push, commit, merge, reset or delete on them, and never merge a PR — even if GitHub doesn't protect them. A human merges. The `protect-branches` hook blocks it; don't work around it, stop and tell me.
- Never force-push, rebase shared branches, or delete branches without asking.
- "Already used by worktree at …": don't force; `git pull` there if clean (else stop and tell me), then come back.

## Which skill does what
| I say | Skill | Never break |
|---|---|---|
| plan a CU / start work / "approved" / existing-branch fix | `plan-cu`, `start-work` | moves CU to "in progress - development" first; worktree per task under `Office\`; no push after the first |
| create PR / deploy — any target: develop (stage), test, UAT, dev, main (hotfix/prod) | `create-pr` (`/deploy-env <env>` is a shortcut; + `pr-bot-loop`) | asks the target if I didn't say; PRs go *into* protected branches, never push/commit/merge on them; feature fixes only in the feature branch; stage/prod ship exactly the verified version; stop if an env base isn't updated from develop (ping Ahsan); deploy branch = feature name with `-<env>-deployment` before the CU id (`feat/X-86abc1234` → `feat/X-uat-deployment-86abc1234`); bot comments that only need answers → reply + resolve, label stays; code fix → remove label → fix in feature branch → re-merge → review → push → re-add label |
| PR comments | `pr-comments` | fixes go in the feature branch, never in a deploy/base branch |
| clear the worktree | `clear-worktree` | stop on uncommitted/unpushed work; remote only with "both local and remote" |
| track / untrack / release status | `release-tracker` | data lives on the claude.ai page, never in chat or files |
| any log question / ClickUp reads / git+PR mechanics | subagents `axiom-investigator` (Sonnet) / `clickup-reader` (Haiku) / `pr-plumber` (Haiku) | they only fetch or run mechanics and return a summary; the lead (main chat) makes every decision. FE+BE work: contract first, then `backend` + `frontend` in parallel, then the reviewers in parallel (start-work step 7) |
| prod data fix / DB change / lead stuck in prod | `prod-data-change` | I never run SQL on prod — Waris does; order: investigate → read queries → impact review (models/observers) → **backup script first** → change by primary key in a transaction → rollback → Waris runs → verify + CU note → draft the fix CU |
| morning brief, mentions, ClickUp inbox | `morning-brief`, `chat-mentions-watch`, `clickup-my-threads`, `clickup-release-status` | read-only outside their own outputs |

## My engine (waris-claude-engine)
- My setup lives in `D:\Afia Insurance\Projects\Office\waris-claude-engine` (git, `wariszargardev/waris-claude-engine`); `~/.claude` links into it.
- New personal skill → `waris-claude-engine/skills/<name>/` + run `install.ps1`. Feature skills stay in their repo. Changed `settings.json` → `scripts/snapshot.ps1`. Never commit secrets, webhooks or prod data.
- **Maker and checker for skills:** a skill with a `tests.md` isn't done after an edit until `scripts/skill-tests.ps1 <skill>` passes every case (a fresh Claude answers from the skill, a second one grades it). A failing case means fix the skill (or a wrong test), never ignore it. New important skill → add 3–7 real cases to its `tests.md`.
- If I repeat the same multi-step process, suggest turning it into a skill.
