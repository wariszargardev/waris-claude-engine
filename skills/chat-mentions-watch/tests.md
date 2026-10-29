# chat-mentions-watch — sample prompts (checker for this skill)

Re-run after every edit to `SKILL.md`: `powershell -File scripts\skill-tests.ps1 chat-mentions-watch` (dry run — Claude answers from the skill, changes nothing). Each answer must match **Expected**; a miss = fix the skill before using it.

Cases are based on real mentions (2026-09-29 → 2026-10-29) and my real first replies ("Checking", "Let me review", "Sure", "noted"); people and spaces are anonymised. Drafts are judged by intent and style, not exact wording.

| # | Situation + what I say | Expected |
|---|---|---|
| 1 | Scheduled run. A project space thread: earlier messages discuss some data-update queries; a lead dev then writes "@Muhammad Waris reviewed, run the pre-check, update by row id, and share the result" and I haven't replied | Asks me, type = task/question. Reads the 1–3 messages above the mention. Post to My Mentions shows the item with a numbered short draft like "Checking" or "Let me check and share the result." Nothing is sent in that thread. |
| 2 | Scheduled run. A vendor collaboration space: a vendor contact writes "@Muhammad Waris please assign the failed email cases to me for re-triggering" | Asks me, type = task. Draft is a short ack like "Let me review", marked as an action I must do. Not sent; the run never acts on the task itself. |
| 3 | Scheduled run. DM from a business user with no earlier context: "i dont have access to the settings page." | Asks me (any DM), type = unclear. Draft is a clarifying question, e.g. "Which environment, and what do you need to change?" Not sent. |
| 4 | Scheduled run. DM from a teammate: "can we connect?" | Asks me, type = connect. Draft "Sure". Not sent. |
| 5 | Scheduled run. Three tags: a PM's daily digest listing me in a tag list; a teammate's "email template also updated, cc @Muhammad Waris"; an image-only tag with no text | None gets a draft. Digest and cc → FYI line only. The bare/image-only tag is listed as "tagged, no text" with no draft. |
| 6 | Any draft | Short (about 1–10 words), polite, no emoji, no promises of dates or results I didn't give. English in named spaces; Roman Urdu only in a 1:1 DM where the sender wrote Roman Urdu. |
| 7 | Any scheduled run, any mentions | Reads Chat only through the `gchat-reader` agent; the lead writes the drafts. Never calls Chat send, reply, react or mark read. The only post is ONE webhook message to My Mentions (or nothing if nothing is new). Drafts with their message and thread ids are saved in the state file. |
| 8 | Later, in a new Claude session, I say: `send 1` | Reads draft 1 from the state file (not from chat memory), checks I haven't replied in that thread since, then sends exactly draft 1 as me as a reply in that mention's thread (DM: in the DM), and confirms what was sent and where. Sends nothing else. |
| 9 | I say: `send 3 but change it to: which env, test or UAT?` | Sends only my edited text for item 3 in its thread, not the original draft, and confirms. |
