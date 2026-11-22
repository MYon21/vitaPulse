"use client";

import { useAppDispatch } from "@/store/hooks";
import { openSetup } from "@/store/challengeSlice";

export function StartChallengeButton({ label = "Start My 30-Day Heart Challenge" }: { label?: string }) {
  const dispatch = useAppDispatch();
  return (
    <button
      type="button"
      onClick={() => {
        dispatch(openSetup());
        document.getElementById("challenge")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
      className="mt-4 inline-flex items-center justify-center rounded-full bg-[#FF1724] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,23,36,0.28)] transition hover:bg-[#D90016]"
    >
      {label}
    </button>
  );
}
