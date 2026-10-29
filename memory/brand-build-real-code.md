---
name: brand-build-real-code
description: "Muhammad's public dev brand \"Build Real Code\" (YouTube @BuildRealCode + Facebook page); brand files in D:\\Social Media; LinkedIn stays personal"
metadata:
  node_type: memory
  type: project
  originSessionId: 5b9e8bb9-6adf-4cd0-b648-8976abe834fe
  modified: 2026-10-21T06:44:18.783Z
---

On 2026-10-20 Muhammad set up a generic developer brand called **Build Real Code**. It covers the YouTube channel (renamed from his university-era channel, 1.96K subscribers) and a new Facebook page, with no personal name on either. LinkedIn stays personal (Muhammad Waris, 6K followers, https://www.linkedin.com/in/muhammadwaris-dev/ since 2026-10-20) and links to the brand.

- **Brand files:** `D:\Social Media\` (moved there from the Desktop on 2026-10-20). Logo jpg, YouTube banner, Facebook cover, LinkedIn banner, wordmark, plus thumbnail and Shorts-cover templates. Each has an .html source and a .png. PNGs are rendered with headless Edge, and the per-video templates take the title from `?l1=&l2=`.
- **Rules** (colors, tagline, categories, not technologies): `waris-claude-engine/personal-track/stack.md`.
- **Launch Kit (copy-paste setup text, clean-up guide, checklist):** https://claude.ai/artifact/HSW1KkcwW3LDjbv4h6Q4Lo. Also tip-card.html (1080², params n/topic/l1/l2/code) and welcome-post.png.
- **Channel audit and revamp plan:** https://claude.ai/artifact/TuXbbx4acHPsVZBKpY3wTe. Rollout starts the week after 2026-10-20: Mon YouTube setup, Tue clean-up, Wed playlists and titles, Thu Facebook + LinkedIn, Fri trailer + first Shorts.
- **90-day content pack (built 2026-10-21):** `D:\Social Media\content-pack\`. It covers Mon 2026-10-26 → Fri 2027-02-26, weekdays only, 90 posts, in the rhythm Mon Laravel / Tue Vue / Wed Laravel / Thu AI / Fri Git+Testing. Each day folder has post.md (FB, LinkedIn, YT title/desc/tags, Shorts script) + card/short-cover/thumbnail PNGs. The data is in `_source/weeks-*.mjs` and `node _source/build.mjs` rebuilds it. The Shorts plan is a hybrid: screen recording + his own voice + AI captions, with no AI avatars. Check this pack before writing new tips, so topics don't repeat. On 2026-10-21 he asked to extend the pack to 90 days (ending Fri 2027-02-26), and the fb-tips-batch scheduled task was paused because of it. Resume it (and linkedin-draft, if he paused it) around 2027-02-22.
- **He prefers that I render brand assets myself** (crisp text, exact sizes) over Gemini output, because Gemini garbles small text and code.

**Why:** projects-based videos are his best performers, the audience is Urdu/Hindi students, and the brand must survive a change of stack.
**How to apply:** for any banner, thumbnail or cover, edit the html in D:\Social Media and re-render. Never put his name on the YouTube or Facebook brand. Related: [[claude-code-learning-plan]], [[report-design-preference]].
