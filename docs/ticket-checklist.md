# Ticket checklist

A one-page version of the five beats, for a ticket or PR description. Each box links to the command
that does the work.

## Beat 1 — Pick up & check claims
- [ ] Ticket read in full, including acceptance criteria and blockers
- [ ] Ticket set to In Progress
- [ ] Branch `<type>/<TICKET>-<desc>` cut from `origin/dev`
- [ ] `/check-claims` run: every claim VERIFIED, FALSE, STALE or UNVERIFIABLE, with evidence
- [ ] Ticket amended for any false claim the plan depends on

## Beat 2 — Design, challenge, build
- [ ] `/design` run with parallel research; 1–3 options written
- [ ] Operator chose an option
- [ ] `dissenter` attacked the chosen design; each concern confirmed or refuted
- [ ] Built in small `type(TICKET): description` commits, scoped to the ticket
- [ ] (Or) reduced path taken, with every condition stated

## Beat 3 — Prove it
- [ ] Typecheck, lint and tests run; results recorded, including anything not run and why
- [ ] Every proof-menu row the diff touches has been run
- [ ] Edge cases listed and tested
- [ ] Evidence saved without personal data

## Beat 4 — Blast radius
- [ ] `/blast-radius --branch` run; changed-file list not empty
- [ ] Traced commit recorded: `______`
- [ ] Every checklist item has PASS / FAIL / operator, with a note

## Beat 5 — Review & open PR
- [ ] `/review`: senior reviewer and dissenter, wider on sensitive surfaces
- [ ] Every finding fixed, refuted with evidence, or filed
- [ ] HEAD still equals the traced commit, or the trace was re-run
- [ ] `/open-pr`: build passed, template filled, **draft** PR opened
- [ ] Ticket moved to In Review
- [ ] **Stopped.** Merge, gate approval and deployed checks belong to the operator.
