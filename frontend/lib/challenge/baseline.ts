import type { HeartFields } from "@/lib/heartRiskValidation";
import type { BaselineItem, BaselineSnapshot, HealthMeasurement } from "@/lib/challenge/types";

const LOOKBACK_DAYS = 30;

function item(partial: BaselineItem): BaselineItem {
  return partial;
}

/** One session form is not a 30-day history. Values are copied once and then left unchanged. */
export function baselineFromSession(fields: HeartFields | null, capturedAt: string, lookbackDays = LOOKBACK_DAYS): BaselineSnapshot {
  const date = capturedAt.slice(0, 10);
  const items: BaselineItem[] = [];
  if (!fields) {
    return { capturedAt, lookbackDays, items, emptyMessage: "No previous measurements available. Start tracking today." };
  }

  const systolic = Number(fields.systolic);
  const diastolic = Number(fields.diastolic);
  if (Number.isFinite(systolic) && Number.isFinite(diastolic) && systolic > 0 && diastolic > 0) {
    items.push(item({
      kind: "blood_pressure",
      method: "One reading from this session’s risk-signal form. Systolic and diastolic are kept separate. This is not an average, and this app has no earlier blood-pressure history.",
      sufficient: false,
      sampleCount: 1,
      dates: [date],
      context: "unspecified",
      source: "session_form",
      unit: "mmHg",
      value: systolic,
      value2: diastolic,
    }));
  }

  const sugar = Number(fields.sugar);
  if (Number.isFinite(sugar) && sugar > 0) {
    items.push(item({
      kind: "glucose",
      method: "One glucose number from this session’s form. The form does not say whether it was fasting, after a meal, or random, so it stays unspecified and is not averaged with other contexts.",
      sufficient: false,
      sampleCount: 1,
      dates: [date],
      context: "unspecified",
      source: "session_form",
      unit: "mg/dL",
      value: sugar,
      value2: null,
    }));
  }

  const weight = Number(fields.weightKg);
  if (fields.weightUnit === "kg" && Number.isFinite(weight) && weight > 0) {
    items.push(item({
      kind: "weight",
      method: "One weight from this session’s form, in kilograms. No earlier weights are stored.",
      sufficient: false,
      sampleCount: 1,
      dates: [date],
      context: "unspecified",
      source: "session_form",
      unit: "kg",
      value: weight,
      value2: null,
    }));
  }

  return {
    capturedAt,
    lookbackDays,
    items,
    emptyMessage: items.length === 0 ? "No previous measurements available. Start tracking today." : null,
  };
}

export function snapshotMeasurement(item: BaselineItem, recordedOn: string, recordedAt: string): HealthMeasurement {
  return {
    id: `baseline-${item.kind}`,
    kind: item.kind,
    value: item.value ?? 0,
    value2: item.value2,
    unit: item.unit,
    context: item.context,
    source: item.source,
    recordedOn,
    recordedAt,
  };
}
