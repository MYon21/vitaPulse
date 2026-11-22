import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { bandForScore, type RiskBand } from "@/lib/riskPrediction";
import { categoryName, type BmiCategory } from "@/lib/bmi";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Heart score — VitaPulse",
  description: "A VitaPulse heart score and the details used to calculate it. Not a diagnosis.",
};

type SharedInputs = {
  sex: "female" | "male";
  age: number;
  bmiCategory: BmiCategory;
  bmi?: number;
  familyHistory: "yes" | "no" | "unknown";
  alcohol: "none" | "occasional" | "frequent";
  smoking: "never" | "former" | "current";
  drugUse: "none" | "past" | "current";
  systolic: number;
  diastolic: number;
  sugar: number;
};

type SharedResult = {
  id: string;
  score: number;
  source?: string;
  inputs: SharedInputs;
};

const LABELS = {
  sex: { female: "Female", male: "Male" },
  familyHistory: { yes: "Yes", no: "No", unknown: "Not sure" },
  alcohol: { none: "None", occasional: "Occasional", frequent: "Frequent" },
  smoking: { never: "Never smoked", former: "Former smoker", current: "Current smoker" },
  drugUse: { none: "None", past: "Past use", current: "Current use" },
} as const;

async function loadResult(id: string): Promise<SharedResult | null> {
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(id)) return null;
  const base = process.env.BACKEND_URL;
  if (!base) return null;
  try {
    const response = await fetch(new URL(`results/${id}`, base), { cache: "no-store" });
    if (!response.ok) return null;
    const body = (await response.json()) as SharedResult;
    if (typeof body.score !== "number" || body.score < 0 || body.score > 1 || !body.inputs) return null;
    return body;
  } catch {
    return null;
  }
}

function rows(inputs: SharedInputs) {
  const bmi = typeof inputs.bmi === "number" ? `BMI ${inputs.bmi.toFixed(1)} — ${categoryName(inputs.bmiCategory)}` : categoryName(inputs.bmiCategory);
  return [
    ["Sex", LABELS.sex[inputs.sex]],
    ["Age", String(inputs.age)],
    ["BMI", bmi],
    ["Family history", LABELS.familyHistory[inputs.familyHistory]],
    ["Alcohol", LABELS.alcohol[inputs.alcohol]],
    ["Smoking", LABELS.smoking[inputs.smoking]],
    ["Drug use", LABELS.drugUse[inputs.drugUse]],
    ["Blood pressure", `${inputs.systolic}/${inputs.diastolic} mmHg`],
    ["Glucose", `${inputs.sugar} mg/dL`],
  ];
}

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await loadResult(id);
  const band: RiskBand | null = result ? bandForScore(result.score) : null;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff,#FFF7F8_42%,#fff)] px-5 py-10 text-[#101014]">
      <div className="mx-auto max-w-lg">
        <Logo href="/" />
        {result && band ? (
          <article className="mt-8 rounded-[28px] border border-[#F0E4E7] bg-white p-6 shadow-[0_18px_50px_rgba(255,23,36,0.06)]">
            <p className="text-xs font-semibold tracking-[0.16em] text-[#FF1724]">HEART SCORE</p>
            <p className="mt-4 text-6xl font-semibold leading-none tracking-tight">{result.score.toFixed(2)}</p>
            <p className="mt-2 text-xl font-semibold">{band}</p>
            <p className="mt-1 text-sm text-[#FF1724]">0 lower chance · 1 higher chance</p>
            <dl className="mt-6 divide-y divide-[#F0E4E7] border-y border-[#F0E4E7]">
              {rows(result.inputs).map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
                  <dt className="text-[#667085]">{label}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-sm leading-relaxed text-[#667085]">
              This number is the trained model’s chance on a 0 to 1 scale. The model learned from synthetic rows, not from patient records. It is not a diagnosis or medical advice.
            </p>
          </article>
        ) : (
          <article className="mt-8 rounded-[28px] border border-[#F0E4E7] bg-white p-6">
            <h1 className="text-2xl font-semibold tracking-tight">This result is not available</h1>
            <p className="mt-2 text-sm leading-relaxed text-[#667085]">
              The link may be incomplete, or the scoring service does not have this reading.
            </p>
          </article>
        )}
      </div>
    </main>
  );
}
