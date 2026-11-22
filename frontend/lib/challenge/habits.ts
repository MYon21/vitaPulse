import type { HabitGoal, HabitSchedule, Journey } from "@/lib/challenge/types";

export const HABIT_CATALOG: HabitGoal[] = [
  { id: "walk", title: "Walk or move", goal: "A walk or other activity you already tolerate.", schedule: "daily", tip: "Stop if you feel chest pressure, severe shortness of breath, or faint. This is not an exercise prescription.", measurement: "activity" },
  { id: "pressure", title: "Record blood pressure", goal: "Write down a reading when you take one.", schedule: "daily", tip: "One home reading is a record, not a diagnosis.", measurement: "blood_pressure" },
  { id: "meal", title: "Heart-healthy meal", goal: "One meal with vegetables, whole grains, or lean protein.", schedule: "daily", tip: "This does not set a diet, salt limit, or fluid limit.", measurement: null },
  { id: "tobacco", title: "Avoid tobacco", goal: "Stay tobacco-free today.", schedule: "daily", tip: "Cigarettes, vaping, and other nicotine products count.", measurement: null },
  { id: "sleep", title: "Consistent sleep", goal: "Keep a steady bedtime and record hours slept.", schedule: "daily", tip: "Hours here are what you report, not a wearable estimate.", measurement: "sleep" },
  { id: "stress", title: "Stress practice", goal: "A few calm minutes.", schedule: "daily", tip: "A short pause counts. It does not treat anxiety or heart disease.", measurement: null },
  { id: "weight", title: "Track weight", goal: "Record weight on the days you choose.", schedule: "weekdays", tip: "Use the same scale and unit when you can.", measurement: "weight" },
  { id: "monitor", title: "Clinician monitoring", goal: "Follow the checks your clinician already asked for.", schedule: "daily", tip: "Enter only the routine they already set. Do not add tests because of this challenge.", measurement: "glucose" },
  { id: "medications", title: "Prescribed medicines", goal: "Take medicines as already directed.", schedule: "daily", tip: "Do not start, stop, or change a dose because of this challenge.", measurement: null },
  { id: "appointments", title: "Keep appointments", goal: "Note a visit that is already scheduled.", schedule: "weekdays", tip: "This is a reminder on this screen, not a clinic message.", measurement: null },
];

export const LIVING_HABIT_IDS = ["medications", "monitor", "appointments", "pressure", "weight"];

export function habitsForJourney(journey: Journey) {
  if (journey === "living") return HABIT_CATALOG;
  return HABIT_CATALOG.filter((habit) => habit.id !== "medications");
}

export function goalsFromIds(ids: string[], targets: Record<string, string>, schedules: Record<string, HabitSchedule>): HabitGoal[] {
  return ids.flatMap((id) => {
    const habit = HABIT_CATALOG.find((item) => item.id === id);
    if (!habit) return [];
    return [{ ...habit, goal: targets[id]?.trim() || habit.goal, schedule: schedules[id] ?? habit.schedule }];
  });
}
