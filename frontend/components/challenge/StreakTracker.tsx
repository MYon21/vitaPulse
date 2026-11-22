import { Flame } from "lucide-react";

export function StreakTracker({ current, best }: { current: number; best: number }) {
  return (
    <div className="flex items-end gap-6">
      <p className="text-5xl font-semibold leading-none">
        {current}
        <span className="ml-2 inline-flex items-center gap-1 text-base font-medium text-[#667085]">
          <Flame size={16} className="text-[#FF1724]" aria-hidden="true" /> day streak
        </span>
      </p>
      <p className="pb-1 text-sm font-semibold">Longest {best}</p>
    </div>
  );
}
