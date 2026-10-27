#!/usr/bin/env node
// PR quality gate. Checks that a PR can show its work:
//   - title is `type(TICKET-123): description`
//   - every template section is present
//   - `## Blast radius` names a traced commit and is not just the template placeholder
//   - at least one checkbox is ticked
//
// Usage in CI: node pr-quality-gate.mjs            (reads $GITHUB_EVENT_PATH)
// Locally:     node pr-quality-gate.mjs event.json

import { readFileSync } from "node:fs";

const TITLE = /^(feat|fix|chore|docs|refactor|test|ci|perf|build|revert|style)\([A-Z][A-Z0-9]+-\d+\): \S.*$/;
const SECTIONS = ["## Summary", "## Blast radius", "## Testing", "## Database changes", "## Operator"];

const eventPath = process.argv[2] ?? process.env.GITHUB_EVENT_PATH;
if (!eventPath) {
  console.error("::error::No event payload. This gate proved NOTHING — treat it as failed.");
  process.exit(1);
}

let pr;
try {
  pr = JSON.parse(readFileSync(eventPath, "utf8")).pull_request;
} catch (e) {
  console.error(`::error::Could not read the event payload (${e.message}). This gate proved NOTHING.`);
  process.exit(1);
}
if (!pr) {
  console.error("::error::Event has no pull_request. This gate only runs on pull_request events.");
  process.exit(1);
}

const problems = [];
const title = pr.title ?? "";
// Strip HTML comments so template guidance text never counts as content.
const body = (pr.body ?? "").replace(/<!--[\s\S]*?-->/g, "");

if (!TITLE.test(title)) problems.push(`Title "${title}" must look like "fix(PROJ-123): short description".`);

for (const s of SECTIONS) if (!body.includes(s)) problems.push(`Missing section "${s}".`);

const blast = body.split("## Blast radius")[1]?.split(/\n## /)[0] ?? "";
if (!/Traced commit:\s*`?[0-9a-f]{7,40}`?/i.test(blast))
  problems.push('"## Blast radius" must include "Traced commit: <sha>" from beat 4.');
if (!/- \[[ xX]\] \S/.test(blast)) problems.push('"## Blast radius" must carry the worked checklist.');
if (blast.includes("<checklist item>")) problems.push('"## Blast radius" still holds the template placeholder.');

if (!/- \[[xX]\]/.test(body)) problems.push("No checkbox is ticked.");

if (problems.length) {
  for (const p of problems) console.error(`::error::${p}`);
  process.exit(1);
}
console.log("PR quality gate: title, sections, blast radius and checklist present.");
