import type { HeartFields } from "@/lib/heartRiskValidation";
import type { RiskBand } from "@/lib/riskPrediction";

export type PreventionPath = "prevent" | "living";

export type PreventionAction = {
  id: string;
  title: string;
  text: string;
  detail: string;
};

export const PREVENT_ACTIONS: PreventionAction[] = [
  {
    id: "numbers",
    title: "Know your numbers",
    text: "Check blood pressure, blood sugar, and cholesterol.",
    detail: "High blood pressure often has no symptoms. Ask at a checkup whether a sugar or cholesterol test is due, and write the results down.",
  },
  {
    id: "move",
    title: "Move regularly",
    text: "Aim for at least 150 minutes of moderate activity per week.",
    detail: "Brisk walking counts. The World Health Organization also suggests muscle-strengthening on 2 days. Start with what you can finish.",
  },
  {
    id: "food",
    title: "Eat heart-smart",
    text: "Choose more fruits, vegetables, whole grains, lean proteins, and healthy fats.",
    detail: "The World Health Organization advises less than 5 grams of salt a day, about one teaspoon. Fewer sugary drinks and less processed meat help too.",
  },
  {
    id: "tobacco",
    title: "Avoid tobacco",
    text: "Quit or stay tobacco-free, including cigarettes, vaping, and other nicotine products.",
    detail: "Stopping is one of the strongest steps for the heart. A clinician or a quit line can help. Secondhand smoke counts too.",
  },
  {
    id: "sleep",
    title: "Sleep & manage stress",
    text: "Get 7–9 hours of quality sleep and use healthy stress management habits.",
    detail: "A steady bedtime helps more than one long night. Loud snoring with daytime sleepiness is worth mentioning at a checkup.",
  },
  {
    id: "checkups",
    title: "Schedule checkups",
    text: "Have regular visits with your healthcare provider to monitor risk factors.",
    detail: "Bring family history if a parent or sibling had early heart disease. That conversation can change when screening starts.",
  },
];

export const LIVING_ACTIONS: PreventionAction[] = [
  {
    id: "medications",
    title: "Take prescribed medications",
    text: "Use as directed and discuss any concerns.",
    detail: "Do not stop a heart medicine on your own. If a dose is hard to live with, call the prescriber before you change it.",
  },
  {
    id: "followups",
    title: "Attend follow-ups",
    text: "Keep regular appointments and recommended tests.",
    detail: "Bring blood pressure, a medicine list, and a short note of symptoms since the last visit.",
  },
  {
    id: "warnings",
    title: "Know warning signs",
    text: "Learn symptoms that need immediate care.",
    detail: "Chest pressure, pain in the arm, neck, jaw, or back, sudden shortness of breath, cold sweat, nausea, or fainting: call emergency services. Do not drive yourself.",
  },
  {
    id: "rehab",
    title: "Ask about cardiac rehab",
    text: "A supervised program to build strength and confidence.",
    detail: "After many heart attacks, stents, or heart surgery, cardiac rehab covers movement, food, and recovery. Ask if nobody has offered it.",
  },
];

/** Steps that follow a calculated signal. A high score is not a diagnosis of heart disease. */
export function matchedActions(fields: HeartFields, band: RiskBand) {
  const age = Number(fields.age);
  const systolic = Number(fields.systolic);
  const diastolic = Number(fields.diastolic);
  const sugar = Number(fields.sugar);
  const prevent = new Set<string>();

  if (systolic >= 130 || diastolic >= 80 || sugar >= 100) prevent.add("numbers");
  if (fields.bmiCategory === "overweight" || fields.bmiCategory === "obesity") {
    prevent.add("move");
    prevent.add("food");
  }
  if (fields.alcohol === "frequent") prevent.add("food");
  if (fields.smoking === "current" || fields.smoking === "former") prevent.add("tobacco");
  if (fields.familyHistory === "yes" || age >= 50) prevent.add("checkups");

  if (band === "Elevated" || band === "High") {
    const living =
      band === "High"
        ? ["medications", "followups", "warnings", "rehab"]
        : ["medications", "followups", "warnings"];
    return { prevent: [] as string[], living };
  }

  if (band === "Moderate") {
    prevent.add("numbers");
    prevent.add("move");
    prevent.add("checkups");
  }
  if (band === "Lower" && prevent.size === 0) {
    prevent.add("move");
    prevent.add("checkups");
  }

  return { prevent: [...prevent], living: [] as string[] };
}
