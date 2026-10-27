---
description: Independent review of the branch diff by a senior reviewer and a dissenter, widened to more reviewers on sensitive surfaces. Every finding must be fixed or refuted with evidence.
argument-hint: [optional focus]
---

# /review

## Input

$ARGUMENTS

## Step 1: Write the diff to a file

```
git diff origin/dev...HEAD > .review/diff.patch
```

Give reviewers the **file**, not a description of the change. A reviewer working from your summary
reviews your summary. (Keep `.review/` in `.gitignore`.)

## Step 2: Choose the panel

| change | reviewers |
| -- | -- |
| any change | `senior-reviewer` + `dissenter` |
| touches a sensitive surface (see `AGENTS.md`) | add `security-reviewer` and `completeness-reviewer` |
| touches a CI gate or assertion script | add a reviewer briefed with "Gates must fail closed" in `AGENTS.md` |

Spawn them in one message. Give each the diff file, the ticket, and beat 4's checklist. **Do not
tell them what you think is wrong.** A reviewer handed your hypothesis tends to return it confirmed.

## Step 3: Merge the findings

List every finding once, merging duplicates. For each, give its severity (blocker, should-fix,
nit), the file and line, and which reviewers raised it.

If reviewers disagree, say so and settle it with evidence: run the test, read the code, query the
local database. Do not settle it by majority.

## Step 4: Resolve every finding

| outcome | requirement |
| -- | -- |
| fixed | a commit, and the check that shows it fixed |
| refuted | one line of evidence showing the finding does not hold |
| deferred | a ticket filed (after searching for an existing one) and a line in the PR body |

"Noted" is not an outcome. If the dissenter is right, say so plainly and fix it.

## Output

The merged findings table with an outcome for each, and the new commits made. Those commits are
untraced, so beat 5 checks the blast-radius trace is still current.
