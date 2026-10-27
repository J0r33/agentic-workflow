---
description: Beat 4 — Blast radius. Run /blast-radius over the whole branch, then work every item on the checklist it produces.
argument-hint: [--branch (default) | --staged]
---

# /beat-4 — Blast radius

The fourth of the five beats in `AGENTS.md`. "What might this break?" → checklist → test each item.
**No checklist, not ready.**

## Commands this beat runs

| order | command | non-negotiable |
| -- | -- | -- |
| 1 | `/blast-radius --branch` | every step, including the parallel tracers |

## Step 1: `/blast-radius --branch`

Pass `--branch` explicitly. Beat 2 ends with the work *committed*, so `git diff --cached` is empty
by now. A staged-only run traces zero files and produces a report that looks clean and means
nothing. **An empty changed-file list is a bad invocation, never a clean result.** Stop and re-run.

Do not substitute your own reading for the tracer agents. You wrote the change, which makes you the
worst-placed reader of what it might break.

Record the traced commit: `git rev-parse --short HEAD`. Beat 5 uses it to tell whether the trace is
still current.

## Step 2: Work the checklist

**Generating the checklist is not doing the beat.** This is the half that gets skipped. Run every
item and record next to it what you did, what you saw, and PASS or FAIL.

An item you judged unnecessary counts as a FAIL unless you give the reason in one sentence the
operator can read. An item that needs staging or production is marked as operator work and carried
into the PR body. Do not run it yourself, and do not quietly drop it.

## Step 3: Widen if the report says so

If the report flags a surface beat 3 did not prove, go and prove it now. The checklist is allowed to
send you backwards. That is what it is for.

## Step 4: Report, and keep the output

The traced commit, the risk level, affected features, every checklist item with its result, and
anything deferred to the operator with the reason. This output goes into the PR body's
`## Blast radius` section, and the PR quality gate requires that section.

## Rules

- No checklist, not ready.
- A checklist with unticked items is an unfinished beat.
- Sensitive surfaces (see `AGENTS.md`) get extra scrutiny.
