# LinkedIn and job-search decisions (2026-11-10)

What we decided for my CV, LinkedIn profile and posting, and why. The private files (CV with contact details, full profile text) are in `work-notes/personal-track/career/`, which is git-ignored.

## Goal

Get a senior Laravel / full stack role, remote or with relocation to the UAE, Saudi Arabia or Europe. LinkedIn should bring recruiters and engineering managers from those places, not only students.

## Profile and CV (done)

- **Title everywhere:** Senior Software Engineer at myAlfred. Earlier roles: Full Stack Engineer at Programmers Force and at Eventbuizz; Full Stack Developer at Techcon.
- **Headline:** Senior Full Stack Developer | PHP, Laravel, Vue.js, React | AI Tooling: Claude Code, MCP | Insurance Tech, KYC/KYB | 7+ yrs | Open to remote and relocation.
- **AI work shown at a small, factual level:**
  - a read-only MCP server in Laravel (11 tools, Sanctum tokens, permissions, rate limits, read replica, 67 Pest tests) that lets AI assistants diagnose the recommendation engine;
  - this engine (24 skills, 5 agents, 4 safety hooks, 12 routines).
  - No company names, internal names or data.
- **CV:** one page, with an "Open to new roles" line, plus WhatsApp, email, LinkedIn and GitHub in the header.
- **GitHub profile README:** updated with the same story and published on github.com/wariszargardev.
- **LinkedIn:** headline, About, all four job descriptions, skills (Claude Code, MCP, Amazon SQS, AI-Assisted Development, Query Optimization, Third-Party API Integration) and Open to Work job titles updated. Open to Work stays visible to everyone.

## Why posts weren't bringing followers (analytics, 2026-11-10)

- 6,297 followers, but most posts reached only 30–70 people (about 1% of followers). There were 11 engagements in 7 days.
- One week had 8 posts on eager loading, because the deep-dive parts were posted one by one. Some were reposted or edited after posting.
- Generic tips, with no image or carousel, 5 hashtags and no replies to comments.
- The only strong post was a story ("one word made a slow page 10x faster"): 646 impressions, 6 comments.
- The audience leans to Lahore and entry-level developers, not the hiring audience.

## Posting plan (decided)

| Day | LinkedIn post | Source |
|---|---|---|
| Tue | A real work story (`built`, or `lesson` if the last one was `built`) | `linkedin-post` skill + `linkedin-draft` routine (Tue 9:30) and `linkedin-reminder` (Tue 11:00) |
| Wed | Laravel post + `carousel.pdf` | Build Real Code content pack |
| Thu | AI tooling post + `carousel.pdf` | Build Real Code content pack |
| Mon, Fri | Nothing on LinkedIn | YouTube and Facebook stay daily |

Rules:
- 3 posts a week, never daily. Deep-dive parts never go on LinkedIn on their own; they are slides in the day's carousel.
- Post at 10:00 AM PKT, once. No reposts, and no edits in the first hour.
- Exactly 3 hashtags. End with a specific question. Always attach an image or carousel; never put code in plain text.
- Content mix target: 40% work stories, 30% tips with my opinion, 20% AI tooling, 10% career.

## Content pack changes (`D:\Social Media\content-pack`)

- `_source/build.mjs`: LinkedIn days are now Wed and Thu only. Other days and all deep-dive parts say "not posted" (the text is kept as a spare). LinkedIn text gets 3 hashtags. The schedule shows "story" on Tue and "✅ carousel" on Wed and Thu.
- New `_source/carousel.mjs`: builds `carousel.pdf` (1080×1350) for each Wed/Thu day. Slides: cover, main tip, each deep-dive part (max 6), then a closing "Which one do you use? Follow" slide. 76 carousels were made from 2026-11-11.
- The old source is backed up in `_source.bak-2026-11-10`.

## Daily engagement (15 min)

- Before posting: a real 2–3 line comment on 3 posts from Laravel/Vue creators or UAE tech leaders.
- First hour after posting: reply to every comment.
- 5–10 connection requests a day to engineering managers, CTOs and tech recruiters in Dubai, Abu Dhabi and Riyadh, with a one-line note.
- Track weekly: new followers, profile views and recruiter messages, not impressions.

## Still open

- Real end dates: Programmers Force (LinkedIn says Nov 2023, but myAlfred starts Oct 2023) and Techcon (LinkedIn says Sep 2021, but Eventbuizz starts Aug 2021).
- Location: LinkedIn says UAE and the CV says Pakistan. Pick one.
- Verify identity on LinkedIn. Pin the Featured section (best story post, YouTube, GitHub). Ask 2–3 people for recommendations.
- Make `waris-claude-engine` private, or publish a cleaned copy. It is public and holds office rules and workflow details.
- The `feat/re-insights-mcp` branch isn't merged yet. In interviews, describe it as built and tested, not live.
