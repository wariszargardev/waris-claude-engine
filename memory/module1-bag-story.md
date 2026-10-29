---
name: module1-bag-story
description: "The Module 1 \"bag\" story Waris learned (how a Claude Code turn works) — use it as the base when explaining concepts to him"
metadata:
  node_type: memory
  type: user
  originSessionId: 64513d7e-37b7-4d73-911c-33dea6da8650
  modified: 2026-10-19T10:06:19.287Z
---

Waris understands Claude Code through the "bag" story (Module 1, taught in Roman Urdu):
1. New session = empty bag. The harness puts in: CLAUDE.md files (full), memory (index only), skills (name + description only). Yesterday's chat is not in it.
2. His message goes into the bag.
3. The model sees only the bag; it decides (load a full skill, or request an action like `git push`).
4. The harness does the work — first checks hooks (a hook can block), then runs it and puts the result in the bag.
5. Loop back to 3 until done.
6. Bag full → old content gets summarized, small instructions can get lost → `/compact` with instructions or a new session.

Four things to remember: model sees only the bag; model only asks, harness does; rule = instruction (usually followed), hook = guard (always blocks); new session = empty bag, only files come back each time.
Quiz he was given: without the hook, with only "never push to develop" in CLAUDE.md — can a push to develop happen? Answer: yes, it can (a rule is followed most of the time, only a hook guarantees the block).

**How to apply:** when explaining new Claude Code ideas to him, build on this story and these 4 points, in short Roman-Urdu-friendly plain English. Related: [[claude-code-learning-plan]], [[user-profile-and-pain-points]]
