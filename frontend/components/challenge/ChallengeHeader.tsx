"use client";

import { useReducedMotion } from "motion/react";
import { CHALLENGE_DAYS, dayOffset, formatLong } from "@/lib/challenge/dates";
import { adherence, streakCounts } from "@/lib/challenge/streaks";
import type { ActiveChallenge } from "@/lib/challenge/types";
import { StreakTracker } from "@/components/challenge/StreakTracker";
import { useAppDispatch } from "@/store/hooks";
import { togglePause } from "@/store/challengeSlice";

export function ChallengeHeader({ challenge, today }: { challenge: ActiveChallenge; today: string }) {
  const reduce = useReducedMotion();
  const dispatch = useAppDispatch();
  const elapsed = Math.min(CHALLENGE_DAYS, Math.max(0, dayOffset(challenge.startedOn, today) + 1));
  const remaining = Math.max(0, CHALLENGE_DAYS - elapsed);
  const score = streakCounts(challenge, today);
  const habitScore = adherence(challenge, today);
  const paused = challenge.pausedDates.includes(today);
  return (
    <div>
      <p className="text-xs font-bold tracking-[0.16em] text-[#FF1724]">30-DAY CHALLENGE</p>
      <h2 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Your Heart. Your 30-Day Journey.</h2>
      <p className="mt-2 max-w-2xl text-[#667085]">Build stronger habits, follow your progress, and understand what changes over time.</p>
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="text-sm text-[#667085]">
          <p className="text-lg font-semibold text-[#101014]">Day {Math.min(elapsed, CHALLENGE_DAYS)} · {remaining} days remaining</p>
          <p className="mt-1">{formatLong(challenge.startedOn)} – {formatLong(challenge.endsOn)}</p>
          <p className="mt-1">Habit adherence {habitScore.percent}% ({habitScore.completed} of {habitScore.scheduled} scheduled checks). Elapsed days are not the same as completed habits.</p>
        </div>
        <StreakTracker current={score.current} best={score.best} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold text-[#667085]">Days elapsed</p>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#F0E4E7]">
            <div className={`h-full bg-[#FF1724] ${reduce ? "" : "transition-[width]"}`} style={{ width: `${(elapsed / CHALLENGE_DAYS) * 100}%` }} />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-[#667085]">Scheduled habits completed</p>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#F0E4E7]">
            <div className={`h-full bg-[#101014] ${reduce ? "" : "transition-[width]"}`} style={{ width: `${habitScore.percent}%` }} />
          </div>
        </div>
      </div>
      <button type="button" onClick={() => dispatch(togglePause(today))} className="mt-4 text-sm font-semibold text-[#FF1724]">
        {paused ? "Resume today" : "Pause today"}
      </button>
      <p className="mt-1 text-xs text-[#667085]">A pause keeps the streak from breaking. Missing a day does not mean you should push through pain.</p>
    </div>
  );
}
