"use client";

import { addDays, formatLong } from "@/lib/challenge/dates";
import { dayMark, type DayMark } from "@/lib/challenge/streaks";
import type { ActiveChallenge } from "@/lib/challenge/types";
import { useAppDispatch } from "@/store/hooks";
import { setFocusDate } from "@/store/challengeSlice";

const LABEL: Record<DayMark, string> = {
  complete: "completed",
  partial: "partly completed",
  missed: "missed",
  upcoming: "upcoming",
  rest: "rest day",
  paused: "paused",
  outside: "outside challenge",
};

export function ChallengeCalendar({ challenge, today, focus }: { challenge: ActiveChallenge; today: string; focus: string }) {
  const dispatch = useAppDispatch();
  const days = Array.from({ length: 30 }, (_, index) => addDays(challenge.startedOn, index));
  return (
    <div>
      <h3 className="text-xl font-semibold">30-day calendar</h3>
      <div className="mt-3 grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const mark = dayMark(challenge, day, today);
          const selected = day === focus;
          return (
            <button
              key={day}
              type="button"
              aria-pressed={selected}
              aria-label={`${formatLong(day)}, ${LABEL[mark]}`}
              disabled={mark === "upcoming"}
              onClick={() => dispatch(setFocusDate(day))}
              className={`flex h-14 flex-col items-center justify-center rounded-xl border text-xs font-semibold disabled:opacity-40 ${
                mark === "complete" ? "border-[#FF1724] bg-[#FF1724] text-white" : mark === "partial" ? "border-[#FF1724] bg-[#FFF0F2]" : "border-[#F0E4E7] bg-white"
              } ${selected && mark !== "complete" ? "ring-2 ring-[#FF1724]" : ""}`}
            >
              <span>{index + 1}</span>
              <span className="text-[10px] font-medium">{LABEL[mark].split(" ")[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
