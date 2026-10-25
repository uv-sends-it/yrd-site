import fs from "node:fs";

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  console.error("Usage: node scripts/sync-teamapp-schedule.mjs <input.ics> <output.json>");
  process.exit(1);
}

const raw = fs.readFileSync(inputPath, "utf8");
const unfolded = raw.replace(/\r?\n[ \t]/g, "");
const blocks = [...unfolded.matchAll(/BEGIN:VEVENT\r?\n([\s\S]*?)\r?\nEND:VEVENT/g)].map((match) => match[1]);

function valueFor(block, name) {
  const line = block.split(/\r?\n/).find((entry) => entry.startsWith(name + ":") || entry.startsWith(name + ";"));
  if (!line) return "";
  return line
    .slice(line.indexOf(":") + 1)
    .replace(/\\,/g, ",")
    .replace(/\\n/gi, " ")
    .replace(/\\;/g, ";")
    .trim();
}

function parseDate(value) {
  if (!value) return null;
  if (/^\d{8}$/.test(value)) {
    const y = Number(value.slice(0, 4));
    const m = Number(value.slice(4, 6));
    const d = Number(value.slice(6, 8));
    return new Date(y, m - 1, d, 0, 0, 0);
  }

  const match = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z)?$/);
  if (!match) return null;

  const [, y, m, d, hh, mm, ss = "00", z] = match;
  if (z) {
    return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss)));
  }

  return new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss));
}

function melbourneParts(date) {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Melbourne",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

const now = new Date();
const maxFuture = new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000);

const events = blocks
  .map((block) => {
    const start = parseDate(valueFor(block, "DTSTART"));
    const summary = valueFor(block, "SUMMARY");
    const description = valueFor(block, "DESCRIPTION");
    const location = valueFor(block, "LOCATION");
    const status = valueFor(block, "STATUS").toUpperCase();

    return {
      start,
      summary,
      description,
      location,
      cancelled:
        status === "CANCELLED" ||
        /\b(cancelled|canceled|no training)\b/i.test(summary + " " + description)
    };
  })
  .filter((event) => event.start && event.start >= now && event.start <= maxFuture);

function eventScore(event) {
  const text = [event.summary, event.description, event.location].join(" ").toLowerCase();
  const parts = melbourneParts(event.start);
  const hour = Number(parts.hour);
  const minute = Number(parts.minute);
  let score = 0;

  if (/\btraining\b/i.test(text)) score += 140;
  if (/\bpaddl(?:e|ing|ers?)\b/i.test(text)) score += 90;
  if (/come\s*(?:&|and)?\s*try/i.test(text)) score += 120;
  if (/\bsession\b/i.test(text)) score += 45;

  if (parts.weekday === "Sat") score += 110;
  if (hour >= 7 && hour <= 10) score += 45;
  if (hour === 8 && minute >= 0 && minute <= 30) score += 70;
  if (hour === 8 && minute === 15) score += 80;

  if (/community boating hub|912 collins|docklands/i.test(text)) score += 45;

  if (/\b(regatta|race|racing|championship|competition|committee|meeting|agm|social|dinner|party|festival|fundraiser|workshop)\b/i.test(text)) {
    score -= 220;
  }

  const daysAway = Math.max(0, Math.floor((event.start - now) / (24 * 60 * 60 * 1000)));
  score -= Math.min(daysAway, 28);
  return score;
}

const candidates = events
  .map((event) => ({ ...event, score: eventScore(event) }))
  .filter((event) => event.score >= 120)
  .sort((a, b) => b.score - a.score || a.start - b.start);

if (!candidates.length) {
  console.log("No confident YRD training session found; keeping fallback schedule.");
  process.exit(0);
}

const next = candidates[0];

const displayDay = new Intl.DateTimeFormat("en-AU", {
  weekday: "long",
  day: "numeric",
  month: "short",
  timeZone: "Australia/Melbourne"
}).format(next.start);

const time = new Intl.DateTimeFormat("en-AU", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Australia/Melbourne"
}).format(next.start).toLowerCase();

const isComeAndTry = /come\s*(?:&|and)?\s*try/i.test(next.summary + " " + next.description);

const output = {
  source: "teamapp-build-sync",
  syncedAt: new Date().toISOString(),
  sessions: [
    {
      day: displayDay,
      time,
      label: isComeAndTry ? "Come & Try" : "Saturday training",
      cancelled: next.cancelled,
      notes: next.cancelled
        ? "Cancelled. Check TeamApp or Facebook for the latest update."
        : "New paddlers arrive by 8:00 am for induction and PFD fitting."
    }
  ]
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");
console.log(`Synced YRD session: ${displayDay} ${time}${next.cancelled ? " (cancelled)" : ""}`);
