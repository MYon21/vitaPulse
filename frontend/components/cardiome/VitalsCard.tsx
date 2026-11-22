"use client";

import { useState } from "react";
import { Droplets, HeartPulse, Info } from "lucide-react";
import { ProgressIndicator } from "@/components/cardiome/ProgressIndicator";
import { vitalsComplete } from "@/lib/heartRiskValidation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setHeartField } from "@/store/heartRiskSlice";

const control =
  "w-full rounded-xl border border-[#F0E4E7] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#FF1724] focus:shadow-[0_0_0_4px_rgba(255,23,36,0.12)]";

export function VitalsCard() {
  const dispatch = useAppDispatch();
  const fields = useAppSelector((state) => state.heartRisk.fields);
  const errors = useAppSelector((state) => state.heartRisk.fieldErrors);
  const done = vitalsComplete(fields);
  const [tip, setTip] = useState<"pressure" | "sugar" | null>(null);

  return (
    <article className="rounded-[28px] border border-[#F0E4E7] bg-white p-5 shadow-[0_18px_50px_rgba(255,23,36,0.06)]">
      <p className="text-xs font-semibold text-[#FF1724]">02</p>
      <h3 className="mt-1 text-xl font-semibold tracking-tight">Add vitals</h3>
      <p className="mt-1 text-sm text-[#667085]">Include two common checkup measures.</p>
      <div className="mt-4">
        <ProgressIndicator done={done} label="Vitals entered" />
      </div>
      <div className="mt-4 space-y-4">
        <div className="rounded-2xl border border-[#F0E4E7] p-3">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-medium">
              <HeartPulse size={15} className="text-[#FF1724]" aria-hidden /> Blood pressure
            </p>
            <button
              type="button"
              className="text-[#667085]"
              aria-expanded={tip === "pressure"}
              aria-label="About blood pressure"
              onClick={() => setTip((current) => (current === "pressure" ? null : "pressure"))}
            >
              <Info size={15} />
            </button>
          </div>
          {tip === "pressure" ? (
            <p className="mt-2 text-xs leading-relaxed text-[#667085]">
              Systolic is the first number and diastolic is the second, in mmHg. The completion bar only means both numbers are filled in a valid range.
            </p>
          ) : null}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="text-xs text-[#667085]">
              Systolic
              <input className={`${control} mt-1`} inputMode="numeric" value={fields.systolic} placeholder="128" onChange={(event) => dispatch(setHeartField({ key: "systolic", value: event.target.value }))} />
            </label>
            <label className="text-xs text-[#667085]">
              Diastolic
              <input className={`${control} mt-1`} inputMode="numeric" value={fields.diastolic} placeholder="82" onChange={(event) => dispatch(setHeartField({ key: "diastolic", value: event.target.value }))} />
            </label>
          </div>
          <p className="mt-2 text-xs text-[#667085]">mmHg</p>
          {errors.systolic ? <p className="mt-1 text-xs text-[#D90016]">{errors.systolic}</p> : null}
          {errors.diastolic ? <p className="mt-1 text-xs text-[#D90016]">{errors.diastolic}</p> : null}
        </div>
        <div className="rounded-2xl border border-[#F0E4E7] p-3">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Droplets size={15} className="text-[#FF1724]" aria-hidden /> Blood sugar
            </p>
            <button
              type="button"
              className="text-[#667085]"
              aria-expanded={tip === "sugar"}
              aria-label="About blood sugar"
              onClick={() => setTip((current) => (current === "sugar" ? null : "sugar"))}
            >
              <Info size={15} />
            </button>
          </div>
          {tip === "sugar" ? (
            <p className="mt-2 text-xs leading-relaxed text-[#667085]">
              Enter glucose in mg/dL. This preview does not ask whether the sample was fasting.
            </p>
          ) : null}
          <label className="mt-3 block text-xs text-[#667085]">
            Glucose
            <input className={`${control} mt-1`} inputMode="numeric" value={fields.sugar} placeholder="104" onChange={(event) => dispatch(setHeartField({ key: "sugar", value: event.target.value }))} />
          </label>
          <p className="mt-2 text-xs text-[#667085]">mg/dL</p>
          {errors.sugar ? <p className="mt-1 text-xs text-[#D90016]">{errors.sugar}</p> : null}
        </div>
      </div>
    </article>
  );
}
