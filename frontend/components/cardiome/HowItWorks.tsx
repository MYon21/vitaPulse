"use client";

import { motion, useReducedMotion } from "motion/react";
import { ProfileCard } from "@/components/cardiome/ProfileCard";
import { RiskSignalCard } from "@/components/cardiome/RiskSignalCard";
import { validateHeartFields } from "@/lib/heartRiskValidation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { calculateHeartRisk, reportHeartErrors, resetHeartRisk } from "@/store/heartRiskSlice";

export function HowItWorks() {
  const dispatch = useAppDispatch();
  const fields = useAppSelector((state) => state.heartRisk.fields);
  const status = useAppSelector((state) => state.heartRisk.status);
  const reduce = useReducedMotion();

  const onCalculate = () => {
    const parsed = validateHeartFields(fields);
    if (!parsed.ok) {
      dispatch(reportHeartErrors(parsed.errors));
      return;
    }
    if (status === "calculating") return;
    dispatch(calculateHeartRisk(fields));
  };

  return (
    <section id="how" className="bg-[linear-gradient(180deg,#fff,#FFF7F8_40%,#fff)] px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <motion.div
          className="max-w-2xl"
          initial={reduce ? undefined : { opacity: 0, y: 12 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
        >
          <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.16em] text-[#FF1724]">
            <span className="h-[3px] w-8 rounded-full bg-[#FF1724]" />
            HOW IT WORKS
          </p>
          <h2 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            From a few inputs to a clear heart <span className="text-[#FF1724]">risk signal.</span>
          </h2>
          <p className="mt-4 text-[#667085]">
            Calculate sends these details to the trained model and shows its chance of heart disease from 0 to 1. The model learned from synthetic data. It is not a diagnosis.
          </p>
        </motion.div>
        <div className="mt-8 grid items-start gap-5 md:grid-cols-[minmax(0,1.85fr)_minmax(240px,0.75fr)]">
          <ProfileCard status={status} onCalculate={onCalculate} onReset={() => dispatch(resetHeartRisk())} />
          <RiskSignalCard />
        </div>
      </div>
    </section>
  );
}
