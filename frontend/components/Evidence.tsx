"use client";

import { useEffect, useState } from "react";
import { RiskChart } from "@/components/RiskChart";
import { useAppSelector } from "@/store/hooks";
import type { Stat } from "@/store/landingSlice";

export function Evidence() {
  const stats = useAppSelector((state) => state.landing.stats);
  const revealed = useAppSelector((state) => state.landing.revealed.evidence);
  const source = useAppSelector((state) => state.landing.source);

  return (
    <section id="evidence" className={revealed ? "section is-in" : "section"}>
      <div className="wrap">
        <div className="section-head">
          <p className="kicker">03 — Evidence</p>
          <div className="section-head-row">
            <h2>The scale of the disease.</h2>
            <p>
              Heart disease is common, unevenly distributed, and often tied to
              risks that can still be changed. The figures below are the public
              record VitaPulse is built against.
            </p>
          </div>
        </div>
        <div className="stats">
          {stats.map((stat, index) => (
            <StatBox key={stat.id} stat={stat} start={revealed} delay={index * 120} />
          ))}
        </div>
        <RiskChart />
        <p className="source">{source}</p>
      </div>
    </section>
  );
}

function StatBox({ stat, start, delay }: { stat: Stat; start: boolean; delay: number }) {
  const value = useCount(stat.value, start, delay, stat.decimals);
  const text =
    stat.decimals > 0 ? value.toFixed(stat.decimals) : Math.round(value).toString();

  return (
    <article
      className="stat"
      aria-label={`${stat.decimals > 0 ? stat.value.toFixed(stat.decimals) : stat.value}${stat.suffix}. ${stat.label}. ${stat.detail}`}
    >
      <p className="stat-index">{stat.index}</p>
      <p className="stat-value" aria-hidden="true">
        {text}
        <span className="stat-suffix">{stat.suffix}</span>
      </p>
      <h3>{stat.label}</h3>
      <p className="stat-detail">{stat.detail}</p>
    </article>
  );
}

function useCount(target: number, start: boolean, delay: number, decimals: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setValue(target);
      return;
    }
    let raf = 0;
    let timeout = 0;
    const duration = 1500;
    timeout = window.setTimeout(() => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        const eased = 1 - (1 - p) ** 3;
        const next = target * eased;
        setValue(decimals > 0 ? next : next);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => {
      window.clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [start, target, delay, decimals]);

  return value;
}
