"use client";

export function RiskPreviewWidget() {

  return (
    <aside className="absolute right-0 top-[38%] z-10 w-[150px] rounded-2xl border border-white/80 bg-white/75 p-3 text-center shadow-[0_16px_40px_rgba(255,23,36,0.12)] backdrop-blur-md sm:right-1">
      <p className="text-[11px] font-semibold text-[#667085]">Risk Signal</p>
      <svg viewBox="0 0 120 68" className="mx-auto mt-1 h-14 w-full" aria-hidden="true">
        <path d="M14 58 A46 46 0 0 1 106 58" fill="none" stroke="#F3E1E4" strokeWidth="8" strokeLinecap="round" />
        <path
          d="M14 58 A46 46 0 0 1 106 58"
          fill="none"
          stroke="#FF1724"
          strokeWidth="8"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="52 100"
        />
      </svg>
      <p className="-mt-2 text-sm font-semibold text-[#101014]">Moderate — Demo</p>
      <p className="text-[10px] leading-tight text-[#667085]">Decorative example, not a result.</p>
    </aside>
  );
}
