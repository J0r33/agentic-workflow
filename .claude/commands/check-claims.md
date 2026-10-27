---
description: List every factual claim a ticket makes and check each one against the code, the schema and the docs. Produces a table of verified, false and unverifiable claims.
argument-hint: <ticket id or pasted ticket text>
---

# /check-claims

A ticket is someone's memory of the code at the time they wrote it. This command finds out where
that memory is wrong before anyone designs against it.

## Input

$ARGUMENTS

## Step 1: Extract the claims

Read the ticket and list every statement that could be true or false about the system. Typical
claims:

- "`X` lives in `path/file.ts`" or "line 120 does Y"
- "this table has column Z" or "this policy allows role R"
- "there are N callers" or "this happens on every request"
- "this was fixed in ticket T"
- "the bug only happens when …"

Leave out acceptance criteria and wishes. Those describe what *should* be true, and beat 2 handles
them.

## Step 2: Check each claim

For a short list, check them yourself. For more than about eight claims, split them across
`claim-checker` agents in one message, each with a few claims and the instruction to return
evidence, not opinions.

Each claim gets exactly one verdict:

| verdict | meaning | evidence required |
| -- | -- | -- |
| VERIFIED | the code says what the ticket says | file and line, query result, or command output |
| FALSE | the code says something else | what it actually says, with file and line |
| STALE | it was true once and has since moved | where it is now |
| UNVERIFIABLE | cannot be settled from the repo (e.g. production data, vendor settings) | who or what could settle it |

"Probably true" is not a verdict. If you cannot find the evidence, the claim is UNVERIFIABLE.

## Step 3: Act on the result

- Any FALSE or STALE claim that the ticket's plan depends on: amend the ticket with the evidence
  and say how the plan changes.
- Any UNVERIFIABLE claim the plan depends on: name it as an open question for the operator.
- If nothing is wrong, say so. That is a real result, not a wasted step.

## Output

The claim table, then a one-paragraph summary: what the ticket got right, what it got wrong, and
whether the ticket as written can still be built.
