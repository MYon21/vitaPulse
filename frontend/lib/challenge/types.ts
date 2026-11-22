export type Journey = "prevent" | "living";

export type HeartCondition =
  | "coronary"
  | "heart_attack"
  | "heart_failure"
  | "arrhythmia"
  | "valve"
  | "other";

export type HabitSchedule = "daily" | "weekdays";

export type MeasurementKind = "blood_pressure" | "glucose" | "weight" | "sleep" | "activity";

export type GlucoseContext = "unspecified" | "fasting" | "post_meal" | "random";

export type MeasurementSource = "session_form" | "user_entered";

export type HabitGoal = {
  id: string;
  title: string;
  goal: string;
  schedule: HabitSchedule;
  tip: string;
  measurement: MeasurementKind | null;
};

export type CheckEdit = {
  at: string;
  completed: boolean;
  note: string;
};

export type HabitCheck = {
  completed: boolean;
  completedAt: string | null;
  note: string;
  edits: CheckEdit[];
};

export type HealthMeasurement = {
  id: string;
  kind: MeasurementKind;
  value: number;
  value2: number | null;
  unit: string;
  context: GlucoseContext | "user_reported" | "unspecified";
  source: MeasurementSource;
  recordedOn: string;
  recordedAt: string;
};

export type BaselineItem = {
  kind: MeasurementKind;
  method: string;
  sufficient: boolean;
  sampleCount: number;
  dates: string[];
  context: HealthMeasurement["context"];
  source: MeasurementSource;
  unit: string;
  value: number | null;
  value2: number | null;
};

export type BaselineSnapshot = {
  capturedAt: string;
  lookbackDays: number;
  items: BaselineItem[];
  emptyMessage: string | null;
};

export type ActiveChallenge = {
  startedOn: string;
  endsOn: string;
  journey: Journey;
  condition: HeartCondition | null;
  habits: HabitGoal[];
  checks: Record<string, Record<string, HabitCheck>>;
  pausedDates: string[];
  baseline: BaselineSnapshot;
  measurements: HealthMeasurement[];
  reminders: "onscreen";
  careNotes: { symptoms: string; appointment: string; question: string };
};

export type ComparisonRow = {
  label: string;
  baseline: string;
  current: string;
  change: string;
  note: string;
};

export type Insight = {
  id: string;
  text: string;
  period: string;
  source: string;
  explanation: string;
  next: string;
};
