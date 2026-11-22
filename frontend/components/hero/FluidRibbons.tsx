"use client";

import { forwardRef } from "react";

export const FluidRibbons = forwardRef<SVGSVGElement>(function FluidRibbons(_, ref) {
  return (
    <svg ref={ref} className="pointer-events-none absolute inset-[6%] h-[88%] w-[88%]" viewBox="0 0 600 600" aria-hidden="true">
      <path
        className="fluid-ribbon"
        d="M70 310 C 140 180, 210 150, 300 210 S 470 340, 530 250"
        fill="none"
        stroke="#FF1724"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.28"
      />
      <path
        className="fluid-ribbon fluid-ribbon-delay"
        d="M90 390 C 180 470, 280 450, 340 360 S 470 220, 540 340"
        fill="none"
        stroke="#FF8A93"
        strokeWidth="8"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
});
