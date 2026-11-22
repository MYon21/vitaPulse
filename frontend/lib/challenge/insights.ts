import { addDays } from "@/lib/challenge/dates";
import { scheduledHabits } from "@/lib/challenge/streaks";
import type { ActiveChallenge, Insight } from "@/lib/challenge/types";

export function buildInsights(challenge: ActiveChallenge, today: string): Insight[] {
  const insights: Insight[] = [];
  const weekStart = addDays(today, -6);
  let scheduled = 0;
  let done = 0;
  for (let index = 0; index < 7; index += 1) {
    const day = addDays(weekStart, index);
    if (day < challenge.startedOn || day > today || day > challenge.endsOn) continue;
    const habits = scheduledHabits(challenge.habits, day, challenge.pausedDates).filter((habit) => habit.measurement === "activity" || habit.id === "walk");
    scheduled += habits.length;
    done += habits.filter((habit) => challenge.checks[day]?.[habit.id]?.completed).length;
  }
  if (scheduled > 0) {
    insights.push({
      id: "activity-habit",
      text: `You completed your activity habit on ${done} of ${scheduled} scheduled days.`,
      period: `${weekStart} to ${today}`,
      source: "Challenge check-ins on this device session",
      explanation: "A completed day means the checkbox for a scheduled activity habit was marked. A checkbox is not a medical result.",
      next: "Keep the same activity you already tolerate. Do not raise intensity because of the streak.",
    });
  }

  const pressureBase = challenge.baseline.items.find((item) => item.kind === "blood_pressure" && item.value !== null && item.value2 !== null);
  const pressures = challenge.measurements.filter((item) => item.kind === "blood_pressure" && item.source === "user_entered" && item.value2 !== null);
  const latestPressure = [...pressures].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt)).at(-1);
  if (pressureBase && latestPressure && pressureBase.value !== null && pressureBase.value2 !== null && latestPressure.value2 !== null) {
    const lower = latestPressure.value < pressureBase.value && latestPressure.value2 < pressureBase.value2;
    const higher = latestPressure.value > pressureBase.value && latestPressure.value2 > pressureBase.value2;
    if (lower || higher) {
      insights.push({
        id: "bp-direction",
        text: lower
          ? "Your latest blood pressure recording is lower than the earlier recorded reading."
          : "Your latest blood pressure recording is higher than the earlier recorded reading.",
        period: `${pressureBase.dates[0] ?? challenge.startedOn} to ${latestPressure.recordedOn}`,
        source: `${pressureBase.source} compared with ${latestPressure.source}`,
        explanation: `The earlier reading is ${pressureBase.value}/${pressureBase.value2} mmHg from ${pressureBase.sampleCount} sample. The latest is ${latestPressure.value}/${latestPressure.value2} mmHg. Two readings do not show that cardiovascular risk changed.`,
        next: "Keep recording comparable readings. Ask a clinician before changing treatment.",
      });
    }
  }

  const glucose = challenge.measurements.filter((item) => item.kind === "glucose");
  const thisWeek = glucose.filter((item) => item.recordedOn >= weekStart && item.recordedOn <= today).length;
  const lastWeek = glucose.filter((item) => item.recordedOn >= addDays(weekStart, -7) && item.recordedOn < weekStart).length;
  if (glucose.length > 0 && thisWeek !== lastWeek) {
    insights.push({
      id: "glucose-count",
      text: thisWeek < lastWeek
        ? "You have fewer glucose readings this week than last week."
        : "You have more glucose readings this week than last week.",
      period: `${addDays(weekStart, -7)} to ${today}`,
      source: "Readings entered in this challenge",
      explanation: `${lastWeek} reading${lastWeek === 1 ? "" : "s"} in the earlier 7 days and ${thisWeek} in the latest 7 days. Counts are not combined across fasting and after-meal contexts.`,
      next: "Add a reading only if that check is already part of your routine.",
    });
  }

  const sleep = challenge.measurements.filter((item) => item.kind === "sleep" && item.context === "user_reported");
  if (sleep.length >= 2) {
    const ordered = [...sleep].sort((a, b) => a.recordedOn.localeCompare(b.recordedOn));
    const mid = Math.floor(ordered.length / 2);
    const early = ordered.slice(0, mid);
    const late = ordered.slice(mid);
    const average = (rows: typeof sleep) => rows.reduce((sum, row) => sum + row.value, 0) / rows.length;
    const earlyAverage = average(early);
    const lateAverage = average(late);
    if (Math.abs(lateAverage - earlyAverage) >= 0.5) {
      insights.push({
        id: "sleep-average",
        text: lateAverage > earlyAverage
          ? "Your average reported sleep duration increased over the selected records."
          : "Your average reported sleep duration decreased over the selected records.",
        period: `${ordered[0].recordedOn} to ${ordered.at(-1)?.recordedOn}`,
        source: "User-reported hours, not a wearable",
        explanation: `Earlier records average ${earlyAverage.toFixed(1)} hours (${early.length} nights). Later records average ${lateAverage.toFixed(1)} hours (${late.length} nights).`,
        next: "Keep noting hours the same way if you want the comparison to stay meaningful.",
      });
    }
  }

  if (insights.length === 0) {
    insights.push({
      id: "need-data",
      text: "There are not enough records yet for a comparison.",
      period: `${challenge.startedOn} to ${today}`,
      source: "This session",
      explanation: "An insight is shown only when a check-in count or a comparable measurement supports it.",
      next: "Check in on a scheduled habit, or add a reading you actually took.",
    });
  }
  return insights;
}
