import { addDays, CHALLENGE_DAYS, dayOffset, weekday } from "@/lib/challenge/dates";
import type { ActiveChallenge, HabitGoal } from "@/lib/challenge/types";

export type DayMark = "complete" | "partial" | "missed" | "upcoming" | "rest" | "paused" | "outside";

export function scheduledHabits(habits: HabitGoal[], dateKey: string, pausedDates: string[]) {
  if (pausedDates.includes(dateKey)) return [];
  const day = weekday(dateKey);
  return habits.filter((habit) => (habit.schedule === "weekdays" ? day >= 1 && day <= 5 : true));
}

export function dayMark(challenge: ActiveChallenge, dateKey: string, today: string): DayMark {
  const offset = dayOffset(challenge.startedOn, dateKey);
  if (offset < 0 || offset >= CHALLENGE_DAYS) return "outside";
  if (dateKey > today) return "upcoming";
  if (challenge.pausedDates.includes(dateKey)) return "paused";
  const scheduled = scheduledHabits(challenge.habits, dateKey, []);
  if (scheduled.length === 0) return "rest";
  const done = scheduled.filter((habit) => challenge.checks[dateKey]?.[habit.id]?.completed).length;
  if (done === scheduled.length) return "complete";
  if (dateKey === today && done === 0) return "partial";
  if (done > 0) return "partial";
  return "missed";
}

function extendsStreak(mark: DayMark) {
  return mark === "complete" || mark === "rest" || mark === "paused";
}

export function streakCounts(challenge: ActiveChallenge, today: string) {
  const end = challenge.endsOn;
  const last = today < end ? today : end;
  let best = 0;
  let run = 0;
  for (let index = 0; index < CHALLENGE_DAYS; index += 1) {
    const day = addDays(challenge.startedOn, index);
    if (day > last) break;
    const mark = dayMark(challenge, day, today);
    if (mark === "complete") {
      run += 1;
      best = Math.max(best, run);
    } else if (mark === "rest" || mark === "paused") {
      best = Math.max(best, run);
    } else if (day < today) {
      run = 0;
    }
  }

  let current = 0;
  let cursor = dayMark(challenge, today, today) === "complete" || today > end ? (today > end ? end : today) : addDays(today, -1);
  while (cursor >= challenge.startedOn && cursor <= end) {
    const mark = dayMark(challenge, cursor, today);
    if (mark === "complete") current += 1;
    else if (!extendsStreak(mark)) break;
    cursor = addDays(cursor, -1);
  }
  return { current, best };
}

export function adherence(challenge: ActiveChallenge, today: string) {
  let scheduled = 0;
  let completed = 0;
  const through = today < challenge.endsOn ? today : challenge.endsOn;
  for (let index = 0; index < CHALLENGE_DAYS; index += 1) {
    const day = addDays(challenge.startedOn, index);
    if (day > through) break;
    if (challenge.pausedDates.includes(day)) continue;
    const habits = scheduledHabits(challenge.habits, day, []);
    scheduled += habits.length;
    completed += habits.filter((habit) => challenge.checks[day]?.[habit.id]?.completed).length;
  }
  return { scheduled, completed, percent: scheduled === 0 ? 0 : Math.round((completed / scheduled) * 100) };
}
