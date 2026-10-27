---
description: Beat 1 — Pick up & check claims. Set the ticket In Progress, branch from dev, then check every claim the ticket makes against the code.
argument-hint: <ticket id>
---

# /beat-1 — Pick up & check claims

The first of the five beats in `AGENTS.md`. Every ticket runs all five, in order.

## Input

$ARGUMENTS

A ticket id. If none is given, ask for one. Do not guess from the branch name or recent
conversation.

## Commands this beat runs

| order | command | non-negotiable |
| -- | -- | -- |
| 1 | `/check-claims <ticket>` | every claim in the ticket, each with evidence |

## Step 1: Read the ticket

Fetch it from the tracker. Read the whole description, not just the title: acceptance criteria,
sequencing, linked and blocking tickets. If the tracker tool is unavailable, say so rather than
guessing at the contents.

State in one line what the ticket actually asks for. If a blocking ticket is unmerged, say so now
rather than after building.

## Step 2: Set it In Progress

Move the ticket to In Progress before branching. It is the signal that work has started.

## Step 3: Branch from `dev`

```
git fetch origin --prune
git checkout -b <type>/<TICKET>-<short-desc> origin/dev
```

- `<type>` is a conventional-commit type: `feat | fix | chore | docs | refactor | test | ci | perf`.
- Always branch from `dev`. Never commit directly to `dev`, `staging` or `main`.
- One ticket per branch, one branch per PR.
- In a fresh worktree, install dependencies first. A worktree with no `node_modules` can silently
  disable the pre-commit hook.

## Step 4: `/check-claims`

Tickets are written from memory, and line numbers go stale. Run `/check-claims` in full before
any design work, so beat 2 starts from what the code actually says.

If a claim is false, amend the ticket with the evidence before going on. A ticket is a starting
position, not a specification to follow into a wrong result.

## Step 5: Report

Ticket id and title, its status now, the branch and what it was cut from, any outstanding blocker,
the claim-check table, and the next beat.

## Rules

- Do not design or build. That is beat 2.
- Do not skip `/check-claims` because the ticket "looks obviously right".
