---
description: Beat 5 — Review & open PR. Run /review, fix or refute every finding, then /open-pr, then STOP. The operator merges by hand.
argument-hint: [optional ticket id; defaults to the current branch]
---

# /beat-5 — Review & open PR

The last of the five beats in `AGENTS.md`. Beat 4 must have produced a worked checklist.

**This beat never merges.** It ends at an open PR and a handoff.

## Commands this beat runs — in this order, in full

| order | command | non-negotiable |
| -- | -- | -- |
| 1 | `/review` | at least the senior reviewer **and** the dissenter; wider on sensitive surfaces |
| 2 | `/open-pr` | the freshness check, the build, the template, the draft PR |

## Step 1: `/review`

The dissenter exists to disagree with you. Do not soften its prompt, pre-empt its findings, or
dismiss a finding because you already thought about it.

Then **deal with every finding**: fix it, or refute it in one line with evidence. A review whose
findings you noted and moved past is not a review.

If the diff touches a gate (a CI job, an assertion script, anything that can go red), work through
"Gates must fail closed" in `AGENTS.md` before accepting the review as complete.

## Step 2: Is the trace still current?

Review fixes are new commits made *after* beat 4 traced the branch, so they are untraced. The same
goes for a rebase onto a moved `dev`.

```
git rev-parse --short HEAD   # compare with the commit beat 4 recorded
```

Same commit: the trace holds. Different commit: re-run `/blast-radius --branch` and work the new
items. Never carry a trace that no longer matches the code.

## Step 3: `/open-pr`

It verifies the build, fills the template with beat 4's worked checklist and the proof from beat 3,
pushes the feature branch and opens a **draft** PR.

## Step 4: Move the ticket to In Review

Attach the PR link. Do not move it to Done: merging closes it, and merging is the operator's.

## Step 5: STOP

- **Never merge.** Not the button, not the API, not `gh`, not auto-merge.
- Never approve a gate on the operator's behalf. Report CI as fact once it settles.
- Never verify against a deployed environment. Explain how; the operator runs it.
- Do not mark the PR ready for review unless the operator asked.

Report: what review found and how each finding was resolved, the PR link, CI results as facts, and
exactly what is now waiting on the operator.
