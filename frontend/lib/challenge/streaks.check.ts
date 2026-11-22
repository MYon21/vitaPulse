import { streakCounts } from "./streaks";
import type { ActiveChallenge, HabitGoal } from "./types";

function habit(schedule: HabitGoal["schedule"] = "daily"): HabitGoal {
  return { id: "walk", title: "Walk", goal: "Walk", schedule, tip: "", measurement: "activity" };
}

function challenge(partial: Partial<ActiveChallenge>): ActiveChallenge {
  return {
    startedOn: "2026-11-16",
    endsOn: "2026-12-15",
    journey: "prevent",
    condition: null,
    habits: [habit()],
    checks: {},
    pausedDates: [],
    baseline: { capturedAt: "2026-11-16T00:00:00.000Z", lookbackDays: 30, items: [], emptyMessage: null },
    measurements: [],
    reminders: "onscreen",
    careNotes: { symptoms: "", appointment: "", question: "" },
    ...partial,
  };
}

function complete(date: string) {
  return { [date]: { walk: { completed: true, completedAt: `${date}T12:00:00.000Z`, note: "", edits: [] } } };
}

const twoDays = challenge({
  checks: { ...complete("2026-11-16"), ...complete("2026-11-17") },
});
const two = streakCounts(twoDays, "2026-11-17");
if (two.current !== 2 || two.best !== 2) throw new Error(`expected streak 2, got ${two.current}/${two.best}`);

const unfinishedToday = streakCounts(challenge({ checks: complete("2026-11-16") }), "2026-11-17");
if (unfinishedToday.current !== 1) throw new Error(`unfinished today should keep yesterday, got ${unfinishedToday.current}`);

const missed = streakCounts(challenge({ checks: complete("2026-11-18") }), "2026-11-18");
if (missed.current !== 1 || missed.best !== 1) throw new Error(`missed earlier days should reset, got ${missed.current}/${missed.best}`);

const weekend = challenge({
  startedOn: "2026-11-20",
  habits: [habit("weekdays")],
  checks: complete("2026-11-20"),
});
const acrossWeekend = streakCounts(weekend, "2026-11-23");
if (acrossWeekend.current !== 1) throw new Error(`weekend rest should not break Friday, got ${acrossWeekend.current}`);

const paused = challenge({
  pausedDates: ["2026-11-17"],
  checks: complete("2026-11-16"),
});
const pausedStreak = streakCounts(paused, "2026-11-17");
if (pausedStreak.current !== 1) throw new Error(`pause should not break the streak, got ${pausedStreak.current}`);

console.log("streak checks passed");
