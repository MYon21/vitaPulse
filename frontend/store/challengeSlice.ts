import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { baselineFromSession } from "@/lib/challenge/baseline";
import { addDays, CHALLENGE_DAYS, dateKey } from "@/lib/challenge/dates";
import { goalsFromIds } from "@/lib/challenge/habits";
import { validateMeasurement, type MeasurementDraft } from "@/lib/challenge/validation";
import type { ActiveChallenge, HabitSchedule, HeartCondition, Journey } from "@/lib/challenge/types";
import type { HeartFields } from "@/lib/heartRiskValidation";

export type ChallengeDraft = {
  journey: Journey | "";
  condition: HeartCondition | "";
  habitIds: string[];
  targets: Record<string, string>;
  schedules: Record<string, HabitSchedule>;
  consentReuse: boolean;
  confirmed: boolean;
};

type ChallengeState = {
  setupOpen: boolean;
  step: 1 | 2 | 3 | 4;
  draft: ChallengeDraft;
  active: ActiveChallenge | null;
  focusDate: string;
  compareWindow: 7 | 14 | 30 | 90;
  chart: "blood_pressure" | "glucose" | "weight" | "sleep" | "activity" | "adherence";
  message: string | null;
};

const emptyDraft: ChallengeDraft = {
  journey: "",
  condition: "",
  habitIds: [],
  targets: {},
  schedules: {},
  consentReuse: false,
  confirmed: false,
};

const initialState: ChallengeState = {
  setupOpen: false,
  step: 1,
  draft: emptyDraft,
  active: null,
  focusDate: dateKey(),
  compareWindow: 30,
  chart: "blood_pressure",
  message: null,
};

function blankCheck() {
  return { completed: false, completedAt: null, note: "", edits: [] };
}

const challengeSlice = createSlice({
  name: "challenge",
  initialState,
  reducers: {
    openSetup(state) {
      state.setupOpen = true;
      state.step = 1;
      state.message = null;
    },
    closeSetup(state) {
      state.setupOpen = false;
    },
    setStep(state, action: PayloadAction<ChallengeState["step"]>) {
      state.step = action.payload;
      state.message = null;
    },
    setJourney(state, action: PayloadAction<Journey>) {
      state.draft.journey = action.payload;
      if (action.payload === "prevent") state.draft.condition = "";
    },
    setCondition(state, action: PayloadAction<ChallengeDraft["condition"]>) {
      state.draft.condition = action.payload;
    },
    toggleDraftHabit(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.draft.habitIds.includes(id)) state.draft.habitIds = state.draft.habitIds.filter((item) => item !== id);
      else if (state.draft.habitIds.length < 3) state.draft.habitIds.push(id);
    },
    setTarget(state, action: PayloadAction<{ id: string; value: string }>) {
      state.draft.targets[action.payload.id] = action.payload.value;
    },
    setSchedule(state, action: PayloadAction<{ id: string; value: HabitSchedule }>) {
      state.draft.schedules[action.payload.id] = action.payload.value;
    },
    setConsent(state, action: PayloadAction<boolean>) {
      state.draft.consentReuse = action.payload;
    },
    setConfirmed(state, action: PayloadAction<boolean>) {
      state.draft.confirmed = action.payload;
    },
    activateChallenge(state, action: PayloadAction<{ fields: HeartFields | null; hasAssessment: boolean }>) {
      if (!state.draft.journey || state.draft.habitIds.length < 2 || state.draft.habitIds.length > 3 || !state.draft.confirmed) {
        state.message = "Choose a journey, two or three habits, and confirm this is educational.";
        return;
      }
      const startedOn = dateKey();
      const capturedAt = new Date().toISOString();
      const useFields = state.draft.consentReuse && action.payload.hasAssessment ? action.payload.fields : null;
      state.active = {
        startedOn,
        endsOn: addDays(startedOn, CHALLENGE_DAYS - 1),
        journey: state.draft.journey,
        condition: state.draft.condition || null,
        habits: goalsFromIds(state.draft.habitIds, state.draft.targets, state.draft.schedules),
        checks: {},
        pausedDates: [],
        baseline: baselineFromSession(useFields, capturedAt),
        measurements: [],
        reminders: "onscreen",
        careNotes: { symptoms: "", appointment: "", question: "" },
      };
      state.focusDate = startedOn;
      state.setupOpen = false;
      state.message = null;
    },
    setFocusDate(state, action: PayloadAction<string>) {
      state.focusDate = action.payload;
    },
    toggleCheck(state, action: PayloadAction<{ date: string; habitId: string }>) {
      const { date, habitId } = action.payload;
      if (!state.active || date > dateKey() || date < state.active.startedOn || date > state.active.endsOn) return;
      const day = state.active.checks[date] ?? {};
      const current = day[habitId] ?? blankCheck();
      const completed = !current.completed;
      const at = new Date().toISOString();
      day[habitId] = {
        completed,
        completedAt: completed ? at : null,
        note: current.note,
        edits: [...current.edits, { at, completed, note: current.note }],
      };
      state.active.checks[date] = day;
    },
    setCheckNote(state, action: PayloadAction<{ date: string; habitId: string; note: string }>) {
      const { date, habitId, note } = action.payload;
      if (!state.active) return;
      const day = state.active.checks[date] ?? {};
      const current = day[habitId] ?? blankCheck();
      const at = new Date().toISOString();
      day[habitId] = { ...current, note, edits: [...current.edits, { at, completed: current.completed, note }] };
      state.active.checks[date] = day;
    },
    togglePause(state, action: PayloadAction<string>) {
      if (!state.active) return;
      const date = action.payload;
      state.active.pausedDates = state.active.pausedDates.includes(date)
        ? state.active.pausedDates.filter((item) => item !== date)
        : [...state.active.pausedDates, date];
    },
    addMeasurement(state, action: PayloadAction<MeasurementDraft>) {
      if (!state.active) return;
      const parsed = validateMeasurement(action.payload, state.active.measurements);
      if (!parsed.ok) {
        state.message = parsed.error;
        return;
      }
      state.active.measurements.push({
        ...parsed.measurement,
        id: `m-${state.active.measurements.length + 1}-${Date.now()}`,
        source: "user_entered",
        recordedAt: new Date().toISOString(),
      });
      state.message = null;
    },
    setCompareWindow(state, action: PayloadAction<ChallengeState["compareWindow"]>) {
      state.compareWindow = action.payload;
    },
    setChart(state, action: PayloadAction<ChallengeState["chart"]>) {
      state.chart = action.payload;
    },
    clearMessage(state) {
      state.message = null;
    },
    setCareNote(state, action: PayloadAction<{ key: "symptoms" | "appointment" | "question"; value: string }>) {
      if (!state.active) return;
      state.active.careNotes[action.payload.key] = action.payload.value;
    },
  },
});

export const {
  openSetup,
  closeSetup,
  setStep,
  setJourney,
  setCondition,
  toggleDraftHabit,
  setTarget,
  setSchedule,
  setConsent,
  setConfirmed,
  activateChallenge,
  setFocusDate,
  toggleCheck,
  setCheckNote,
  togglePause,
  addMeasurement,
  setCompareWindow,
  setChart,
  clearMessage,
  setCareNote,
} = challengeSlice.actions;

export default challengeSlice.reducer;
