import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function icsDate(days) {
  return new Date(Date.now() + days * 86400000).toISOString()
    .replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}
function event(days, title) {
  return ["BEGIN:VEVENT", "DTSTART:" + icsDate(days), "SUMMARY:" + title, "END:VEVENT"].join("\n");
}
function select(events) {
  const dir = mkdtempSync(join(tmpdir(), "yrd-session-"));
  try {
    const input = join(dir, "input.ics"), output = join(dir, "result.json");
    writeFileSync(input, "BEGIN:VCALENDAR\n" + events.join("\n") + "\nEND:VCALENDAR\n");
    const run = spawnSync(process.execPath, ["scripts/sync-teamapp-schedule.mjs", input, output], {
      env: { PATH: process.env.PATH || "", TZ: "Australia/Melbourne" }, encoding: "utf8"
    });
    assert.equal(run.status, 0, run.stderr);
    return JSON.parse(readFileSync(output, "utf8")).sessions[0];
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
test("earlier midweek practice beats later Saturday training", () => {
  const chosen = select([event(5, "Saturday Training"), event(2, "Wednesday Training")]);
  assert.equal(chosen.start.slice(0, 10), new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10));
  assert.equal(chosen.label, "Training");
});
test("earlier race does not supersede named training", () => {
  const chosen = select([event(1, "Regatta Race"), event(3, "Team Paddling Session")]);
  assert.equal(chosen.start.slice(0, 10), new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10));
});
