import type { HeartFields, RecordedFactors } from "@/lib/heartRiskValidation";

export type RiskBand = "Lower" | "Moderate" | "Elevated" | "High";

export type ModelPrediction = {
  score: number;
  band: RiskBand;
  disclaimer: string;
  summary: string;
  id: string;
  lanIp: string | null;
};

const disclaimer =
  "This number is the trained model's chance on a 0 to 1 scale. The model learned from synthetic rows, not from patient records. It is not a diagnosis or medical advice.";

export function bandForScore(score: number): RiskBand {
  if (score < 0.2) return "Lower";
  if (score < 0.4) return "Moderate";
  if (score < 0.65) return "Elevated";
  return "High";
}

function payload(fields: HeartFields) {
  const measured = fields.bmiSource === "calculated" && fields.bmiValue.trim() !== "";
  return {
    sex: fields.sex,
    age: Number(fields.age),
    bmiCategory: fields.bmiCategory,
    ...(measured ? { bmi: Number(fields.bmiValue) } : {}),
    familyHistory: fields.familyHistory,
    alcohol: fields.alcohol,
    smoking: fields.smoking,
    drugUse: fields.drugUse,
    systolic: Number(fields.systolic),
    diastolic: Number(fields.diastolic),
    sugar: Number(fields.sugar),
  };
}

export async function requestRiskSignal(fields: HeartFields, recorded: RecordedFactors): Promise<ModelPrediction> {
  let response: Response;
  try {
    response = await fetch("/api/heart-score", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload(fields)),
    });
  } catch {
    throw new Error("The scoring service did not respond. Start the backend and try again.");
  }

  if (!response.ok) {
    throw new Error("The model could not score these details. Check the inputs and try again.");
  }

  const body = (await response.json()) as { score?: unknown; id?: unknown; lanIp?: unknown };
  if (typeof body.score !== "number" || body.score < 0 || body.score > 1) {
    throw new Error("The scoring service returned a result this page could not use.");
  }
  if (typeof body.id !== "string" || !/^[A-Za-z0-9_-]{16,64}$/.test(body.id)) {
    throw new Error("The scoring service returned a result this page could not use.");
  }

  const score = Math.round(body.score * 10000) / 10000;
  const lanIp = typeof body.lanIp === "string" && /^(?:\d{1,3}\.){3}\d{1,3}$/.test(body.lanIp) ? body.lanIp : null;
  return {
    score,
    band: bandForScore(score),
    disclaimer,
    summary: `${recorded.bmi}. Family history: ${recorded.familyHistory}. Smoking: ${recorded.smoking}.`,
    id: body.id,
    lanIp,
  };
}
