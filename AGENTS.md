# Project contract for coding agents

This file is the standing instruction set for any coding agent working in a repo that uses this
workflow. Copy it into your project root, then fill in the `<placeholders>` in **Product** and
**Sensitive surfaces**. `CLAUDE.md` imports it, so Claude Code reads it on every session.

The rules below are written for one human owner (called **the operator**) directing several AI
agents. They work the same with a team. The only difference is who holds each gate.

---

## Human-only gates

These are hard boundaries, not defaults. The agent **prepares** work. The operator alone exercises
the gates that **accept** it. They hold regardless of urgency, convenience, or how green the
checks look.

- **The operator alone passes a quality gate.** Report CI status as fact: what passed, what failed,
  what was skipped and why. Deciding that a result is good enough is the operator's call.
- **The operator alone merges pull requests, by hand.** The agent never merges: not the merge
  button, not the API, not `gh pr merge`, not auto-merge, not a workflow it triggers. Back this up
  with a deny rule in `.claude/settings.json`; the deny rule is a backstop, not the rule.
- **The operator alone verifies against a deployed environment.** Smoke tests against staging or
  production are run by the operator. The agent may build that tooling and explain how to run it.
  A local dev server and a local database belong to the agent.
- **The agent proposes; the operator disposes on anything outward-facing.** Deploys, merges, gate
  approvals and live-environment tests are operator actions. Prepare the change, push the feature
  branch, open the PR, hand off, then stop and wait.

"Solo project" removes the second reviewer. It does not remove the operator's merge authority.

## Product

- `<One line on who uses the product and what they need from it.>`
- Write UI copy in plain, friendly language. Assume users are not technical.
- Never log, expose, or send personal data or payment data to diagnostics, logs, analytics or
  error trackers.

## Sensitive surfaces

Changes here get the full process with no shortcuts, and a wider review in beat 5:

`<auth, user profiles / personal data, bookings & schedules, payments & billing, data exports,
account deletion>`

## Workflow: every ticket runs the five beats

| Beat | Command | What it produces |
| -- | -- | -- |
| 1. Pick up & check claims | `/beat-1` | Ticket in progress, a branch, and every claim in the ticket checked against the code |
| 2. Design, challenge, build | `/beat-2` | 1–3 designs, an operator choice, a design that survived attack, small commits |
| 3. Prove it | `/beat-3` | Local gates plus proof that the change works in the running app |
| 4. Blast radius | `/beat-4` | A worked "what might this break?" checklist, tied to a commit |
| 5. Review & open PR | `/beat-5` | Reviewer findings fixed or refuted, a PR opened, and a stop |

Every ticket goes through all five beats in order, even small ones. Beat 2 has one narrow,
stated exception for trivial changes. It is written in that command, not left to judgement.

**"Run beat N" means run every command that beat contains, in order and in full.** The commands
are not a menu. Invoking one and then abridging its phases because earlier work "already covers"
them is the same as skipping it. Prior research is context *for* a phase, never a substitute *for*
running it. A phase that only confirms what you believed cost a few minutes. A phase you skipped
is how a wrong plan reaches a PR. If you catch yourself writing "we already have coverage, so I'll
skip X", run X.

**One ticket per PR.** Every PR gets its own ticket, never several PRs against one umbrella ticket.

**Search the backlog before filing a ticket.** Look for the same defect, file or subsystem under
someone else's wording. When several agents file into one backlog, "did I file this?" is the wrong
question; "does this already exist?" is the right one.

## Delivery

- Always work on a feature branch. Never commit directly to `dev`, `staging` or `main`.
- Release flow: feature branch → `dev` → `staging` (QA) → `main` (production). Releases go out in
  waves: several tickets land on `dev`, the wave is promoted to staging for QA, then to production.
- Feature branches are pushed so CI runs on the PR. Never force-push.
- Database changes ship as committed migration files through CI, never applied by hand.
- Commit only changes scoped to the ticket. Never sweep in unrelated working-tree changes.
- The agent owns the full loop: investigation, implementation, tests, proof in the running app,
  self-review and repair. Human testing is final acceptance, not the agent's first QA pass.

## Proof

- Verify the user-visible outcome (the booking completes, the schedule updates), not only that
  unit tests pass.
- Before any browser proof, start the local dev server from the same checkout that holds the
  change.
- Keep evidence without private content: screenshots, status codes, redacted logs, test output.
- Label every claim as **measured** or **inferred**. A value with a date on it is a sample, not a
  standing property. Re-measure before relying on it.

## Gates must fail closed

A check that reports success while enforcing nothing is worse than no check, because its green
result is what stops the next person looking. These rules came from finding many such checks in a
real project. See `docs/gates.md` for the reasoning behind each one.

- **An empty result and a failed command are different things.** `|| true`, `2>/dev/null`,
  `continue-on-error` and a `catch` that returns a default all hide both at once. Capture the exit
  status and tolerate only the case you meant to tolerate.
- **A gate that could not run has not passed, and must say so.** Treat "examined nothing" as a
  failure, never as a pass.
- **Prove it goes red.** A gate never seen to fail is not a proven gate. Break what it guards,
  watch it fail, restore. A test for a gate must fail against the code from before the fix.
- **Fixtures prove the decision table, not the real world.** A fixture shows which branch runs for
  a given state. Check separately that the real cause you care about produces that state.
- **Do not build a gate nobody can satisfy.** A permanently red gate gets switched off within a
  month, taking any real coverage beside it with it. Run a new check against the current tree:
  confirm it is green now and that it can go red.
- **An allow-list entry needs a written rationale and an expiry date, in the entry.**
- **A gate must not overclaim.** Its name, message and docs describe what it actually enforces.

## Parallel agents

- Give each parallel agent its own git worktree, and never run two agents on the same files or the
  same kind of shared registry (migrations, route tables, config) at the same time.
- **Never use `git stash` in a multi-worktree repo.** Every worktree shares one stash stack, and
  tools such as lint-staged address it by index, so a stash in one worktree can apply or drop
  another agent's work. Park work in a WIP commit or a patch file instead.
- Serialise commits if your pre-commit hook is not safe to run twice at once.
