import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

function upcoming(days) {
  return new Date(Date.now() + days * 86400000).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}
function event(days, title) {
  return ["BEGIN:VEVENT", "DTSTART:" + upcoming(days), "SUMMARY:" + title, "END:VEVENT"].join("\n");
}
function sync(list) {
  const dir=mkdtempSync(join(tmpdir(),"yrd-session-"));
  try {
    const from=join(dir,"input.ics"),to=join(dir,"output.json");
    writeFileSync(from,"BEGIN:VCALENDAR\n"+list.join("\n")+"\nEND:VCALENDAR\n");
    const result=spawnSync(process.execPath,["scripts/sync-teamapp-schedule.mjs",from,to],{env:{...process.env,TZ:"Australia/Melbourne"},encoding:"utf8"});
    assert.equal(result.status,0,result.stderr);
    return JSON.parse(readFileSync(to,"utf8"));
  } finally {rmSync(dir,{recursive:true,force:true});}
}
test("earliest upcoming training wins, irrespective of weekday",()=>{
  const data=sync([event(5,"Saturday Training"),event(2,"Wednesday Training")]);
  assert.equal(data.sessions[0].start.slice(0,10), new Date(Date.now()+2*86400000).toISOString().slice(0,10));
  assert.equal(data.sessions[0].label,"Training");
});
test("race does not take precedence over training",()=>{
  const data=sync([event(1,"Regatta Race"),event(3,"Team Paddling Session")]);
  assert.equal(data.sessions[0].start.slice(0,10), new Date(Date.now()+3*86400000).toISOString().slice(0,10));
});
