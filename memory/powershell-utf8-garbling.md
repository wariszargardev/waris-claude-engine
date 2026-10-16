---
name: powershell-utf8-garbling
description: "Windows PowerShell 5.1 Get-Content reads UTF-8 (no BOM) files as ANSI and garbles ✅ → – into \"âœ…\"; build or concat HTML with Bash or the Write tool"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 5b9e8bb9-6adf-4cd0-b648-8976abe834fe
  modified: 2026-10-14T06:48:15.252Z
---

On 2026-10-14 the Module 3 and Module 4 lesson pages and the morning-brief dashboard went out garbled ("âœ… #1", "â€“"). The cause: I assembled them with PowerShell 5.1 `Get-Content -Raw`, which reads UTF-8 files that have no BOM as ANSI. Muhammad noticed it.

**Why:** PS 5.1 defaults to the system ANSI codepage, and files written by the Write tool are UTF-8 without a BOM.
**How to apply:** concatenate or transform text files with Bash (`cat`, `awk`, `sed`), or write the whole file with the Write tool. If PowerShell is unavoidable, pass `-Encoding UTF8` on every Get-Content and Set-Content. Before publishing an artifact, grep it for `â`. Related: [[report-design-preference]].
