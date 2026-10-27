---
description: Beat 3 — Prove it. Run the local gates, then prove the change in the running app using a fixed menu keyed to what the diff touches.
argument-hint: [optional note on which flows to exercise]
---

# /beat-3 — Prove it

The third of the five beats in `AGENTS.md`. Beat 2 must already have run: the work is built and
committed.

The proof step below is a **fixed menu keyed to what the diff touches**, not a judgement call.
Most tickets in a real product are migrations, server functions and CI, with no UI at all. A beat
built only around browser proof would fall back to "use your judgement" on most tickets, which is
the discretion these commands exist to remove.

## Input

$ARGUMENTS

## Step 1: Local gates

Run the cheapest checks first, then widen to the risk surface you touched. Adapt the names to your
`package.json`:

```
pnpm typecheck
pnpm lint
pnpm test
```

Some gates run in CI but not in the pre-commit hook (a migration linter, a type check for
server functions, a build). Run those by hand when the diff touches what they guard. If a tool is
missing, **say so in the report and the PR**. "Could not run locally; CI covers it" is an honest
result. Silently leaving a gate out is not.

Report factually: what passed, what failed, what was skipped and why. Whether that is good enough
is the operator's call.

## Step 2: Prove the outcome — pick from this menu

Unit tests passing is not proof. Run `git diff origin/dev...HEAD --name-only`, then run **every
row your diff touches**. Rows add up; they are not alternatives.

| diff touches | required proof |
| -- | -- |
| database migrations | the migration linter; replay **every** migration on a fresh local database; any assertion scripts (grants, policies, scheduled jobs) clean; a before/after diff of what changed |
| row-level security policies | sign in locally as each role the policy distinguishes, and show one allowed and one denied request per role |
| server / edge functions | type check; run the function locally against the local database; confirm which key or role its client uses |
| CI workflows or gate scripts | name the trigger path; show the gate **failing** on a deliberately broken case, then passing; work through "Gates must fail closed" in `AGENTS.md` |
| scripts | name every caller (workflows, `package.json`, hooks, other scripts) and confirm the caller actually runs the file and is not skipped by an `if:`; run it the way the caller does |
| email templates | render the templates you changed and read them; a "renders OK" status is not proof that they read correctly |
| UI reachable from a route | run the dev server from **this** checkout, drive the flow end to end, take a screenshot |
| UI behind sign-in | sign in for real with local test accounts (seeded, never real users); prove the session with a real token request, not just the seed output |
| code not reachable from a route | the unit tests that cover it, named individually with results |
| docs and agent config only | say that no runtime surface is touched, and check every factual claim in the text against the file it describes |

If your diff matches no row, say so explicitly and say what you did instead. Report that as a gap
in the menu. Adding a row is cheap.

**Local only.** Local dev server and local database belong to the agent. Staging and production
verification belongs to the operator.

## Step 3: Edge cases

List the edge cases the change implies and test each: empty states, permission boundaries,
concurrent access, a flow interrupted halfway. A booking in progress must not be lost.

## Step 4: Evidence

Screenshots, status codes, redacted logs, test output. Never paste personal or payment data into
the PR, the tracker or any log.

## Step 5: Draft the PR body

Fill `.github/PULL_REQUEST_TEMPLATE.md` now, while the detail is fresh. Tick only boxes that are
true. Where something could not be run, say so plainly.

## Rules

- Do not open a PR. That is beat 5.
- A gate you could not run is a fact to report, not a box to leave blank.
- The menu is a floor, not a ceiling. If you are building an argument for why a row does not apply
  to you, run the row.
