import type { Alcohol, DrugUse, ReadingInput, Sex } from "@/lib/assess";
import { BMI_OPTIONS, type BmiCategory, categoryName } from "@/lib/bmi";

export type HeartFieldKey =
  | "sex"
  | "age"
  | "alcohol"
  | "drugUse"
  | "systolic"
  | "diastolic"
  | "sugar"
  | "bmiCategory"
  | "bmiValue"
  | "bmiSource"
  | "heightUnit"
  | "weightUnit"
  | "heightCm"
  | "heightFeet"
  | "heightInches"
  | "weightKg"
  | "weightLb"
  | "familyHistory"
  | "prematureFamilyHistory"
  | "smoking"
  | "cigarettesPerDay"
  | "yearsSmoked"
  | "yearsSinceQuitting";

export type HeartFields = Record<HeartFieldKey, string>;

export type FieldErrors = Partial<Record<HeartFieldKey, string>>;

export type RecordedFactors = {
  bmi: string;
  familyHistory: string;
  smoking: string;
};

/** Features the current demo weighting actually reads. */
export const SCORED_FEATURES = ["sex", "age", "blood pressure", "blood sugar", "alcohol use", "drug use"] as const;

/** Collected on the profile and intentionally kept out of the demo weighting. */
export const UNSCORED_FEATURES = ["BMI", "family history", "smoking"] as const;

const BMI_VALUES = BMI_OPTIONS.map((option) => option.value);

function integer(raw: string) {
  const value = raw.trim();
  if (!/^\d{1,3}$/.test(value)) return null;
  return Number(value);
}

function optionalInteger(raw: string, min: number, max: number) {
  if (!raw.trim()) return { ok: true as const };
  const value = integer(raw);
  if (value === null || value < min || value > max) return { ok: false as const };
  return { ok: true as const };
}

export function profileFilledCount(fields: HeartFields) {
  let count = 0;
  if (fields.sex === "female" || fields.sex === "male") count += 1;

  const age = integer(fields.age);
  if (age !== null && age >= 18 && age <= 100) count += 1;

  if (BMI_VALUES.includes(fields.bmiCategory as BmiCategory)) count += 1;
  if (fields.familyHistory === "yes" || fields.familyHistory === "no" || fields.familyHistory === "unknown") count += 1;
  if (fields.alcohol === "none" || fields.alcohol === "occasional" || fields.alcohol === "frequent") count += 1;
  if (fields.smoking === "never" || fields.smoking === "former" || fields.smoking === "current") count += 1;
  if (fields.drugUse === "none" || fields.drugUse === "past" || fields.drugUse === "current") count += 1;
  return count;
}

export const PROFILE_FIELD_TOTAL = 7;

export function profileComplete(fields: HeartFields) {
  return profileFilledCount(fields) === PROFILE_FIELD_TOTAL;
}

export function vitalsComplete(fields: HeartFields) {
  return pressureFilled(fields) && sugarFilled(fields);
}

function pressureFilled(fields: HeartFields) {
  const systolic = integer(fields.systolic);
  const diastolic = integer(fields.diastolic);
  if (systolic === null || systolic < 70 || systolic > 250) return false;
  if (diastolic === null || diastolic < 40 || diastolic > 150 || diastolic >= systolic) return false;
  return true;
}

function sugarFilled(fields: HeartFields) {
  const sugar = integer(fields.sugar);
  return sugar !== null && sugar >= 40 && sugar <= 400;
}

export const INTAKE_FIELD_TOTAL = PROFILE_FIELD_TOTAL + 2;

export function intakeFilledCount(fields: HeartFields) {
  return profileFilledCount(fields) + (pressureFilled(fields) ? 1 : 0) + (sugarFilled(fields) ? 1 : 0);
}

