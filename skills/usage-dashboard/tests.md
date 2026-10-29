# usage-dashboard — test cases

| # | Case | Expected |
|---|------|----------|
| 1 | I say "open my usage dashboard" but http://localhost:4317 doesn't load. | Run `start.js --open` (starts the server if it isn't running and opens the browser); if it still fails, check `usage-dashboard\data\server.log`. Port 4317, localhost only. |
| 2 | "Why was my last blanka session so heavy?" | Get real numbers from `server.js --report` (or /api/stats), not memory; explain with baseline bag, bag max, model calls, big tool outputs, subagent tokens and any cache re-write after a 60+ min gap. |
| 3 | The same assistant message appears on 3 transcript lines. How many model calls is that? | One — calls are counted by unique message.id, deduped globally (also across resumed sessions). |
| 4 | Usage review (daily routine): one action says "use fewer tokens". OK, and where do the actions go? | No — 3–5 concrete actions, each naming the exact change (skill to shorten, plugin to disable, rule to move, habit, script), with numbers from the report; written to data\improvements.json. |
| 5 | During the usage review, should Claude shorten the long skill descriptions it found? | No — the review only writes improvements.json and posts one Morning Brief card; applying an action is a separate request. |
