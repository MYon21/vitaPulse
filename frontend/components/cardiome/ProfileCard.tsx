"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Calendar, Check, ChevronDown, Cigarette, Droplets, HeartPulse, Info, Pill, Scale, User, Users, Wine } from "lucide-react";
import { useState } from "react";
import { BMI_OPTIONS, bmiFromMetric, categoryForBmi, categoryName, cmFromFeet, feetFromCm, kgFromPounds, type BmiCategory } from "@/lib/bmi";
import { INTAKE_FIELD_TOTAL, intakeFilledCount } from "@/lib/heartRiskValidation";
import type { HeartFieldKey, HeartFields } from "@/lib/heartRiskValidation";
import type { HeartStatus } from "@/store/heartRiskSlice";
import { ProgressIndicator } from "@/components/cardiome/ProgressIndicator";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectHeartErrors, selectHeartFields, setHeartField, setHeartFields } from "@/store/heartRiskSlice";

const control =
  "mt-1 w-full appearance-none rounded-xl border border-[#F0E4E7] bg-white px-3 py-2.5 text-sm text-[#101014] outline-none transition focus:border-[#FF1724] focus:shadow-[0_0_0_4px_rgba(255,23,36,0.12)]";

function inRange(raw: string, min: number, max: number) {
  const value = raw.trim();
  if (!/^\d{1,3}$/.test(value)) return false;
  const number = Number(value);
  return number >= min && number <= max;
}

function Mark({ on }: { on: boolean }) {
  if (!on) return null;
  return <Check size={14} className="ml-auto text-[#FF1724]" aria-label="Completed" />;
}

function TipButton({ label, open, onToggle }: { label: string; open: boolean; onToggle: () => void }) {
  return (
    <button type="button" className="text-[#667085]" aria-expanded={open} aria-label={label} onClick={onToggle}>
      <Info size={15} />
    </button>
  );
}

