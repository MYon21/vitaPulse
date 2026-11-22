"use client";

import { motion, useReducedMotion } from "motion/react";

export function AnimatedRiskGauge({
  status,
  band,
  score,
  errorLabel,
}: {
  status: "idle" | "calculating" | "ready" | "error";
  band?: string;
  score?: number;
  errorLabel?: string;
}) {
  const reduce = useReducedMotion();
  const ready = status === "ready" && band && typeof score === "number";
  const label =
    status === "calculating"
      ? "Calculating"
      : status === "error"
        ? errorLabel ?? "Check inputs"
        : ready
          ? band
          : "Awaiting input";
  const offset = ready ? 1 - score : status === "calculating" ? 0.62 : 0.92;

  return (
    <div className="text-center">
      <svg viewBox="0 0 220 130" className="mx-auto h-36 w-full max-w-[240px]" role="img" aria-label={label}>
        <path d="M24 112 A86 86 0 0 1 196 112" fill="none" stroke="#F3E4E7" strokeWidth="14" strokeLinecap="round" />
        <motion.path
          d="M24 112 A86 86 0 0 1 196 112"
          fill="none"
          stroke="#FF1724"
          strokeWidth="14"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          animate={{ strokeDashoffset: offset }}
          transition={reduce || status !== "calculating" ? { duration: reduce ? 0 : 0.7 } : { duration: 0.9, repeat: Infinity, repeatType: "reverse" }}
        />
      </svg>
      <p className="-mt-8 text-xs font-medium text-[#667085]">Risk signal</p>
      {ready ? (
        <p className="text-5xl font-semibold leading-none tracking-tight text-[#101014]">{score.toFixed(2)}</p>
      ) : null}
      <p className={`${ready ? "mt-1 text-xl" : "text-3xl"} font-semibold tracking-tight text-[#101014]`}>{label}</p>
      <p className="mt-1 text-sm text-[#FF1724]">
        {ready ? "0 lower chance · 1 higher chance" : "Not a clinical result"}
      </p>
    </div>
  );
}
