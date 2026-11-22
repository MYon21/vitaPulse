"use client";

import { useEffect, useRef, useState } from "react";
import { ECGPulseEffect, type ECGPulseHandle } from "@/components/cardiome/ECGPulseEffect";
import { ECGWaveform } from "@/components/cardiome/ECGWaveform";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ECG_PATH, ECG_VIEW_H, ECG_VIEW_W } from "@/lib/ecgWaveform";

const COOLDOWN_MS = 700;

export function InteractiveECGTicker() {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLButtonElement>(null);
  const pulseRef = useRef<ECGPulseHandle>(null);
  const hoverRef = useRef(false);
  const pointerRef = useRef<number | null>(null);
  const boostRef = useRef(0);
  const lockedUntil = useRef(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || reduced) return undefined;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced]);

  const pulseAt = (clientX: number, clientY: number) => {
    const now = performance.now();
    if (now < lockedUntil.current) return;
    lockedUntil.current = now + COOLDOWN_MS;
    boostRef.current = 1;
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) return;
    pulseRef.current?.play(clientX - rect.left, clientY - rect.top);
  };

  return (
    <button
      ref={rootRef}
      type="button"
      aria-label="Play decorative heartbeat pulse."
      aria-describedby="ecg-ticker-note"
      onPointerEnter={(event) => {
        if (event.pointerType !== "mouse") return;
        hoverRef.current = true;
      }}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse") return;
        const rect = rootRef.current?.getBoundingClientRect();
        if (!rect?.width) return;
        hoverRef.current = true;
        pointerRef.current = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      }}
      onPointerLeave={() => {
        hoverRef.current = false;
        pointerRef.current = null;
      }}
      onClick={(event) => pulseAt(event.clientX, event.clientY)}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        const rect = rootRef.current?.getBoundingClientRect();
        pulseAt((rect?.left ?? 0) + (rect?.width ?? 0) / 2, (rect?.top ?? 0) + (rect?.height ?? 0) / 2);
      }}
      className="relative block h-10 w-full overflow-hidden rounded-full border border-[#F6D5DA] bg-white/80 shadow-[0_0_28px_rgba(255,23,36,0.08)] backdrop-blur-sm transition hover:shadow-[0_0_36px_rgba(255,23,36,0.16)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#101014] sm:h-14"
    >
      <span id="ecg-ticker-note" className="sr-only">
        Decorative waveform. It is not a heart-rate measurement or a clinical tracing.
      </span>
      {reduced ? (
        <svg viewBox={`0 0 ${ECG_VIEW_W} ${ECG_VIEW_H}`} className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
          <path d={ECG_PATH} fill="none" stroke="#FF1724" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
      ) : (
        <ECGWaveform active={visible} hoverRef={hoverRef} pointerRef={pointerRef} boostRef={boostRef} />
      )}
      <ECGPulseEffect ref={pulseRef} />
    </button>
  );
}
