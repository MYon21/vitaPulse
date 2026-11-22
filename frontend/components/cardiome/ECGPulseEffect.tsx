"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

export type ECGPulseHandle = {
  play: (x: number, y: number) => void;
};

export const ECGPulseEffect = forwardRef<ECGPulseHandle>(function ECGPulseEffect(_, ref) {
  const rippleRef = useRef<HTMLSpanElement>(null);

  useImperativeHandle(ref, () => ({
    play(x, y) {
      const ripple = rippleRef.current;
      if (!ripple) return;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.classList.remove("ecg-ripple");
      void ripple.offsetWidth;
      ripple.classList.add("ecg-ripple");
    },
  }));

  return (
    <span
      ref={rippleRef}
      aria-hidden="true"
      className="pointer-events-none absolute h-16 w-16 rounded-full bg-[#FF1724]/35 opacity-0"
    />
  );
});