function recordedFactors(fields: HeartFields): RecordedFactors {
  const category = fields.bmiCategory as BmiCategory;
  const name = categoryName(category);
  const bmi = fields.bmiSource === "calculated" && fields.bmiValue
    ? `BMI ${fields.bmiValue} — ${name}, calculated from height and weight`
    : `${name}, chosen manually`;

  const family =
    fields.familyHistory === "yes"
      ? `Yes${fields.prematureFamilyHistory ? `, premature: ${fields.prematureFamilyHistory}` : ""}`
      : fields.familyHistory === "no"
        ? "No"
        : "Not sure";

  let smoking = fields.smoking === "never" ? "Never smoked" : fields.smoking === "former" ? "Former smoker" : "Current smoker";
  if (fields.smoking === "current" && fields.cigarettesPerDay) smoking += `, ${fields.cigarettesPerDay} cigarettes a day`;
  if (fields.smoking === "current" && fields.yearsSmoked) smoking += `, ${fields.yearsSmoked} years`;
  if (fields.smoking === "former" && fields.yearsSinceQuitting) smoking += `, quit ${fields.yearsSinceQuitting} years ago`;

  return { bmi, familyHistory: family, smoking };
}

export function validateHeartFields(
  fields: HeartFields,
): { ok: true; value: ReadingInput; recorded: RecordedFactors } | { ok: false; errors: FieldErrors } {
  const errors: FieldErrors = {};

  if (fields.sex !== "female" && fields.sex !== "male") {
    errors.sex = "Choose the sex recorded for this preview.";
  }

  const age = integer(fields.age);
  if (age === null || age < 18 || age > 100) errors.age = "Enter an age from 18 to 100.";

  if (!BMI_VALUES.includes(fields.bmiCategory as BmiCategory)) {
    errors.bmiCategory = "Choose a BMI category.";
  } else if (age !== null && age < 18) {
    errors.bmiCategory = "Adult BMI categories are for ages 18 and older.";
  }

  if (fields.familyHistory !== "yes" && fields.familyHistory !== "no" && fields.familyHistory !== "unknown") {
    errors.familyHistory = "Choose a family-history answer.";
  }

  if (fields.alcohol !== "none" && fields.alcohol !== "occasional" && fields.alcohol !== "frequent") {
    errors.alcohol = "Choose an alcohol status.";
  }

  if (fields.smoking !== "never" && fields.smoking !== "former" && fields.smoking !== "current") {
    errors.smoking = "Choose a smoking status.";
  }

  if (fields.drugUse !== "none" && fields.drugUse !== "past" && fields.drugUse !== "current") {
    errors.drugUse = "Choose a drug-use status.";
  }

  if (!optionalInteger(fields.cigarettesPerDay, 1, 80).ok) {
    errors.cigarettesPerDay = "Enter 1 to 80 cigarettes a day, or leave this blank.";
  }
  if (!optionalInteger(fields.yearsSmoked, 0, 80).ok) {
    errors.yearsSmoked = "Enter 0 to 80 years, or leave this blank.";
  }
  if (!optionalInteger(fields.yearsSinceQuitting, 0, 80).ok) {
    errors.yearsSinceQuitting = "Enter 0 to 80 years, or leave this blank.";
  }

  const systolic = integer(fields.systolic);
  if (systolic === null || systolic < 70 || systolic > 250) {
    errors.systolic = "Enter a systolic pressure from 70 to 250.";
  }

  const diastolic = integer(fields.diastolic);
  if (diastolic === null || diastolic < 40 || diastolic > 150) {
    errors.diastolic = "Enter a diastolic pressure from 40 to 150.";
  } else if (systolic !== null && diastolic >= systolic) {
    errors.diastolic = "Diastolic pressure has to sit below systolic.";
  }

  const sugar = integer(fields.sugar);
  if (sugar === null || sugar < 40 || sugar > 400) {
    errors.sugar = "Enter a blood sugar from 40 to 400 mg/dL.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  const alcohol: Alcohol = fields.alcohol === "frequent" ? "regular" : (fields.alcohol as Alcohol);
  const drugUse: DrugUse = fields.drugUse === "past" ? "former" : (fields.drugUse as DrugUse);

  return {
    ok: true,
    value: {
      sex: fields.sex as Sex,
      age: age as number,
      systolic: systolic as number,
      diastolic: diastolic as number,
      sugar: sugar as number,
      alcohol,
      drugUse,
    },
    recorded: recordedFactors(fields),
  };
}
