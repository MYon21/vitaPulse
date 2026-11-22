import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { categoryForBmi } from "@/lib/bmi";
import type { FieldErrors, HeartFieldKey, HeartFields } from "@/lib/heartRiskValidation";
import { validateHeartFields } from "@/lib/heartRiskValidation";
import { requestRiskSignal, type ModelPrediction } from "@/lib/riskPrediction";

export type HeartStatus = "idle" | "calculating" | "ready" | "error";

type HeartRiskState = {
  fields: HeartFields;
  status: HeartStatus;
  fieldErrors: FieldErrors;
  prediction: ModelPrediction | null;
  explainOpen: boolean;
  errorMessage: string | null;
};

const emptyFields: HeartFields = {
  sex: "",
  age: "",
  alcohol: "",
  drugUse: "",
  systolic: "",
  diastolic: "",
  sugar: "",
  bmiCategory: "",
  bmiValue: "",
  bmiSource: "",
  heightUnit: "cm",
  weightUnit: "kg",
  heightCm: "",
  heightFeet: "",
  heightInches: "",
  weightKg: "",
  weightLb: "",
  familyHistory: "",
  prematureFamilyHistory: "",
  smoking: "",
  cigarettesPerDay: "",
  yearsSmoked: "",
  yearsSinceQuitting: "",
};

const initialState: HeartRiskState = {
  fields: emptyFields,
  status: "idle",
  fieldErrors: {},
  prediction: null,
  explainOpen: false,
  errorMessage: null,
};

export const calculateHeartRisk = createAsyncThunk("heartRisk/calculate", async (fields: HeartFields) => {
  const parsed = validateHeartFields(fields);
  if (!parsed.ok) return { ok: false as const, errors: parsed.errors };
  const prediction = await requestRiskSignal(fields, parsed.recorded);
  return { ok: true as const, prediction };
});

const heartRiskSlice = createSlice({
  name: "heartRisk",
  initialState,
  reducers: {
    setHeartField(state, action: PayloadAction<{ key: HeartFieldKey; value: string }>) {
      const { key, value } = action.payload;
      state.fields[key] = value;
      state.status = "idle";
      state.prediction = null;
      delete state.fieldErrors[key];
      if (key === "familyHistory" && value !== "yes") state.fields.prematureFamilyHistory = "";
      if (key === "smoking" && value !== "current") {
        state.fields.cigarettesPerDay = "";
        state.fields.yearsSmoked = "";
      }
      if (key === "smoking" && value !== "former") state.fields.yearsSinceQuitting = "";
      if (key === "bmiCategory") {
        const fromValue = categoryForBmi(Number(state.fields.bmiValue));
        if (state.fields.bmiValue && fromValue === value) {
          state.fields.bmiSource = "calculated";
        } else {
          state.fields.bmiSource = value ? "manual" : "";
          state.fields.bmiValue = "";
        }
      }
    },
    setHeartFields(state, action: PayloadAction<Partial<HeartFields>>) {
      Object.assign(state.fields, action.payload);
      state.status = "idle";
      state.prediction = null;
      for (const key of Object.keys(action.payload) as HeartFieldKey[]) delete state.fieldErrors[key];
    },
    setExplainOpen(state, action: PayloadAction<boolean>) {
      state.explainOpen = action.payload;
    },
    reportHeartErrors(state, action: PayloadAction<FieldErrors>) {
      state.status = "error";
      state.fieldErrors = action.payload;
      state.prediction = null;
      state.errorMessage = null;
    },
    resetHeartRisk() {
      return initialState;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(calculateHeartRisk.pending, (state) => {
        state.status = "calculating";
        state.fieldErrors = {};
        state.prediction = null;
        state.errorMessage = null;
      })
      .addCase(calculateHeartRisk.fulfilled, (state, action) => {
        if (!action.payload.ok) {
          state.status = "error";
          state.fieldErrors = action.payload.errors;
          state.errorMessage = null;
          return;
        }
        state.status = "ready";
        state.prediction = action.payload.prediction;
        state.errorMessage = null;
        state.explainOpen = false;
      })
      .addCase(calculateHeartRisk.rejected, (state, action) => {
        state.status = "error";
        state.prediction = null;
        state.errorMessage = action.error.message ?? "The score could not be calculated.";
      });
  },
});

export const { setHeartField, setHeartFields, setExplainOpen, resetHeartRisk, reportHeartErrors } = heartRiskSlice.actions;

type HeartState = { heartRisk: HeartRiskState };
export const selectHeartFields = (state: HeartState) => state.heartRisk.fields;
export const selectHeartErrors = (state: HeartState) => state.heartRisk.fieldErrors;
export default heartRiskSlice.reducer;
