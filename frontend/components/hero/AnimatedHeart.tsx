"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { FluidRibbons } from "@/components/hero/FluidRibbons";
import { HeartRateWidget } from "@/components/hero/HeartRateWidget";
import { RiskPreviewWidget } from "@/components/hero/RiskPreviewWidget";
import { subscribeBeat } from "@/hooks/useECGAnimation";
import { beatPulse } from "@/lib/ecgWaveform";

export function AnimatedHeart() {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const ribbonRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (reduce) return undefined;
    const node = rootRef.current;
    if (!node) return undefined;
    let unsubscribe = () => {};
    const observer = new IntersectionObserver(
      ([entry]) => {
        unsubscribe();
        unsubscribe = () => {};
        if (!entry.isIntersecting) return;
        unsubscribe = subscribeBeat((phase) => {
          const pulse = beatPulse(phase);
          if (imageRef.current) imageRef.current.style.transform = `scale(${(1 + pulse * 0.018).toFixed(4)})`;
          if (glowRef.current) glowRef.current.style.opacity = (pulse * 0.5).toFixed(3);
          if (ribbonRef.current) {
            ribbonRef.current.style.filter = `drop-shadow(0 0 ${(2 + pulse * 5).toFixed(2)}px rgba(255,23,36,${(0.2 + pulse * 0.35).toFixed(3)}))`;
          }
        });
      },
      { threshold: 0.08 },
    );
    observer.observe(node);
    return () => {
      unsubscribe();
      observer.disconnect();
    };
  }, [reduce]);

  return (
    <div ref={rootRef} className="relative isolate z-0 mx-auto h-[340px] w-full overflow-hidden sm:h-[420px] md:h-[460px] lg:h-[520px]">
      <FluidRibbons ref={ribbonRef} />
      <div className="absolute left-1/2 top-1/2 z-[1] h-[118%] w-[118%] max-w-none -translate-x-1/2 -translate-y-[48%]">
        <img
          ref={imageRef}
          src="/cardiome-heart.jpg"
          alt="Decorative translucent anatomical heart wrapped in red fluid ribbons. This is an illustration, not a medical scan."
          className="h-full w-full origin-center object-contain"
        />
        <div
          ref={glowRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-[22%] rounded-full bg-[radial-gradient(circle,rgba(255,23,36,0.7),transparent_68%)] opacity-0 mix-blend-screen"
        />
      </div>
      {!reduce
        ? [0, 1, 2, 3, 4].map((dot) => (
            <motion.span
              key={dot}
              className="absolute z-[2] h-1.5 w-1.5 rounded-full bg-[#FF1724]/70"
              style={{ left: `${18 + dot * 14}%`, top: `${22 + (dot % 3) * 18}%` }}
              animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3.2 + dot * 0.3, repeat: Infinity, ease: "easeInOut" }}
            />
          ))
        : null}
      <HeartRateWidget />
      <RiskPreviewWidget />
    </div>
  );
}
