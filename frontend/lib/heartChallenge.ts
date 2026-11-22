export const CHALLENGE_DAYS = 30;
const STORAGE_KEY = "vitapulse-heart-challenge";

export const CHALLENGE_HABITS = [
  { id: "walk", title: "Walk", text: "A short walk counts." },
  { id: "strength", title: "Strength moves", text: "A short strength set." },
  { id: "tobacco", title: "Avoid tobacco", text: "Stay tobacco-free today." },
  { id: "pressure", title: "Log blood pressure", text: "Write down today’s reading." },
  { id: "sugar", title: "Log blood sugar", text: "Note a glucose reading if you check it." },
  { id: "food", title: "Heart-smart meal", text: "One meal built around plants and lean protein." },
  { id: "plants", title: "More plants", text: "Add fruit or vegetables." },
  { id: "salt", title: "Less salt", text: "Keep the day’s salt modest." },
  { id: "alcohol", title: "Limit alcohol", text: "Skip an extra drink." },
  { id: "sleep", title: "Sleep 7 hours", text: "Aim for a steady night." },
  { id: "stress", title: "Stress break", text: "A few calm minutes." },
] as const;

export type ChallengeHabitId = (typeof CHALLENGE_HABITS)[number]["id"];

export type ChallengeRecord = {
  startedOn: string;
  habitIds: ChallengeHabitId[];
  checks: Record<string, ChallengeHabitId[]>;
};

export function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(key: string, days: number) {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return todayKey(date);
}

export function dayOffset(start: string, day: string) {
  const [startYear, startMonth, startDay] = start.split("-").map(Number);
  const [year, month, date] = day.split("-").map(Number);
  const from = new Date(startYear, startMonth - 1, startDay).getTime();
  const to = new Date(year, month - 1, date).getTime();
  return Math.round((to - from) / 86_400_000);
}

export function challengeEnd(startedOn: string) {
  return addDays(startedOn, CHALLENGE_DAYS - 1);
}

export function weekStart(day: string) {
  const [year, month, date] = day.split("-").map(Number);
  const value = new Date(year, month - 1, date);
  value.setDate(value.getDate() - value.getDay());
  return todayKey(value);
}

export function weekDays(start: string) {
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function formatShort(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function weekdayLetter(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { weekday: "narrow" });
}

export function isDayComplete(record: ChallengeRecord, day: string) {
  const done = record.checks[day] ?? [];
  return record.habitIds.every((id) => done.includes(id));
}

export function streaks(record: ChallengeRecord, today = todayKey()) {
  const end = challengeEnd(record.startedOn);
  const lastCounted = today < end ? today : end;
  let best = 0;
  let run = 0;
  for (let index = 0; index < CHALLENGE_DAYS; index += 1) {
    const day = addDays(record.startedOn, index);
    if (day > lastCounted) break;
    if (isDayComplete(record, day)) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }

  const anchor = isDayComplete(record, today) ? today : addDays(today, -1);
  let current = 0;
  let cursor = anchor;
  while (cursor >= record.startedOn && cursor <= end && isDayComplete(record, cursor)) {
    current += 1;
    cursor = addDays(cursor, -1);
  }
  return { current, best };
}

export function loadChallenge(): ChallengeRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ChallengeRecord;
    if (!parsed.startedOn || !Array.isArray(parsed.habitIds) || parsed.habitIds.length < 2 || parsed.habitIds.length > 3) return null;
    return { startedOn: parsed.startedOn, habitIds: parsed.habitIds, checks: parsed.checks ?? {} };
  } catch {
    return null;
  }
}

export function saveChallenge(record: ChallengeRecord) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

export function clearChallenge() {
  window.localStorage.removeItem(STORAGE_KEY);
}
