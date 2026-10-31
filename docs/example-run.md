# One ticket, start to finish

This is one real ticket from the booking and payments platform this workflow runs, followed through
all five beats to the merge. The code is private, so this page quotes the pull request's own record
of the work. Function and file names are real. Links into the private repo and tracker are removed.

**Ticket:** HID-710, a pack purchase that could tell a charged member "You have not been charged".
**PR:** `fix(HID-710): leave a pack grant pending when Square's /payments answer is not a proven decline`.
Merged by hand on 2026-10-30. 4 files, +424 −8, no migration.

## The defect

When a member buys a class pack, the `pack-purchase` edge function creates a pending grant, applies
any account credit, and asks Square to take the payment. On **any** non-2xx answer from Square, it
marked the grant `refunded` and gave the credit back.

A non-2xx is not a decline. A 5xx, a gateway timeout, a 429 or an idempotency conflict can all
arrive after Square has charged the card. The reaper that tidies up stuck purchases only looks at
`pending` grants, so a charged member was left with nothing, permanently. Worse, the checkout page
treats a `refunded` grant as proof, so on the member's next press it told them they had not been
charged.

## Beat 1: check the claims

The ticket's description of the bug was reproduced against the current `dev` code before any design
work. The real handler ran locally against a local database, with Square stubbed by a fetch
interceptor. A 5xx, a timeout and a 409 idempotency conflict each produced `502`, a `refunded` grant
and a credit reversal. The ticket was right.

## Beat 2: design, challenge, build

The fix classifies Square's answer three ways: `charged`, `declined` or `unconfirmed`. Only a
readable 4xx with a Square error envelope, not a 429 and not an idempotency conflict, counts as a
decline. That rule already existed and was shared by three other charge functions, so it was reused
unchanged rather than written a fourth time.

On `unconfirmed`, the function writes nothing to the grant, keeps the credit held, records an audit
row and a scrubbed error log, and answers `202 pending`. The checkout page already reads that as
"still finishing", keeps the idempotency key so a retry cannot charge twice, and makes no "not
charged" promise. The reaper settles the grant within about 20 minutes: it recovers it if Square
holds a matching payment, and otherwise reverses it with the credit returned exactly once.

Options considered and **rejected**, each with its reason in the PR:

- A 409 status check. Square documents the idempotency conflict at 400, not 409, and the conflict
  is already matched by error code. A status branch would split this caller off from the three that
  share the rule.
- Applying first-purchase discounts on the uncertain path. That would be wrong whenever Square had
  not charged.
- Emailing staff "this payment may have gone through". The reaper settles it automatically, and an
  existing watcher already alerts admins on the new error log entry.

The build went red first. Commit 1 added only the tests. Against the old code the wiring test
failed 4 of 5 and the decision-table test could not compile.

## Beat 3: prove it

The real `pack-purchase` and `pack-purchase-reaper` handlers ran against a local database, with
Square stubbed and one throwaway member whose rows were deleted afterwards (0 rows left, checked).

| # | Case | Result |
| -- | -- | -- |
| H1 | Square 500, 504 with an HTML body, 409 idempotency conflict, 429, 2xx with no payment id | 202 pending, grant stays `pending`, no credit reversal, audit row written |
| H2 | A real decline (400 `GENERIC_DECLINE`) | 502, `refunded`, credit reversed once (unchanged) |
| H3 | Success | 200, `succeeded`, payment id stored (unchanged) |
| H4 | Same-key replay of an unconfirmed attempt | 200 pending; the page keeps the key |
| H5 | Reaper, Square holds the payment | grant recovered to `succeeded` |
| H6 | Reaper, Square holds no payment | grant reversed, credit returned exactly once |
| H7 | Purchase fully covered by credit | no Square call at all (unchanged) |
| M2 | New error log rows | HTTP status and Square error code only; ids scrubbed; no personal data |
| M3 | Checkout page on a first-press 202 | **Skipped, and said so.** Square's card SDK cannot tokenize locally, so this was verified by reading the page code and an existing unit test instead. |

The full suite also passed: 4,601 unit tests and 2,371 edge-function tests.

## Beat 4: blast radius

Traced at commit `50bf9b8b`, then traced again at `d3f85130` after a rebase and the review fixes.
Risk: **MEDIUM**, because this is the money path. Outcomes only move from `refunded` to `pending`,
which is the safe direction.

What the trace found:

- The shared decline rule now has **six** consumers, so any later change to it reaches this path.
  It is pinned by its own tests and this PR's table test.
- A parallel PR had just added a "payment may have gone through" staff alert to five charge
  functions. Pack purchase is now the only one without it. That is deliberate, and it was raised as
  a **decision for the operator** instead of being decided by the agent.
- Two pre-existing gaps reached more often now were filed as their own tickets rather than fixed in
  this PR: HID-1007 (a recovered grant never consumes its one-time discount) and HID-1008 (the
  "give it a minute" copy, when the reaper takes about 20 minutes).

## Beat 5: review, open the PR, stop

A six-judge review panel (technical, adversarial, completeness, user, practicality, critic) said
**approve with changes, nothing critical**. Fixed: the wiring test now forbids *any* database write
on the uncertain path, not just updates, and two more table cases were added. Not changed, each with
a written reason in the PR:

- *A Square 408 with a readable body would still count as a decline.* Square documents no 408 for
  this endpoint. A change to how a 4xx is read belongs in the shared rule, under its own ticket.
  Recorded as a **known gap**.
- *A reload mints a new key while the first grant is pending.* This existed before and is now
  narrower than it was. The copy fix is HID-1008.

Then the PR opened, and the agent stopped. Two checks were left to the operator, because they need
the deployed system:

- **O1.** Square's sandbox cannot be made to return a 5xx on demand, so there is no forced test.
  After promotion, watch `admin_actions` for `pack_purchase_unconfirmed`, and confirm each grant
  leaves `pending` within about 20 minutes.
- **O2.** Confirm the `pack-purchase-reaper` cron job is scheduled and succeeding in each
  environment.

## CI on the PR

22 checks passed and 2 were skipped as not applicable. Among them: typecheck, edge-function
`deno check` and tests, tests with coverage, the ESLint ratchet, gitleaks, the dependency audit,
semgrep, the accessibility scan at desktop and phone widths, the PR title and template gate, the
secrets-manifest drift check, and a smoke test of the preview deployment. Then the operator merged
it by hand.

## What this run shows

- **The bug was a trust bug, not a crash.** No test was failing. The fix came from refusing to
  treat "the request failed" as "nothing happened".
- **Reuse beat reinvention.** The decline rule already existed. Writing a fourth version is how
  four callers end up disagreeing.
- **Gaps were stated, not hidden.** One skipped proof, one known gap and two follow-up tickets are
  all in the PR body, where the operator sees them before merging.
- **The agent stopped at the right line.** Choosing alert parity, and the checks against deployed
  systems, went to the person accountable for them.
