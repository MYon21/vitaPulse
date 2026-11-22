"use client";

export function HeartRateWidget() {

  return (
    <aside className="absolute left-0 top-6 z-10 w-[148px] rounded-2xl border border-white/80 bg-white/75 p-3 shadow-[0_16px_40px_rgba(255,23,36,0.12)] backdrop-blur-md sm:left-2 sm:top-10">
      <p className="text-[11px] font-semibold tracking-wide text-[#667085]">HR</p>
      <p className="text-[28px] font-semibold leading-none tracking-tight text-[#101014]">
        72 <span className="text-xs font-medium text-[#667085]">BPM</span>
      </p>
      <svg viewBox="0 0 120 28" className="mt-2 h-7 w-full" aria-hidden="true">
        <path
          className="ecg-line"
          d="M0 16 H28 L36 16 L42 8 L50 24 L58 4 L66 20 L74 16 H120"
          fill="none"
          stroke="#FF1724"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="mt-1 text-[10px] leading-tight text-[#667085]">Illustrative reading. Not live patient data.</p>
    </aside>
  );
}
