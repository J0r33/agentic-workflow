#!/usr/bin/env node
// Gate self-test. Runs each gate script against fixtures with a known right answer, so CI shows
// every gate both passing and going red. A gate never seen to fail is not a proven gate.
//
// Fails closed:
//   - a case exits with the wrong status                  -> FAIL
//   - a failing case fails for a reason other than the one it is there to prove -> FAIL
//   - no cases ran                                        -> FAIL (checked nothing)
//
// Usage (from the repo root): node tests/gates/run.mjs

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

const PR_GATE = "templates/scripts/pr-quality-gate.mjs";
const AUDIT_GATE = "templates/scripts/audit-gate.mjs";
const NO_ALLOWLIST = "tests/gates/audit/does-not-exist.json";

// [gate, args, expect: "pass" | text that must appear in the failure output]
const CASES = [
  [PR_GATE, ["tests/gates/pr/pass-complete.json"], "pass"],
  [PR_GATE, ["tests/gates/pr/fail-bad-title.json"], "must look like"],
  [PR_GATE, ["tests/gates/pr/fail-untouched-template.json"], "template placeholder"],
  [PR_GATE, ["tests/gates/pr/fail-no-traced-commit.json"], "Traced commit"],
  [PR_GATE, ["tests/gates/pr/fail-not-a-pr-event.json"], "no pull_request"],
  [PR_GATE, ["tests/gates/pr/does-not-exist.json"], "proved NOTHING"],

  [AUDIT_GATE, ["tests/gates/audit/pass-clean.json", NO_ALLOWLIST], "pass"],
  [AUDIT_GATE, ["tests/gates/audit/critical-advisory.json", "tests/gates/audit/allowlist-valid.json"], "pass"],
  [AUDIT_GATE, ["tests/gates/audit/critical-advisory.json", NO_ALLOWLIST], "critical GHSA-aaaa-bbbb-cccc"],
  [AUDIT_GATE, ["tests/gates/audit/critical-advisory.json", "tests/gates/audit/allowlist-expired.json"], "expired on"],
  [AUDIT_GATE, ["tests/gates/audit/critical-advisory.json", "tests/gates/audit/allowlist-no-reason.json"], "no written reason"],
  [AUDIT_GATE, ["tests/gates/audit/fail-examined-nothing.json", NO_ALLOWLIST], "examined nothing"],
  [AUDIT_GATE, ["tests/gates/audit/fail-audit-errored.json", NO_ALLOWLIST], "audit itself errored"],
  [AUDIT_GATE, ["tests/gates/audit/fail-not-json.txt", NO_ALLOWLIST], "not JSON"],
];

let wrong = 0;
for (const [gate, args, expect] of CASES) {
  // An unset GITHUB_EVENT_PATH keeps the PR gate on the fixture we pass it.
  const env = { ...process.env, GITHUB_EVENT_PATH: "" };
  const r = spawnSync(process.execPath, [gate, ...args], { encoding: "utf8", env });
  const output = `${r.stdout}${r.stderr}`;
  const ok = expect === "pass" ? r.status === 0 : r.status !== 0 && output.includes(expect);
  const label = `${gate.split("/").pop()} ${args.map((a) => a.split("/").pop()).join(" + ")}`;
  const want = expect === "pass" ? "pass" : `fail ("${expect}")`;
  console.log(`${ok ? "ok  " : "BAD "} ${label.padEnd(72)} want ${want}, got exit ${r.status}`);
  if (!ok) {
    wrong++;
    console.log(output.replace(/^/gm, "       | "));
  }
}

if (CASES.length === 0 || !existsSync(PR_GATE) || !existsSync(AUDIT_GATE)) {
  console.error("::error::No gate cases ran. This self-test proved NOTHING — treat it as failed.");
  process.exit(1);
}
if (wrong) {
  console.error(`::error::${wrong} of ${CASES.length} gate cases gave the wrong answer.`);
  process.exit(1);
}
console.log(`\nAll ${CASES.length} gate cases gave the expected answer.`);
