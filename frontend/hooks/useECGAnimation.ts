"use client";

import { useEffect, useRef } from "react";
import { BEAT_MS } from "@/lib/ecgWaveform";

type PhaseListener = (phase: number) => void;

const listeners = new Set<PhaseListener>();
let frame = 0;

function tick(now: number) {
  const phase = (now % BEAT_MS) / BEAT_MS;
  listeners.forEach((listener) => listener(phase));
  frame = window.requestAnimationFrame(tick);
}

export function subscribeBeat(listener: PhaseListener) {
  listeners.add(listener);
  if (listeners.size === 1) frame = window.requestAnimationFrame(tick);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.cancelAnimationFrame(frame);
  };
}

/** Runs `onPhase` once per frame while `active` is true. The callback is read from a ref, so it does not restart the loop. */
export function useECGAnimation(onPhase: PhaseListener, active: boolean) {
  const onPhaseRef = useRef(onPhase);
  onPhaseRef.current = onPhase;

  useEffect(() => {
    if (!active) return undefined;
    return subscribeBeat((phase) => onPhaseRef.current(phase));
  }, [active]);
}
