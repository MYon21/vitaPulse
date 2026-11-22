export const CHALLENGE_DAYS = 30;

export function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(key: string, days: number) {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return dateKey(date);
}

export function dayOffset(start: string, day: string) {
  const [startYear, startMonth, startDay] = start.split("-").map(Number);
  const [year, month, date] = day.split("-").map(Number);
  const from = new Date(startYear, startMonth - 1, startDay).getTime();
  const to = new Date(year, month - 1, date).getTime();
  return Math.round((to - from) / 86_400_000);
}

export function weekday(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day).getDay();
}

export function formatLong(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
