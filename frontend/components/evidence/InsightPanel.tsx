"use client";

import { motion, useReducedMotion } from "motion/react";
import { ChartColumn } from "lucide-react";

export function InsightPanel() {
  const reduce = useReducedMotion();

  return (
    <motion.aside
      className="border-[#F0E4E7] lg:border-l lg:pl-8"
      initial={reduce ? undefined : { opacity: 0, y: 10 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
    >
      <ChartColumn className="text-[#FF1724]" aria-hidden />
      <h3 className="mt-4 text-3xl font-semibold leading-tight tracking-tight">
        A large share is <span className="text-[#FF1724]">preventable.</span>
      </h3>
      <p className="mt-4 text-sm leading-relaxed text-[#667085]">
        WHO estimates that up to 80% of premature heart disease and stroke can be prevented through changes to risks such as blood pressure, blood sugar, tobacco use, obesity, alcohol use, and drug use.
      </p>
      <p className="mt-4 text-xs leading-relaxed text-[#98A2B3]">
        The chart beside this note mixes NHANES clinical measures, an NHIS smoking estimate, and NSDUH substance-use surveys. Read each bar by its own definition.
      </p>
    </motion.aside>
  );
}
