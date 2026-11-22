export type Sex = "female" | "male";
export type Alcohol = "none" | "occasional" | "regular";
export type DrugUse = "none" | "former" | "current";

export type ReadingInput = {
  sex: Sex;
  age: number;
  systolic: number;
  diastolic: number;
  sugar: number;
  alcohol: Alcohol;
  drugUse: DrugUse;
};

export type ReadingResult = {
  percent: number;
  /** 1 is the best end of this demo scale. 10 is the worst. */
  level: number;
  band: "Lower" | "Moderate" | "Elevated" | "High";
  notes: string[];
};

/**
 * Preview weighting for the product demo. The directions follow public risk
 * patterns. This is not a clinical equation and must not be treated as one.
 */
export function assess(input: ReadingInput): ReadingResult {
  let score = 4;
  const notes: string[] = [];

  if (input.age >= 70) {
    score += 28;
    notes.push("Age sits in the oldest band of this preview.");
  } else if (input.age >= 60) {
    score += 20;
    notes.push("Age adds weight from 60 upward.");
  } else if (input.age >= 50) {
    score += 12;
    notes.push("Age adds weight from 50 upward.");
  } else if (input.age >= 40) {
    score += 6;
  } else {
    score += 2;
  }

  if (input.sex === "male") {
    score += 6;
    notes.push("Male sex adds a small amount in this preview.");
  }

  if (input.systolic >= 160 || input.diastolic >= 100) {
    score += 24;
    notes.push("Blood pressure is in a high range.");
  } else if (input.systolic >= 140 || input.diastolic >= 90) {
    score += 16;
    notes.push("Blood pressure is above a usual checkup range.");
  } else if (input.systolic >= 130 || input.diastolic >= 80) {
    score += 8;
    notes.push("Blood pressure is on the high side of normal.");
  }

  if (input.sugar >= 180) {
    score += 18;
    notes.push("Blood sugar is well above a typical range.");
  } else if (input.sugar >= 126) {
    score += 12;
    notes.push("Blood sugar is elevated.");
  } else if (input.sugar >= 100) {
    score += 5;
    notes.push("Blood sugar is above 100 mg/dL.");
  }

  if (input.alcohol === "regular") {
    score += 8;
    notes.push("Regular alcohol use adds to the score.");
  } else if (input.alcohol === "occasional") {
    score += 2;
  }

  if (input.drugUse === "current") {
    score += 12;
    notes.push("Current drug use adds to the score.");
  } else if (input.drugUse === "former") {
    score += 4;
    notes.push("Former drug use adds a smaller amount.");
  }

  const percent = Math.max(3, Math.min(92, Math.round(score)));
  const level = Math.min(10, Math.max(1, Math.ceil(percent / 10)));
  const band =
    percent < 20 ? "Lower" : percent < 40 ? "Moderate" : percent < 65 ? "Elevated" : "High";

  return {
    percent,
    level,
    band,
    notes,
  };
}
