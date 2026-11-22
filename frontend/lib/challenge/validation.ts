import type { GlucoseContext, HealthMeasurement, MeasurementKind } from "@/lib/challenge/types";

export type MeasurementDraft = {
  kind: MeasurementKind;
  value: string;
  value2: string;
  context: HealthMeasurement["context"];
  recordedOn: string;
};

export function validateMeasurement(draft: MeasurementDraft, existing: HealthMeasurement[]): { ok: true; measurement: Omit<HealthMeasurement, "id" | "recordedAt" | "source"> } | { ok: false; error: string } {
  const value = Number(draft.value);
  const value2 = draft.value2.trim() === "" ? null : Number(draft.value2);
  if (!draft.recordedOn) return { ok: false, error: "Choose the measurement date." };

  if (draft.kind === "blood_pressure") {
    if (!Number.isFinite(value) || value < 70 || value > 250) return { ok: false, error: "Systolic must be from 70 to 250 mmHg." };
    if (value2 === null || !Number.isFinite(value2) || value2 < 40 || value2 > 150 || value2 >= value) return { ok: false, error: "Diastolic must be from 40 to 150 and below systolic." };
  } else if (draft.kind === "glucose") {
    if (!Number.isFinite(value) || value < 40 || value > 400) return { ok: false, error: "Glucose must be from 40 to 400 mg/dL." };
    if (!["fasting", "post_meal", "random", "unspecified"].includes(draft.context)) return { ok: false, error: "Choose whether this glucose reading is fasting, after a meal, random, or unspecified." };
  } else if (draft.kind === "weight") {
    if (!Number.isFinite(value) || value < 30 || value > 300) return { ok: false, error: "Weight must be from 30 to 300 kg." };
  } else if (draft.kind === "sleep") {
    if (!Number.isFinite(value) || value <= 0 || value > 24) return { ok: false, error: "Sleep must be more than 0 and at most 24 hours." };
  } else if (!Number.isFinite(value) || value < 0 || value > 1440) {
    return { ok: false, error: "Activity must be from 0 to 1440 minutes." };
  }

  const context = draft.kind === "sleep" ? "user_reported" : draft.kind === "glucose" ? (draft.context as GlucoseContext) : "unspecified";
  const unit = draft.kind === "blood_pressure" ? "mmHg" : draft.kind === "glucose" ? "mg/dL" : draft.kind === "weight" ? "kg" : draft.kind === "sleep" ? "hours" : "minutes";
  const duplicate = existing.some((item) => item.kind === draft.kind && item.context === context && item.recordedOn === draft.recordedOn && item.value === value && item.value2 === value2);
  if (duplicate) return { ok: false, error: "That reading is already saved for this date." };

  return { ok: true, measurement: { kind: draft.kind, value, value2, unit, context, recordedOn: draft.recordedOn } };
}
