import { addDays } from "@/lib/challenge/dates";
import type { ActiveChallenge, ComparisonRow, HealthMeasurement, MeasurementKind } from "@/lib/challenge/types";

export type CompareWindow = 7 | 14 | 30 | 90;

const LABELS: Record<MeasurementKind, string> = {
  blood_pressure: "Blood pressure",
  glucose: "Glucose",
  weight: "Weight",
  sleep: "Sleep",
  activity: "Activity",
};

function formatValue(reading: HealthMeasurement) {
  if (reading.kind === "blood_pressure") return `${reading.value}/${reading.value2} ${reading.unit}`;
  return `${reading.value} ${reading.unit}`;
}

function sameContext(left: HealthMeasurement, right: HealthMeasurement) {
  return left.kind === right.kind && left.context === right.context && left.unit === right.unit;
}

export function comparisonRows(challenge: ActiveChallenge, today: string, windowDays: CompareWindow): ComparisonRow[] {
  const windowStart = addDays(today, -(windowDays - 1));
  const rows: ComparisonRow[] = [];

  for (const base of challenge.baseline.items) {
    if (base.value === null) continue;
    const baselineReading: HealthMeasurement = {
      id: `base-${base.kind}`,
      kind: base.kind,
      value: base.value,
      value2: base.value2,
      unit: base.unit,
      context: base.context,
      source: base.source,
      recordedOn: base.dates[0] ?? challenge.startedOn,
      recordedAt: challenge.baseline.capturedAt,
    };
    const newer = challenge.measurements
      .filter((item) => item.source === "user_entered" && item.recordedOn >= windowStart && item.recordedOn <= today && sameContext(item, baselineReading))
      .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
    const current = newer.at(-1);
    let change = "No newer comparable reading in this window.";
    if (current && base.kind === "blood_pressure" && current.value2 !== null && base.value2 !== null) {
      change = `${current.value - base.value} / ${current.value2 - base.value2} ${base.unit}`;
    } else if (current && base.kind !== "blood_pressure") {
      const delta = Math.round((current.value - base.value) * 10) / 10;
      change = `${delta > 0 ? "+" : ""}${delta} ${base.unit}`;
    }
    const periodNote = base.sampleCount === 1
      ? `Baseline is 1 reading on ${baselineReading.recordedOn}, not a ${challenge.baseline.lookbackDays}-day aggregate. The comparison window is ${windowDays} days ending ${today}.`
      : `Baseline uses ${base.sampleCount} readings. The comparison window is ${windowDays} days.`;
    rows.push({
      label: LABELS[base.kind],
      baseline: formatValue(baselineReading),
      current: current ? formatValue(current) : "No newer reading",
      change,
      note: `${periodNote} ${base.method}`,
    });
  }

  for (const kind of ["blood_pressure", "glucose", "weight", "sleep", "activity"] as MeasurementKind[]) {
    if (rows.some((row) => row.label === LABELS[kind])) continue;
    const readings = challenge.measurements.filter((item) => item.kind === kind && item.recordedOn >= challenge.startedOn && item.recordedOn <= today);
    if (readings.length === 0) continue;
    const latest = [...readings].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt)).at(-1);
    if (!latest) continue;
    rows.push({
      label: LABELS[kind],
      baseline: "No baseline",
      current: formatValue(latest),
      change: "No earlier comparable record.",
      note: kind === "sleep"
        ? "Sleep hours are user-reported. There is no wearable source in this app."
        : kind === "activity"
          ? "Activity minutes are what you enter. One day is not compared with a 30-day total."
          : "This reading was entered during the challenge. There is no earlier record to subtract from it.",
    });
  }

  return rows;
}

export function seriesFor(challenge: ActiveChallenge, kind: MeasurementKind) {
  return challenge.measurements
    .filter((item) => item.kind === kind)
    .sort((a, b) => a.recordedOn.localeCompare(b.recordedOn) || a.recordedAt.localeCompare(b.recordedAt))
    .map((item) => ({
      date: item.recordedOn,
      value: item.value,
      value2: item.value2,
      context: item.context,
      source: item.source,
    }));
}
