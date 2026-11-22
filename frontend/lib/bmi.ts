export type BmiCategory = "underweight" | "healthy" | "overweight" | "obesity";

export const BMI_OPTIONS: { value: BmiCategory; label: string }[] = [
  { value: "underweight", label: "Underweight (BMI < 18.5)" },
  { value: "healthy", label: "Healthy weight (BMI 18.5–24.9)" },
  { value: "overweight", label: "Overweight (BMI 25.0–29.9)" },
  { value: "obesity", label: "Obese (BMI ≥ 30)" },
];

const CATEGORY_NAME: Record<BmiCategory, string> = {
  underweight: "Underweight",
  healthy: "Healthy weight",
  overweight: "Overweight",
  obesity: "Obesity",
};

export function categoryName(category: BmiCategory) {
  return CATEGORY_NAME[category];
}

/** Adult BMI categories. Do not use these bands for anyone under 18. */
export function categoryForBmi(bmi: number): BmiCategory | null {
  if (!Number.isFinite(bmi) || bmi < 10 || bmi > 80) return null;
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "healthy";
  if (bmi < 30) return "overweight";
  return "obesity";
}

export function roundBmi(bmi: number) {
  return Math.round(bmi * 10) / 10;
}

export function bmiFromMetric(heightCm: number, weightKg: number) {
  if (heightCm < 90 || heightCm > 250 || weightKg < 30 || weightKg > 300) return null;
  const meters = heightCm / 100;
  return roundBmi(weightKg / (meters * meters));
}

export function cmFromFeet(feet: number, inches: number) {
  if (feet < 3 || feet > 8 || inches < 0 || inches > 11) return null;
  return (feet * 12 + inches) * 2.54;
}

export function kgFromPounds(pounds: number) {
  if (pounds < 66 || pounds > 660) return null;
  return pounds * 0.45359237;
}

export function feetFromCm(cm: number) {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches - feet * 12);
  let nextFeet = feet;
  if (inches === 12) {
    nextFeet += 1;
    inches = 0;
  }
  return { feet: nextFeet, inches };
}
