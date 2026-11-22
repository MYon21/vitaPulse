"use client";

import { motion, useReducedMotion } from "motion/react";
import { Shield } from "lucide-react";
import { InteractiveECGTicker } from "@/components/cardiome/InteractiveECGTicker";
import { AnimatedHeart } from "@/components/hero/AnimatedHeart";

export function HeroSection() {
  const reduce = useReducedMotion();
  const rise = reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <section id="signal" className="mx-auto max-w-6xl overflow-x-clip px-5 pb-16 pt-24 md:pt-28">
      <InteractiveECGTicker />
      <div className="mt-6 grid items-center gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <AnimatedHeart />
      <motion.div {...rise} transition={{ duration: 0.6 }} className="relative z-10 min-w-0">
        <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.16em] text-[#FF1724]">
          <span className="h-[3px] w-8 rounded-full bg-[#FF1724]" />
          AI CARDIOVASCULAR RISK SCREENING
        </p>
        <h1 className="mt-4 max-w-xl text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-[#101014] lg:text-6xl">
          Understand your heart. <span className="text-[#FF1724]">Move with confidence.</span>
        </h1>
        <p className="mt-5 max-w-md text-lg leading-relaxed text-[#667085]">
          VitaPulse helps you explore cardiovascular risk using age, sex, blood pressure, blood sugar, alcohol use, and drug use.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <a
            href="#how"
            className="inline-flex items-center justify-center rounded-full bg-[#FF1724] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(255,23,36,0.28)] transition hover:bg-[#D90016] active:translate-y-px"
          >
            Try VitaPulse <span className="ml-2">→</span>
          </a>
          <a
            href="#how"
            className="inline-flex items-center justify-center rounded-full border border-[#F0E4E7] bg-white px-5 py-3 text-sm font-semibold text-[#101014] transition hover:border-[#FF1724]"
          >
            See how it works
          </a>
        </div>
        <p className="mt-4 flex items-center gap-2 text-sm text-[#667085]">
          <Shield size={15} className="text-[#FF1724]" aria-hidden />
          For awareness and education only. Not a diagnosis.
        </p>
      </motion.div>
      </div>
    </section>
  );
}
