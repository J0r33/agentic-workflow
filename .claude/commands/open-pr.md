---
description: Final pre-PR gate — confirm the trace is current and the build passes, fill the PR template from beats 3 and 4, push the feature branch, open a draft PR, and stop.
argument-hint: [optional ticket id]
---

# /open-pr

The last command a ticket runs. It refuses to open a PR that cannot show its work.

## Input

$ARGUMENTS

## Phase 1: Preconditions — stop if any fails

| check | how |
| -- | -- |
| on a feature branch | `git branch --show-current` is not `dev`, `staging` or `main` |
| working tree clean | `git status --porcelain` is empty |
| blast-radius trace is current | the traced commit from beat 4 equals `git rev-parse --short HEAD` |
| checklist worked | every beat 4 item has PASS, FAIL with a fix, or "operator" |
| review resolved | every `/review` finding has an outcome |

If one fails, say which and stop. Do not open the PR "and fix it after".

## Phase 2: Build and gates

```
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```

Capture each result separately. A build failure blocks the PR. A gate that could not run is
written into the PR body as "not run locally", with the reason.

## Phase 3: Fill the template

Use `.github/PULL_REQUEST_TEMPLATE.md`. Keep every section. It must contain:

- what changed and why, with the ticket linked
- `## Blast radius`: beat 4's report, **including the traced commit**, with every item's result
- `## Testing`: the proof from beat 3, written as measurements rather than assertions
- anything left for the operator, with the exact steps to run
- any gate that could not run locally

Title: `type(TICKET): description`. The PR quality gate fails any other shape.

## Phase 4: Push and open as a draft

```
git push -u origin <branch>
gh pr create --draft --base dev --title "<title>" --body-file <filled template>
```

Never push to `dev`, `staging` or `main`. Never force-push.

## Phase 5: Stop

Report the PR link and that it is a draft. Watch CI once it settles and report it as fact. Then
stop: merging, marking ready for review, and any check against a deployed environment belong to
the operator.
