---
description: Trace everything a change could affect — callers, data, config, CI triggers — and produce a mandatory testing checklist tied to a commit.
argument-hint: [--branch (default) | --staged]
---

# /blast-radius

Answers one question: **what might this change break?** The output is a checklist that beat 4
works through item by item.

## Input

$ARGUMENTS

`--branch` (default) traces `git diff origin/dev...HEAD`. `--staged` traces `git diff --cached`
only and is for quick checks mid-build.

## Step 1: List the changed files

```
git diff origin/dev...HEAD --name-only
git rev-parse --short HEAD
```

**If the list is empty, stop.** You are tracing the wrong range, and an empty report would look
like a clean one.

## Step 2: Classify each file

For each file, note what kind of thing it is: UI, shared component or hook, data access, schema or
migration, access policy, server function, background job, email template, CI workflow, script,
config, docs. Then mark any file on a sensitive surface (see `AGENTS.md`).

## Step 3: Trace, in parallel

Split the changed files across `blast-radius-tracer` agents in **one message**, a few related files
each. Each tracer follows connections outward from its files:

- **Callers and importers:** who uses the changed function, component or export?
- **Data:** which tables, columns, policies and views are read or written, and who else reads them?
- **Contracts:** did a type, API shape, event name, URL or config key change? Who depends on the
  old shape?
- **Triggers:** which CI jobs, hooks and scheduled jobs run because this file changed, and which
  stop running?
- **Users:** which screens and flows does a real person see this through?

Each tracer returns findings with file and line, not opinions.

## Step 4: Assess

Merge the tracer results and rate the overall risk:

| level | when |
| -- | -- |
| LOW | isolated change, no shared code, no data or contract change |
| MEDIUM | shared code or several features affected, no data loss possible |
| HIGH | schema, access policy, auth, payments, or any change where a mistake loses or exposes data |

## Step 5: Write the checklist

One line per thing to test, each concrete enough that someone else could run it:

```
- [ ] Member books a class while signed in → booking appears on their schedule
- [ ] Anonymous request to <table> is still denied after the policy change
- [ ] Typecheck job still fails when a type error is introduced in <file>
```

Mark any item that needs staging or production as **operator**, with the exact steps.

## Output

```
BLAST RADIUS REPORT
Traced commit: <sha>
Changed files: <n>   Risk: LOW | MEDIUM | HIGH
Affected features: …
Possible build breakers: …
MANDATORY TESTING CHECKLIST
- [ ] …
```
