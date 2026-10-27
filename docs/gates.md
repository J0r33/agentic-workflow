# Why each gate exists

Every gate here is there because its absence cost something, or nearly did, in a real project.
This page explains each one so you can decide which you need, rather than copying all of them.

## Process gates (people and agents)

| Gate | What it stops |
| -- | -- |
| **Check claims before designing** (beat 1) | Designing against a ticket that is wrong about the code. Tickets are written from memory, and line numbers go stale. |
| **Operator picks the design** (beat 2) | An agent quietly choosing the easy option over the right one. The choice is a business decision, and it should be visible. |
| **Dissenter on the chosen design** (beat 2) | Plans that sound right and are not. Of all the phases, the adversarial one most often catches a wrong plan. |
| **Fixed proof menu** (beat 3) | "Tests pass" standing in for "it works", and agents choosing their own, lighter proof. The menu is keyed to file paths, so proof is not a judgement call. |
| **Blast-radius checklist, worked** (beat 4) | Breaking something next to the change. The author is the worst-placed person to see this, so tracer agents do the looking. |
| **Trace tied to a commit** (beats 4–5) | Review fixes landing after the trace and never being traced. If HEAD moved, the trace is stale. |
| **Dissenter in review** (beat 5) | Review that agrees with the author. One reviewer is there specifically to disagree. |
| **Human merges, by hand** | An agent declaring its own work done. Agents prepare; a person accepts. Backed by a deny rule in `.claude/settings.json`. |
| **Human runs deployed checks** | Agents testing against live systems with real users' data. Agents own local; people own deployed. |
| **Wave sweep** | Limitations written in PR bodies vanishing when the ticket auto-closes on merge. |

## CI gates (templates in `templates/.github/`)

| Gate | What it stops | How it fails closed |
| -- | -- | -- |
| **Typecheck** | Type errors reaching `dev`. | Fails if the TypeScript config is missing, or if the compiler examined zero files. A check that examined nothing has not passed. |
| **Secret scan** (gitleaks) | API keys and tokens committed, including in older commits. | Scans full history (`fetch-depth: 0`). No `continue-on-error`. The gitleaks version is pinned. |
| **Dependency audit** | Known-vulnerable packages at high or critical severity. | Tells "the audit found problems" apart from "the audit could not run": a registry error fails the job instead of passing it. Exemptions need a written reason and an expiry date, and an expired exemption fails. |
| **PR quality gate** | PRs that cannot show their work. | Requires the title format, every template section, a blast-radius section with a traced commit, and at least one ticked box. A placeholder fails. |

## The rules behind the CI gates

These came from finding many checks in one project that reported success while enforcing nothing.
Each was fixed one at a time, and these are the patterns behind them.

1. **An empty result and a failed command are different.** `grep` finding nothing exits 1, and so
   does a command that crashed. `|| true` forgives both. Capture the exit code and allow only the
   case you meant.
2. **A gate that could not run has not passed.** Say so in the output, and exit non-zero.
3. **Prove it goes red.** Break what it guards, watch it fail, then restore. A test for a gate has
   to fail against the code from before the fix.
4. **Fixtures prove the decision table, not the real world.** A fixture shows which branch runs for
   a given state. Check separately that the real cause you care about produces that state.
5. **Do not build a gate nobody can satisfy.** A permanently red gate gets switched off, taking
   real coverage with it. Confirm a new gate is green on today's tree and can go red.
6. **Every allow-list entry carries its reason and an expiry date.**
7. **A gate must not overclaim.** Its name and message describe what it actually checks.
