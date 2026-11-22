"use client";

import { CHALLENGE_DAYS, dayOffset } from "@/lib/challenge/dates";
import { adherence, streakCounts } from "@/lib/challenge/streaks";
import type { ActiveChallenge } from "@/lib/challenge/types";

export function ChallengeReport({ challenge, today }: { challenge: ActiveChallenge; today: string }) {
  const elapsed = dayOffset(challenge.startedOn, today) + 1;
  const finished = elapsed >= CHALLENGE_DAYS;
  const score = streakCounts(challenge, today);
  const habitScore = adherence(challenge, today);
  return (
    <div id="challenge-report" className="rounded-[28px] border border-[#F0E4E7] p-5">
      <h3 className="text-2xl font-semibold">{finished ? "30-day summary" : "Progress snapshot"}</h3>
      <p className="mt-2 text-sm text-[#667085]">Your recorded measurements changed only if a comparison above shows two real readings. This report does not say the challenge caused a change.</p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm">
        <li>Starting baseline: {challenge.baseline.emptyMessage ?? challenge.baseline.items.map((item) => `${item.kind} ${item.value}${item.value2 !== null ? `/${item.value2}` : ""} ${item.unit} on ${item.dates[0]} (${item.sampleCount} reading)`).join("; ")}</li>
        <li>Latest entered readings stay in Then vs. Now. They are not rewritten into the baseline.</li>
        <li>Habits: {challenge.habits.map((habit) => habit.title).join(", ")}</li>
        <li>Adherence: {habitScore.percent}% of scheduled checks.</li>
        <li>Longest streak: {score.best} days. Current streak: {score.current}.</li>
        <li>Charts use only readings saved in this session.</li>
        <li>Observed changes are the numeric differences in the table, with sample counts in each note.</li>
        <li>Missing data: {challenge.baseline.emptyMessage ?? "Sleep and activity have no history unless you enter them."}</li>
        <li>Question for a clinician: {challenge.careNotes.question || "None written yet."}</li>
        <li>You can keep the same two or three habits after day 30. This app does not store them after the page session ends.</li>
      </ol>
      <button type="button" onClick={() => window.print()} className="mt-4 rounded-full bg-[#FF1724] px-4 py-2 text-sm font-semibold text-white">
        Generate My 30-Day Heart Report
      </button>
      <p className="mt-2 text-xs text-[#667085]">{finished ? "This opens the print dialog so you can save a PDF on this device." : `Day ${Math.max(elapsed, 1)} of 30. The button prints a progress snapshot, not a finished medical report.`} The report is not given a public link.</p>
    </div>
  );
}
