"use client";

import { useRef, type RefObject } from "react";
import { useECGAnimation } from "@/hooks/useECGAnimation";
import { ECG_BEATS, ECG_PATH, ECG_VIEW_H, ECG_VIEW_W, sampleBeat } from "@/lib/ecgWaveform";

export type ECGWaveformProps = {
  active: boolean;
  hoverRef: RefObject<boolean>;
  pointerRef: RefObject<number | null>;
  boostRef: RefObject<number>;
};

export function ECGWaveform({ active, hoverRef, pointerRef, boostRef }: ECGWaveformProps) {
  const leadRef = useRef<SVGLinearGradientElement>(null);
  const baseRef = useRef<SVGPathElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const parallax = useRef(0);
  const beatRef = useRef(0);
  const lastPhase = useRef(0);

  useECGAnimation((phase) => {
    if (phase < lastPhase.current) beatRef.current = (beatRef.current + 1) % ECG_BEATS;
    lastPhase.current = phase;
    const head = ((beatRef.current + phase) / ECG_BEATS) * ECG_VIEW_W;
    const y = sampleBeat(phase) * ECG_VIEW_H;
    if (boostRef.current > 0) boostRef.current = Math.max(0, boostRef.current - 0.018);
    const boost = boostRef.current;
    const hover = hoverRef.current;
    const target = hover && pointerRef.current != null ? (pointerRef.current - 0.5) * 14 : 0;
    parallax.current += (target - parallax.current) * 0.12;

    if (groupRef.current) groupRef.current.setAttribute("transform", `translate(${parallax.current.toFixed(2)} 0)`);
    if (baseRef.current) baseRef.current.setAttribute("opacity", hover || boost > 0.05 ? "0.62" : "0.34");

    const gradient = leadRef.current;
    if (gradient) {
      const headFraction = head / ECG_VIEW_W;
      const stops = gradient.querySelectorAll("stop");
      stops.forEach((stop, index) => {
        const offset = index / (stops.length - 1);
        let delta = headFraction - offset;
        if (delta < -0.5) delta += 1;
        if (delta > 0.5) delta -= 1;
        let opacity = 0;
        if (delta >= -0.025 && delta <= 0) opacity = 1;
        else if (delta > 0) opacity = Math.max(0, 1 - delta / 0.16);
        stop.setAttribute("offset", offset.toFixed(4));
        stop.setAttribute("stop-opacity", Math.min(1, opacity + boost * 0.25).toFixed(3));
      });
    }

    if (dotRef.current) {
      const fraction = head / ECG_VIEW_W;
      const edge = fraction < 0.04 ? fraction / 0.04 : fraction > 0.96 ? (1 - fraction) / 0.04 : 1;
      dotRef.current.style.left = `${fraction * 100}%`;
      dotRef.current.style.top = `${(y / ECG_VIEW_H) * 100}%`;
      dotRef.current.style.opacity = edge.toFixed(3);
    }

    const cursor = cursorRef.current;
    const pointer = pointerRef.current;
    if (cursor) {
      if (hover && pointer != null) {
        const local = (pointer * ECG_BEATS) % 1;
        cursor.style.left = `${pointer * 100}%`;
        cursor.style.top = `${sampleBeat(local) * 100}%`;
        cursor.style.opacity = "0.9";
      } else {
        cursor.style.opacity = "0";
      }
    }
  }, active);

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg viewBox={`0 0 ${ECG_VIEW_W} ${ECG_VIEW_H}`} className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient ref={leadRef} id="ecg-lead" gradientUnits="userSpaceOnUse" x1="0" x2={ECG_VIEW_W} y1="0" y2="0">
            <stop offset="0" stopColor="#FF1724" stopOpacity="0" />
            <stop offset="0.2" stopColor="#FF1724" stopOpacity="0" />
            <stop offset="0.45" stopColor="#FF1724" stopOpacity="0.4" />
            <stop offset="0.5" stopColor="#FF1724" stopOpacity="1" />
            <stop offset="0.56" stopColor="#FF1724" stopOpacity="0.12" />
            <stop offset="1" stopColor="#FF1724" stopOpacity="0" />
          </linearGradient>
          <filter id="ecg-glow" x="-10%" y="-120%" width="120%" height="340%">
            <feGaussianBlur stdDeviation="1.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g ref={groupRef}>
          <path
            ref={baseRef}
            d={ECG_PATH}
            fill="none"
            stroke="#FF1724"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            opacity="0.34"
          />
          <path
            d={ECG_PATH}
            fill="none"
            stroke="url(#ecg-lead)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            filter="url(#ecg-glow)"
          />
        </g>
      </svg>
      <span
        ref={dotRef}
        className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF1724] opacity-0 shadow-[0_0_10px_2px_rgba(255,23,36,0.8)]"
      />
      <span
        ref={cursorRef}
        className="absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF1724]/20 opacity-0 blur-md"
      />
    </div>
  );
}
