---
description: Close out a release wave. After several agents land PRs and CI settles, harvest unfiled findings into the tracker, update the operator QA list, correct anything the wave proved wrong, and record durable lessons. Never merges.
argument-hint: [optional PR numbers or ticket ids; defaults to every PR opened or merged this session]
---

# /wave-sweep — close out a wave

The five beats cover one **ticket**. Nothing covers a **wave**: several agents landing PRs at once,
whose findings, corrections and operator-only checks only make sense together.

Run this after beat 5 has finished across the wave and CI has settled. It replaces no beat.
**It never merges and never touches a deployed environment.**

## Why it exists

An agent records a limitation in its PR body. The PR merges. The tracker auto-closes the ticket.
**The limitation is gone.** In the project this came from, one such unfiled follow-up sat for weeks
and turned out to be a live security gap.

## Phase 1: Set the boundary from evidence

Work from git and the PR list, not from memory of what the agents said:

```
git fetch origin
gh pr list --state merged --limit 30 --json number,headRefName,mergedAt
gh pr list --state open   --limit 30 --json number,headRefName,mergeStateStatus
git log --oneline <wave-start>..origin/dev
```

Fast-forward your checkout first. A stale checkout quietly breaks every later phase.

List PRs merged, PRs still open, tickets touched, and tickets that auto-closed.

## Phase 2: Harvest from the artifacts, not the summaries

For each PR, read the **PR body** and the **ticket comments**. That is where agents write down what
they deliberately did not do. Collect:

1. Findings with no ticket ("pre-existing, not mine", "worth a ticket", "left out deliberately").
2. Limitations recorded on a ticket that is about to close. These are the most valuable.
3. Operator-only checks that an agent could not run.
4. Claims the wave proved wrong: a ticket premise, a doc, a comment, or something *you* said.
5. Cross-PR interactions: two branches whose order matters, or a new gate another PR would trip.

## Phase 3: Verify before you write anything down

**Every finding gets checked at its source before it goes into the tracker.** Agents' claims reach
tickets untested more often than you would expect, and a wrong claim in a ticket becomes someone
else's instruction.

- Read the actual file and line.
- For a claim about a gate, reproduce the **conditions** (flags, cache, tool version), not just the
  verdict.
- When two agents disagree, find which revision each was reading. Usually both are right about a
  revision and one is wrong about the world.
- A grep is not a census. Comments and regexes match too.

## Phase 4: Search the backlog before filing

Search the **surface the problem touches**, not the wording you would have used. Run several
queries, and write in the ticket what you searched and why the nearest matches do not cover it.

Prefer a comment on an existing ticket over a new one. A finding whose fix belongs to an in-flight
ticket, or whose obvious fix contradicts another ticket's direction, almost always belongs as a
comment there.

## Phase 5: File

Each new ticket states: what was measured (with the command), why it matters, what is *not*
claimed, and acceptance criteria. Anything gate-shaped includes "show it going red".

## Phase 6: Update the operator QA list

Keep **one** list of operator-only verification, and add a dated section per wave naming the PRs it
came from. For each item: the check, why it exists, and **what a green result means**. Three kinds
must never be lost:

- **A new gate whose first real run is expected to go red.** Flag it loudly, or someone will
  "fix" it by switching it off.
- **Presence-not-value checks.** A gate that confirms a secret *exists* says nothing about whether
  it is *correct*. Name each such gap.
- **Anything an agent could not run, and why.** Separate *contention* (anyone can run it once the
  wave ends) from *operator-only* (reserved permanently). Mixing them up writes a false rule into
  the checklist.

## Phase 7: Correct what the wave proved wrong, where it was written

- A false ticket premise: correct it on the ticket before it closes.
- Your own earlier claim: correct it where you made it, and anywhere it was copied.
- Prefer editing a wrong comment to adding a third version, and say inside it what was corrected.
- Make counts checkable by citing the command. A consistent wrong number gives a reviewer
  nothing to catch.

## Phase 8: Record durable lessons

Only what is durable and not obvious: operational traps with a recovery recipe, and corrections to
guidance that turned out wrong. Do not copy findings out of the tracker, since a third home takes
them out of the workflow. Update an existing note rather than adding a duplicate.

## Phase 9: Report

PRs merged and open, tickets filed (and why each is not a duplicate), tickets commented, what went
onto the operator QA list, what was corrected (**including your own errors**), and what now waits
on the operator. Report CI as fact.

## Non-negotiables

- Never merge. Never touch a deployed environment.
- Search before filing, and say what you searched.
- Verify at the source before writing a claim anywhere.
- One ticket per PR.
