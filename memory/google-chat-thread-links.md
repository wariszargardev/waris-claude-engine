---
name: google-chat-thread-links
description: Google Chat connector already works — read a thread from a Gmail chat link without extra setup
metadata:
  node_type: memory
  type: reference
  originSessionId: 183bdcb5-f465-4577-80f8-4a858d7741ec
  modified: 2026-10-13T09:34:08.968Z
---

The claude.ai Google Chat connector (list_messages / search_messages / send_message) is already connected for Waris. No extra integration (e.g. waqqasiqbal/google-chat-workspace-integration repo) is needed.

Link `https://mail.google.com/mail/u/1/#chat/space/<SPACE>/<THREAD>/...` maps to `conversationId: spaces/<SPACE>`, `threadId: spaces/<SPACE>/threads/<THREAD>`.

Known user ids: Waris = users/105396637252591664896, Zaib Khan = users/113495386219197844158, Waqqas Iqbal = users/107374491372558988851, Ahsan Ashfaq = users/100003347646761463026, Usman Iqbal = users/115892920502476983809.
