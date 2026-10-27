#!/usr/bin/env node
// Dependency audit gate. Fails closed:
//   - the audit could not run, or produced no JSON      -> FAIL (not a pass)
//   - the audit examined zero dependencies              -> FAIL (checked nothing)
//   - a high/critical advisory is not allow-listed      -> FAIL
//   - an allow-list entry has no reason, or has expired -> FAIL
//
// Usage: node audit-gate.mjs [audit.json] [allowlist.json]
//   audit.json     output of `pnpm audit --json` (read from stdin if omitted or "-")
//   allowlist.json defaults to .audit-allowlist.json; a missing file means "no exemptions"
//
// Allow-list format:
//   [{ "id": "GHSA-xxxx-xxxx-xxxx", "reason": "why this is not reachable", "expires": "2027-01-31" }]

import { readFileSync, existsSync } from "node:fs";

const BLOCKING = new Set(["high", "critical"]);
const fail = (msg) => {
  console.error(`::error::${msg}`);
  process.exitCode = 1;
};

const [auditPath = "-", allowPath = ".audit-allowlist.json"] = process.argv.slice(2);

let raw;
try {
  raw = readFileSync(auditPath === "-" ? 0 : auditPath, "utf8");
} catch (e) {
  fail(`Could not read audit output (${e.message}). This gate proved NOTHING — treat it as failed.`);
  process.exit();
}

let audit;
try {
  audit = JSON.parse(raw);
} catch {
  fail("Audit output is not JSON — the audit did not run. This gate proved NOTHING — treat it as failed.");
  process.exit();
}

if (audit.error) {
  fail(`The audit itself errored: ${JSON.stringify(audit.error).slice(0, 300)}. This gate proved NOTHING.`);
  process.exit();
}

const examined = audit.metadata?.totalDependencies;
if (typeof examined !== "number" || examined === 0) {
  fail(`The audit examined ${examined ?? "an unknown number of"} dependencies. Refusing to report success for a check that examined nothing.`);
  process.exit();
}

let allow = [];
if (existsSync(allowPath)) {
  try {
    allow = JSON.parse(readFileSync(allowPath, "utf8"));
    if (!Array.isArray(allow)) throw new Error("not an array");
  } catch (e) {
    fail(`${allowPath} is unreadable (${e.message}).`);
    process.exit();
  }
}

const today = new Date().toISOString().slice(0, 10);
const allowed = new Map();
for (const entry of allow) {
  if (!entry.id) fail(`Allow-list entry with no id: ${JSON.stringify(entry)}`);
  else if (!entry.reason || entry.reason.trim().length < 10)
    fail(`Allow-list entry ${entry.id} has no written reason. An exemption without a reason is a second finding.`);
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.expires ?? ""))
    fail(`Allow-list entry ${entry.id} has no expiry date (YYYY-MM-DD).`);
  else if (entry.expires < today)
    fail(`Allow-list entry ${entry.id} expired on ${entry.expires}. Re-check it and renew or remove it.`);
  else allowed.set(entry.id, entry);
}

const advisories = Object.values(audit.advisories ?? {});
let blocking = 0;
for (const a of advisories) {
  if (!BLOCKING.has(a.severity)) continue;
  const id = a.github_advisory_id ?? String(a.id);
  if (allowed.has(id)) {
    console.log(`allowed  ${a.severity.padEnd(8)} ${id} ${a.module_name} — ${allowed.get(id).reason}`);
    continue;
  }
  blocking++;
  fail(`${a.severity} ${id} in ${a.module_name}: ${a.title} (${a.url})`);
}

console.log(`Examined ${examined} dependencies; ${advisories.length} advisories; ${blocking} blocking.`);
