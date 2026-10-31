import assert from "node:assert/strict";
import test from "node:test";
import { arrivalGuidance } from "../scripts/arrival-guidance.mjs";

test("Wednesday 4 Nov at 6:15 pm never displays Saturday's 8:00 am instruction", () => {
  // Australia/Melbourne observes AEDT (UTC+11) in November.
  const instruction = arrivalGuidance(new Date("2026-11-04T07:15:00.000Z"));
  assert.match(instruction, /confirm this session is suitable/i);
  assert.doesNotMatch(instruction, /8:00 am/i);
});

test("regular Saturday 8:15 am training retains the confirmed 8:00 am induction", () => {
  const instruction = arrivalGuidance(new Date("2026-11-06T21:15:00.000Z"));
  assert.match(instruction, /arrive by 8:00 am/i);
});

test("Saturday evening and other mornings do not inherit the induction time", () => {
  for (const start of [
    "2026-11-07T07:15:00.000Z", // Saturday 6:15 pm local
    "2026-11-03T21:15:00.000Z", // Wednesday 8:15 am local
    "2026-11-06T21:00:00.000Z"  // Saturday 8:00 am local (no time before session)
  ]) {
    assert.doesNotMatch(arrivalGuidance(new Date(start)), /8:00 am/i);
  }
});

test("invalid event dates are rejected instead of generating arrival advice", () => {
  assert.throws(() => arrivalGuidance(new Date("invalid")), /valid event date/);
});
