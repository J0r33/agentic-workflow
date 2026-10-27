---
description: Research a ticket in parallel, then propose 1–3 designs that fix the root cause, with trade-offs and a recommendation. Ends by asking the operator to choose.
argument-hint: <ticket id; defaults to the ticket on the current branch>
---

# /design

Turns a checked ticket into a small set of real options. It does not write code.

## Input

$ARGUMENTS

Run `/check-claims` first (beat 1). If it has not run, run it now.

## Phase 1: Frame the problem

In three or four sentences: what the user or operator experiences, what causes it, and where else
the same cause could show up. Design against the **cause**, not the symptom in the ticket. A fix
that only covers the ticket's example is the usual way a bug comes back with a different name.

## Phase 2: Research, in parallel

Spawn these in **one message** so they run together. Give each the ticket, the claim table and the
framing from Phase 1.

| agent | question it answers |
| -- | -- |
| `codebase-mapper` | Which files, functions, tables, policies and jobs are involved, and how do they connect? |
| `pattern-finder` | Does the repo already solve a similar problem? What helper, component or convention should this reuse? |
| `docs-checker` | Only if the change touches a fast-moving dependency: what does the current official documentation say? |

Do not replace these with your own reading. Their value is that they read without your
assumptions.

## Phase 3: Constraints

Write down what any acceptable design must respect: sensitive surfaces it touches, data that must
not be lost, backward compatibility, migration rules, cost, and anything the operator has already
decided.

## Phase 4: Options

Propose one to three designs. Fewer is fine when only one is sound. For each:

- **What changes:** files, schema, config, in a short list.
- **How it fixes the cause**, including the other places from Phase 1.
- **Risk:** what could go wrong, and which sensitive surfaces it touches.
- **Size:** rough number of files and commits.
- **How it will be proven** in beat 3, using the proof menu rows it triggers.

Prefer the design a careful senior engineer would choose and that reuses what the repo already
has, even when a smaller diff exists.

## Phase 5: Recommend and stop

Name the option you recommend and why, in a few sentences. Then ask: **"Which design should I
build?"** and stop. The operator's choice is a gate. Do not start implementing.
