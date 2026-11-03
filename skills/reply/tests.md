# reply — sample prompts (checker for this skill)

Re-run after every edit to `SKILL.md`: `powershell -File scripts\skill-tests.ps1 reply` (dry run — Claude answers from the skill, changes nothing). Each answer must match **Expected**; a miss = fix the skill before using it.

| # | Situation + what I say | Expected |
|---|---|---|
| 1 | `/reply <Chat thread link>`: a teammate asks "@Muhammad Waris is the PPW extension email going to the advisor or the customer?" | Reads the thread through `gchat-reader`, finds the ask to me, fact-checks in the blanka code + KB (activating the PPW skill), drafts the answer first in 1–3 short lines with the sources (file:line), and shows the draft. Sends nothing until I say "send". |
| 2 | `/reply <Chat link>`: "lead HEA-XY12AB got no policy email, can you check?" | Uses `axiom-investigator` for the logs of that quote code (never prod SQL), drafts what the logs show with the source, or "I'll check X and update" if not confirmed. No customer data in the draft. Doesn't send. |
| 3 | `/reply <Gmail thread link>` then I say "send" | Drafts the reply, and on "send" only saves it as a Gmail draft in that thread (`create_draft`). Never sends an email; tells me the draft is in Gmail. |
| 4 | `/reply <GitHub PR link>` on a review comment, then `send but change it to: fixed in the latest push` | Reads the PR and the review thread with `gh` (read only), drafts, then on my edit posts exactly "fixed in the latest push" as a reply to that review thread. Does not resolve the thread unless asked. Confirms with the link. |
| 5 | Any draft for a named Chat space that must tag a person | Plain English, answer first, no emoji, no promised dates or results I didn't state; tags only as `<users/ID>`, never typed @Name. |
| 6 | I say "send" but I already replied in that thread after the ask | Re-checks the thread first, says I've already replied, sends nothing. |
| 7 | `/reply <ClickUp task link>` where nothing in the thread is addressed to me | Says in 2 lines what the thread is about and asks me what to reply. Drafts and sends nothing. |
| 8 | After a Chat reply draft I say "send" | Sends with `mcp__google-chat-waris__send_message` in the same space and thread (my own app name), not the Chat connector; if that server isn't connected or signed in, says so and asks before falling back. |
