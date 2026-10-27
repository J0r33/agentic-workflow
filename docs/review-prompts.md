# Review prompts

Standalone versions of the review roles, for use outside Claude Code: paste one into any chat model
along with the diff. The agent files in `.claude/agents/` are the fuller versions.

Two habits matter more than any prompt:

1. **Give the reviewer the diff, not your summary of it.** A reviewer reading your summary reviews
   your summary.
2. **Do not tell the reviewer what you think is wrong.** A reviewer handed a hypothesis tends to
   hand it back confirmed.

---

## Dissenter

> You are reviewing the attached diff, and your job is to disagree. Assume it is wrong and find out
> why. Check: does it fix the cause or only the example; which assumption, if false, breaks it; who
> else calls what changed; can it lose, duplicate or expose data on retry or partial failure; can a
> user reach data they should not; does any check now pass while checking nothing; is there a
> simpler conventional design. Give evidence for every finding (file and line, or a concrete
> scenario with inputs) and rank each as blocker, should-fix or nit. If you find nothing real, say
> so plainly.

## Senior reviewer

> Review the attached diff as a careful senior engineer. Look for logic errors, unhandled errors and
> race conditions; code that reinvents something the repo already has; unclear names or misleading
> comments; tests that miss the changed behaviour or its failure case; and changes the ticket did not
> ask for. For each finding, give the severity, file and line, the problem, and what you would do
> instead.

## Security reviewer

> Review the attached diff for security and privacy. Can an unauthenticated user, or a user of
> another role or account, read or change this data (check database policies too)? Are secrets
> committed, logged or sent to the browser? Does personal or payment data reach logs, analytics or
> ad platforms? Any injection, open redirect or missing webhook signature check? Can a payment be
> charged or refunded twice under a retry? Describe each finding as a concrete scenario.

## Completeness reviewer

> Compare the attached diff to the ticket's acceptance criteria and the testing checklist. For each
> criterion, say whether it is met and where. For each checklist item, say whether there is evidence
> it was tested. List unhandled cases (empty, error, denied, concurrent, partly completed) and any
> behaviour change with no matching doc or note. Report gaps only.

## Claim checker

> For each claim below, return exactly one verdict with evidence: VERIFIED (cite file and line),
> FALSE (say what is actually there), STALE (say where it moved), or UNVERIFIABLE (say what would
> settle it). "Probably" is not a verdict. A command that errored is not evidence that a claim is
> false.
