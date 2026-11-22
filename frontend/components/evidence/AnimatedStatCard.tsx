"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, HeartPulse, Shield, Timer, type LucideIcon } from "lucide-react";
import { animate, useInView, useReducedMotion } from "motion/react";
import type { EvidenceStat } from "@/lib/evidenceData";

const ICONS: Record<string, LucideIcon> = {
  deaths: HeartPulse,
  interval: Timer,
  pressure: Activity,
  prevent: Shield,
};

export function AnimatedStatCard({ stat }: { stat: EvidenceStat }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? stat.value : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setValue(stat.value);
      return;
    }
    const controls = animate(0, stat.value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (next) => setValue(next),
    });
    return () => controls.stop();
  }, [inView, reduce, stat.value]);

  const Icon = ICONS[stat.id] ?? Activity;
  const shown = stat.decimals > 0 ? value.toFixed(stat.decimals) : Math.round(value).toString();

  return (
    <article
      ref={ref}
      className="rounded-[24px] border border-[#F0E4E7] bg-white p-5 shadow-[0_12px_30px_rgba(16,16,20,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(255,23,36,0.08)]"
    >
      <Icon className="text-[#FF1724]" size={22} aria-hidden />
      <p className="mt-4 text-4xl font-semibold tracking-tight text-[#FF1724]">
        {stat.id === "prevent" ? "Up to " : ""}
        {shown}
        {stat.suffix}
      </p>
      <h3 className="mt-2 text-sm font-semibold uppercase tracking-wide text-[#101014]">{stat.label}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#667085]">{stat.detail}</p>
      <p className="mt-3 text-xs leading-relaxed text-[#98A2B3]">{stat.source}</p>
    </article>
  );
}
