---
description: Beat 2 — Design, challenge, build. Run /design in full, wait for the operator's pick, attack it with the dissenter, then build in small scoped commits.
argument-hint: <ticket id; defaults to the ticket on the current branch>
---

# /beat-2 — Design, challenge, build

The second of the five beats in `AGENTS.md`. Beat 1 must already have run.

## Input

$ARGUMENTS

A ticket id. If none is given, infer it from the branch name and say which ticket you inferred.

## Commands this beat runs — in this order, in full

| order | command | non-negotiable |
| -- | -- | -- |
| 1 | `/design <ticket>` | every phase, including the parallel research agents |
| 2 | the `dissenter` agent on the chosen design | then a `claim-checker` on each concern it raises |

**The failure this beat prevents is not skipping a command outright. It is running one and then
quietly cutting phases.** In the project this workflow came from, a planning command was run with
one research phase cut "because earlier research covered it". The adversarial phase that did run
then found the plan resting on a miscounted inventory. The adversarial phase caught it, and the
cut phase is why there was something to catch.

So this rule is absolute on purpose. "Skip a phase if it repeats an earlier one" was considered and
rejected: that test returns true on exactly the phase that was cut. Duplication between phases is
fixed by **editing the prompts in a reviewed change**, never by an agent deciding at run time that
a phase is redundant.

## Step 1: `/design`

Run every phase. Research agents run in parallel, in one message. Do not replace them with your own
reading. The docs check runs whenever the change touches a fast-moving dependency.

`/design` ends by asking the operator to choose. **That is a real gate. Stop and wait.**

## Step 2: Attack the chosen design

Once a design is chosen, give it to the `dissenter` agent with the ticket and the relevant files.
Its job is to find why the design is wrong, not to polish it.

For each concern it raises, have a `claim-checker` confirm or refute it against the code. If they
disagree, resolve it yourself with evidence before building. This is the step that catches wrong
plans. It is never optional.

## Step 3: Build

- Small, conventional, scoped commits: `type(TICKET): description`.
- Commit only what the ticket needs. Never sweep in unrelated working-tree changes.
- Schema changes ship as new migration files. Never edit a migration that has been applied
  anywhere.

## Step 4: Report

The chosen design and why, what the dissenter raised and how each point was resolved, the commits
made, and anything the research changed about the ticket.

## The one bounded exception

The full beat costs 10–20 agent runs plus an operator decision. That is right for a migration, an
auth change or anything on the money path. It is not right for a typo in a comment, and pretending
otherwise is how a process gets abandoned wholesale.

You may skip `/design` and go straight to building **only when all of these hold**:

- the diff is under ~20 lines, and
- it touches no migration, server function or CI workflow, and
- it touches none of the sensitive surfaces listed in `AGENTS.md`, and
- it changes no behaviour a user or a gate can observe.

**Say so out loud:** "Taking the reduced beat-2 path: <which conditions hold>." A stated exception
can be audited; an unstated one is the failure this beat exists to prevent. If you are unsure
whether a condition holds, it does not hold.

## Rules

- Do not open a PR. That is beat 5.
- If you find yourself writing "we already have coverage from earlier, so I'll skip X", run X.
