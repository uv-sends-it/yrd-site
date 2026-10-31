// Induction guidance must be tied to the actual scheduled session.
// Saturday's 8:00 am induction is confirmed only for the regular 8:15–8:30 am training.
export function arrivalGuidance(start) {
  if (!(start instanceof Date) || Number.isNaN(start.getTime())) {
    throw new TypeError("arrivalGuidance requires a valid event date");
  }

  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Melbourne",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(start);
  const local = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const hour = Number(local.hour);
  const minute = Number(local.minute);

  if (local.weekday === "Sat" && hour === 8 && minute >= 15 && minute <= 30) {
    return "New paddlers arrive by 8:00 am for induction and life jacket fitting.";
  }

  return "New paddlers: please contact the crew before attending to confirm this session is suitable for first-timers and when to arrive for induction.";
}
