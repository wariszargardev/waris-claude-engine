# dev-trends-digest — test cases

| # | Case | Expected |
|---|------|----------|
| 1 | A Laravel blog post from 12 days ago shows up in search. Include it? | No — only items published inside the window (default 7 days). |
| 2 | The search finds 6 Try-worthy items. How many get "Try"? | At most 3 Try in total; the rest become Watch (or Ignore). Max 5 items per topic. |
| 3 | Where is the page published on the second run? | To the same URL stored in work-notes\personal-track\urls.json key devTrends — never a second page. |
| 4 | How is the Chat card sent? | Via the webhook in secrets\gchat-webhook.txt (Morning Brief), never the Chat connector send_message; never print the URL; expect 200, retry once, push notification on failure. |
| 5 | What must every item contain? | What (one line), why it matters for us (tied to blanka or my Claude setup), verdict Try/Watch/Ignore, and a primary-source link. |