export function ProfileCard({
  status,
  onCalculate,
  onReset,
}: {
  status: HeartStatus;
  onCalculate: () => void;
  onReset: () => void;
}) {
  const dispatch = useAppDispatch();
  const fields = useAppSelector(selectHeartFields);
  const errors = useAppSelector(selectHeartErrors);
  const reduce = useReducedMotion();
  const filled = intakeFilledCount(fields);
  const [tip, setTip] = useState<"sex" | "bmi" | "family" | "smoking" | "pressure" | "sugar" | "drug" | null>(null);
  const [measure, setMeasure] = useState(false);

  const set = (key: HeartFieldKey, value: string) => dispatch(setHeartField({ key, value }));

  const applyMeasurement = (patch: Partial<HeartFields>) => {
    const next = { ...fields, ...patch };
    const heightCm = next.heightUnit === "cm" ? Number(next.heightCm) : cmFromFeet(Number(next.heightFeet), Number(next.heightInches) || 0);
    const weightKg = next.weightUnit === "kg" ? Number(next.weightKg) : kgFromPounds(Number(next.weightLb));
    const bmi = heightCm && weightKg ? bmiFromMetric(heightCm, weightKg) : null;
    const category = bmi == null ? null : categoryForBmi(bmi);
    if (bmi != null && category) {
      dispatch(setHeartFields({ ...patch, bmiValue: bmi.toFixed(1), bmiCategory: category, bmiSource: "calculated" }));
      return;
    }
    if (fields.bmiSource === "calculated") {
      dispatch(setHeartFields({ ...patch, bmiValue: "", bmiSource: next.bmiCategory ? "manual" : "" }));
      return;
    }
    dispatch(setHeartFields(patch));
  };

  const switchHeightUnit = (unit: "cm" | "ft") => {
    if (unit === fields.heightUnit) return;
    if (unit === "ft" && fields.heightCm) {
      const parts = feetFromCm(Number(fields.heightCm));
      applyMeasurement({ heightUnit: "ft", heightFeet: String(parts.feet), heightInches: String(parts.inches) });
      return;
    }
    if (unit === "cm" && fields.heightFeet) {
      const cm = cmFromFeet(Number(fields.heightFeet), Number(fields.heightInches) || 0);
      applyMeasurement({ heightUnit: "cm", heightCm: cm ? String(Math.round(cm)) : "" });
      return;
    }
    applyMeasurement({ heightUnit: unit });
  };

  const switchWeightUnit = (unit: "kg" | "lb") => {
    if (unit === fields.weightUnit) return;
    if (unit === "lb" && fields.weightKg) {
      applyMeasurement({ weightUnit: "lb", weightLb: String(Math.round(Number(fields.weightKg) / 0.45359237)) });
      return;
    }
    if (unit === "kg" && fields.weightLb) {
      const kg = kgFromPounds(Number(fields.weightLb));
      applyMeasurement({ weightUnit: "kg", weightKg: kg ? String(Math.round(kg)) : "" });
      return;
    }
    applyMeasurement({ weightUnit: unit });
  };

  const reveal = reduce ? {} : { initial: { opacity: 0, y: -6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 } };

  return (
    <article className="@container rounded-[28px] border border-[#F0E4E7] bg-white p-5 shadow-[0_18px_50px_rgba(255,23,36,0.06)] transition hover:shadow-[0_18px_50px_rgba(255,23,36,0.1)]">
      <p className="text-xs font-semibold text-[#FF1724]">01</p>
      <h3 className="mt-1 text-xl font-semibold tracking-tight">Your details</h3>
      <p className="mt-1 text-sm text-[#667085]">Profile, lifestyle, and checkup numbers in one place.</p>
      <div className="mt-4">
        <ProgressIndicator label="Inputs" filled={filled} total={INTAKE_FIELD_TOTAL} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-4">
        <label className="block min-w-0 text-sm">
          <span className="flex items-center gap-1.5 font-medium">
            <User size={14} className="shrink-0 text-[#FF1724]" aria-hidden />
            <span id="sex-label">Sex</span>
            <TipButton label="About sex recorded for the model" open={tip === "sex"} onToggle={() => setTip((current) => (current === "sex" ? null : "sex"))} />
            <Mark on={fields.sex === "female" || fields.sex === "male"} />
          </span>
          <span className="relative block">
            <select className={`${control} pr-8`} value={fields.sex} aria-labelledby="sex-label" aria-invalid={Boolean(errors.sex)} onChange={(event) => set("sex", event.target.value)}>
              <option value="">Select</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]" />
          </span>
          {tip === "sex" ? (
            <span className="mt-1 block text-xs text-[#667085]">This preview asks for sex, not gender identity. The demo only has female and male inputs.</span>
          ) : null}
          {errors.sex ? <span className="mt-1 block text-xs text-[#D90016]">{errors.sex}</span> : null}
        </label>

        <label className="block min-w-0 text-sm">
          <span className="flex items-center gap-1.5 font-medium">
            <Calendar size={14} className="shrink-0 text-[#FF1724]" aria-hidden /> Age
            <Mark on={Number.isInteger(Number(fields.age)) && Number(fields.age) >= 18 && Number(fields.age) <= 100} />
          </span>
          <input className={control} inputMode="numeric" value={fields.age} placeholder="18–100" aria-invalid={Boolean(errors.age)} onChange={(event) => set("age", event.target.value)} />
          {errors.age ? <span className="mt-1 block text-xs text-[#D90016]">{errors.age}</span> : null}
        </label>

        <div className="block text-sm">
          <div className="flex items-center gap-2 font-medium">
            <Scale size={15} className="text-[#FF1724]" aria-hidden />
            <span id="bmi-label">BMI</span>
            <TipButton label="About BMI" open={tip === "bmi"} onToggle={() => setTip((current) => (current === "bmi" ? null : "bmi"))} />
            <Mark on={BMI_OPTIONS.some((option) => option.value === fields.bmiCategory)} />
          </div>
          <span className="relative block">
            <select
              className={`${control} pr-8`}
              aria-labelledby="bmi-label"
              aria-invalid={Boolean(errors.bmiCategory)}
              value={fields.bmiCategory}
              onChange={(event) => set("bmiCategory", event.target.value)}
            >
              <option value="">Select</option>
              {BMI_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]" />
          </span>
          {tip === "bmi" ? (
            <p className="mt-1 text-xs leading-relaxed text-[#667085]">
              BMI is a screening measure based on height and weight. It does not directly measure body fat or diagnose a medical condition. Adult categories apply from age 18.
            </p>
          ) : null}
          {fields.bmiSource === "calculated" && fields.bmiValue ? (
            <p className="mt-1 text-xs font-medium text-[#101014]">
              BMI: {fields.bmiValue} — {categoryName(fields.bmiCategory as BmiCategory)}
              <span className="mt-0.5 block font-normal text-[#667085]">Calculated from height and weight.</span>
            </p>
          ) : fields.bmiSource === "manual" ? (
            <p className="mt-1 text-xs text-[#667085]">Category chosen manually.</p>
          ) : null}
          {errors.bmiCategory ? <p className="mt-1 text-xs text-[#D90016]">{errors.bmiCategory}</p> : null}
          <button type="button" className="mt-1 text-[11px] font-medium text-[#FF1724]" aria-expanded={measure} onClick={() => setMeasure((open) => !open)}>
            {measure ? "Hide height and weight" : "Height and weight"}
          </button>
        </div>

        <div className="block min-w-0 text-sm">
          <div className="flex items-center gap-1.5 font-medium">
            <Users size={14} className="shrink-0 text-[#FF1724]" aria-hidden />
            <span id="family-label">Family</span>
            <TipButton label="About family history" open={tip === "family"} onToggle={() => setTip((current) => (current === "family" ? null : "family"))} />
            <Mark on={fields.familyHistory === "yes" || fields.familyHistory === "no" || fields.familyHistory === "unknown"} />
          </div>
          <span className="relative block">
            <select className={`${control} pr-8`} aria-labelledby="family-label" aria-invalid={Boolean(errors.familyHistory)} value={fields.familyHistory} onChange={(event) => set("familyHistory", event.target.value)}>
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="unknown">Not sure</option>
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]" />
          </span>
          {errors.familyHistory ? <p className="mt-1 text-xs text-[#D90016]">{errors.familyHistory}</p> : null}
        </div>

        <AnimatePresence initial={false}>
          {measure ? (
            <motion.div key="measure" {...reveal} className="col-span-2 space-y-2 overflow-hidden sm:col-span-4">
                <div className="flex gap-2 text-xs">
                  <button type="button" className={`rounded-full px-3 py-1 ${fields.heightUnit === "cm" ? "bg-[#FF1724] text-white" : "bg-[#FFF0F2]"}`} onClick={() => switchHeightUnit("cm")}>cm</button>
                  <button type="button" className={`rounded-full px-3 py-1 ${fields.heightUnit === "ft" ? "bg-[#FF1724] text-white" : "bg-[#FFF0F2]"}`} onClick={() => switchHeightUnit("ft")}>ft / in</button>
                </div>
                {fields.heightUnit === "cm" ? (
                  <label className="block text-xs text-[#667085]">
                    Height (cm)
                    <input className={control} inputMode="decimal" value={fields.heightCm} placeholder="170" onChange={(event) => applyMeasurement({ heightCm: event.target.value })} />
                  </label>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-xs text-[#667085]">
                      Feet
                      <input className={control} inputMode="numeric" value={fields.heightFeet} placeholder="5" onChange={(event) => applyMeasurement({ heightFeet: event.target.value })} />
                    </label>
                    <label className="text-xs text-[#667085]">
                      Inches
                      <input className={control} inputMode="numeric" value={fields.heightInches} placeholder="7" onChange={(event) => applyMeasurement({ heightInches: event.target.value })} />
                    </label>
                  </div>
                )}
                <div className="flex gap-2 text-xs">
                  <button type="button" className={`rounded-full px-3 py-1 ${fields.weightUnit === "kg" ? "bg-[#FF1724] text-white" : "bg-[#FFF0F2]"}`} onClick={() => switchWeightUnit("kg")}>kg</button>
                  <button type="button" className={`rounded-full px-3 py-1 ${fields.weightUnit === "lb" ? "bg-[#FF1724] text-white" : "bg-[#FFF0F2]"}`} onClick={() => switchWeightUnit("lb")}>lb</button>
                </div>
                {fields.weightUnit === "kg" ? (
                  <label className="block text-xs text-[#667085]">
                    Weight (kg)
                    <input className={control} inputMode="decimal" value={fields.weightKg} placeholder="70" onChange={(event) => applyMeasurement({ weightKg: event.target.value })} />
                  </label>
                ) : (
                  <label className="block text-xs text-[#667085]">
                    Weight (lb)
                    <input className={control} inputMode="decimal" value={fields.weightLb} placeholder="154" onChange={(event) => applyMeasurement({ weightLb: event.target.value })} />
                  </label>
                )}
              </motion.div>
            ) : null}
        </AnimatePresence>
        {tip === "family" ? (
          <p className="col-span-2 text-xs leading-relaxed text-[#667085] sm:col-span-4">
            A parent, sibling, or child with heart disease, such as a heart attack, stroke, or coronary disease. Premature disease is a separate detail.
          </p>
        ) : null}
        <AnimatePresence initial={false}>
          {fields.familyHistory === "yes" ? (
            <motion.div key="premature" {...reveal} className="col-span-2 sm:col-span-4">
              <label className="block max-w-xs text-sm">
                <span className="font-medium">Premature diagnosis?</span>
                <span className="relative block">
                  <select className={`${control} pr-8`} value={fields.prematureFamilyHistory} onChange={(event) => set("prematureFamilyHistory", event.target.value)}>
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    <option value="unknown">Not sure</option>
                  </select>
                  <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]" />
                </span>
              </label>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <label className="block text-sm">
          <span className="flex items-center gap-2 font-medium">
            <Wine size={14} className="shrink-0 text-[#FF1724]" aria-hidden /> Alcohol
            <Mark on={fields.alcohol === "none" || fields.alcohol === "occasional" || fields.alcohol === "frequent"} />
          </span>
          <span className="relative block">
            <select className={`${control} pr-8`} value={fields.alcohol} aria-invalid={Boolean(errors.alcohol)} onChange={(event) => set("alcohol", event.target.value)}>
              <option value="">Select</option>
              <option value="none">None</option>
              <option value="occasional">Occasional</option>
              <option value="frequent">Frequent</option>
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]" />
          </span>
          {errors.alcohol ? <span className="mt-1 block text-xs text-[#D90016]">{errors.alcohol}</span> : null}
        </label>

        <div className="block text-sm">
          <div className="flex items-center gap-2 font-medium">
            <Cigarette size={15} className="text-[#FF1724]" aria-hidden />
            <span id="smoking-label">Smoking</span>
            <TipButton label="About smoking" open={tip === "smoking"} onToggle={() => setTip((current) => (current === "smoking" ? null : "smoking"))} />
            <Mark on={fields.smoking === "never" || fields.smoking === "former" || fields.smoking === "current"} />
          </div>
          <span className="relative block">
            <select className={`${control} pr-8`} aria-labelledby="smoking-label" aria-invalid={Boolean(errors.smoking)} value={fields.smoking} onChange={(event) => set("smoking", event.target.value)}>
              <option value="">Select</option>
              <option value="never">Never smoked</option>
              <option value="former">Former smoker</option>
              <option value="current">Current smoker</option>
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]" />
          </span>
          {errors.smoking ? <p className="mt-1 text-xs text-[#D90016]">{errors.smoking}</p> : null}
        </div>

        <label className="block text-sm">
          <span className="flex items-center gap-2 font-medium">
            <Pill size={14} className="shrink-0 text-[#FF1724]" aria-hidden /> Drugs
            <TipButton label="About drug use" open={tip === "drug"} onToggle={() => setTip((current) => (current === "drug" ? null : "drug"))} />
            <Mark on={fields.drugUse === "none" || fields.drugUse === "past" || fields.drugUse === "current"} />
          </span>
          <span className="relative block">
            <select className={`${control} pr-8`} value={fields.drugUse} aria-invalid={Boolean(errors.drugUse)} onChange={(event) => set("drugUse", event.target.value)}>
              <option value="">Select</option>
              <option value="none">None</option>
              <option value="past">Past use</option>
              <option value="current">Current use</option>
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#667085]" />
          </span>
          {errors.drugUse ? <span className="mt-1 block text-xs text-[#D90016]">{errors.drugUse}</span> : null}
        </label>

        {tip === "drug" ? (
          <p className="col-span-2 text-xs text-[#667085] sm:col-span-4">Status only. This preview does not ask which substance.</p>
        ) : null}
        {tip === "smoking" ? (
          <p className="col-span-2 text-xs text-[#667085] sm:col-span-4">
            Smoking status is sent with the other details when you calculate.
          </p>
        ) : null}
        <AnimatePresence initial={false}>
          {fields.smoking === "current" ? (
            <motion.div key="current-smoke" {...reveal} className="col-span-2 grid grid-cols-2 gap-2 sm:col-span-4 sm:grid-cols-4">
              <label className="text-xs text-[#667085]">
                Cigarettes per day
                <input className={control} inputMode="numeric" value={fields.cigarettesPerDay} placeholder="Optional" aria-invalid={Boolean(errors.cigarettesPerDay)} onChange={(event) => set("cigarettesPerDay", event.target.value)} />
                {errors.cigarettesPerDay ? <span className="mt-1 block text-[#D90016]">{errors.cigarettesPerDay}</span> : null}
              </label>
              <label className="text-xs text-[#667085]">
                Years smoked
                <input className={control} inputMode="numeric" value={fields.yearsSmoked} placeholder="Optional" aria-invalid={Boolean(errors.yearsSmoked)} onChange={(event) => set("yearsSmoked", event.target.value)} />
                {errors.yearsSmoked ? <span className="mt-1 block text-[#D90016]">{errors.yearsSmoked}</span> : null}
              </label>
            </motion.div>
          ) : null}
          {fields.smoking === "former" ? (
            <motion.div key="former-smoke" {...reveal} className="col-span-2 sm:col-span-4">
              <label className="block max-w-xs text-xs text-[#667085]">
                Years since quitting
                <input className={control} inputMode="numeric" value={fields.yearsSinceQuitting} placeholder="Optional" aria-invalid={Boolean(errors.yearsSinceQuitting)} onChange={(event) => set("yearsSinceQuitting", event.target.value)} />
                {errors.yearsSinceQuitting ? <span className="mt-1 block text-[#D90016]">{errors.yearsSinceQuitting}</span> : null}
              </label>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <label className="block min-w-0 text-sm">
          <span className="flex items-center gap-1.5 font-medium">
            <Droplets size={14} className="shrink-0 text-[#FF1724]" aria-hidden /> Glucose
            <TipButton label="About blood sugar" open={tip === "sugar"} onToggle={() => setTip((current) => (current === "sugar" ? null : "sugar"))} />
            <Mark on={inRange(fields.sugar, 40, 400)} />
          </span>
          <input className={control} inputMode="numeric" value={fields.sugar} placeholder="mg/dL" aria-invalid={Boolean(errors.sugar)} onChange={(event) => set("sugar", event.target.value)} />
          {errors.sugar ? <span className="mt-1 block text-xs text-[#D90016]">{errors.sugar}</span> : null}
        </label>
        <label className="block min-w-0 text-sm">
          <span className="flex items-center gap-1.5 font-medium">
            <HeartPulse size={14} className="shrink-0 text-[#FF1724]" aria-hidden /> Systolic
            <TipButton label="About blood pressure" open={tip === "pressure"} onToggle={() => setTip((current) => (current === "pressure" ? null : "pressure"))} />
            <Mark on={inRange(fields.systolic, 70, 250)} />
          </span>
          <input className={control} inputMode="numeric" value={fields.systolic} placeholder="128" aria-invalid={Boolean(errors.systolic)} onChange={(event) => set("systolic", event.target.value)} />
          {errors.systolic ? <span className="mt-1 block text-xs text-[#D90016]">{errors.systolic}</span> : null}
        </label>
        <label className="block min-w-0 text-sm">
          <span className="flex items-center gap-1.5 font-medium">
            Diastolic
            <Mark on={inRange(fields.diastolic, 40, 150) && Number(fields.diastolic) < Number(fields.systolic)} />
          </span>
          <input className={control} inputMode="numeric" value={fields.diastolic} placeholder="82" aria-invalid={Boolean(errors.diastolic)} onChange={(event) => set("diastolic", event.target.value)} />
          {errors.diastolic ? <span className="mt-1 block text-xs text-[#D90016]">{errors.diastolic}</span> : null}
        </label>
        {tip === "pressure" ? (
          <p className="col-span-2 text-xs text-[#667085] sm:col-span-4">Systolic is the first number and diastolic is the second, in mmHg.</p>
        ) : null}
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          className="rounded-full bg-[#FF1724] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(255,23,36,0.25)] transition hover:bg-[#D90016] disabled:opacity-60"
          disabled={status === "calculating"}
          onClick={onCalculate}
        >
          {status === "calculating" ? "Calculating" : "Calculate my risk signal"}
        </button>
        <button type="button" className="rounded-full border border-[#F0E4E7] bg-white px-5 py-3 text-sm font-semibold" onClick={onReset}>
          Reset inputs
        </button>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-[#667085]">
        Nothing is saved in this browser. Choosing calculate sends these details to the scoring service. The QR code opens a page with the score and these details.
      </p>
    </article>
  );
}
