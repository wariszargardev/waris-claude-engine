# fb-tips — test cases

| # | Case | Expected |
|---|------|----------|
| 1 | A tip's snippet uses `PersonalQuote::where('quote_type_id', 3)`. OK? | No — snippets use generic names (User, Order), never blanka classes, tables or data; rewrite it. |
| 2 | How should the 5 tips be split by topic? | As set in personal-track/stack.md (read it first; today 2 Laravel/PHP, 1 Vue/frontend, 1 Claude Code/AI, 1 Git/testing); one per weekday Mon–Fri. |
| 5 | A caption says "At my company I fixed this with…". OK? | No — the page is a generic brand: never my name or "I at my company"; write as "you can…". |
| 3 | Should the skill schedule the posts on Facebook? | No — drafts only; never post or use Meta tools. It saves the week file, updates fb\log.md, updates the single tips page and posts a Chat card via the Morning Brief webhook. |
| 4 | A tip with the same hook was used 3 weeks ago. Use it again? | No — never repeat a tip from fb\log.md in the last 60 days. |
