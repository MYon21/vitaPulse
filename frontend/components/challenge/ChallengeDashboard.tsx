"use client";

import { BaselineComparison } from "@/components/challenge/BaselineComparison";
import { ChallengeCalendar } from "@/components/challenge/ChallengeCalendar";
import { ChallengeHeader } from "@/components/challenge/ChallengeHeader";
import { ChallengeInsights } from "@/components/challenge/ChallengeInsights";
import { ChallengeReport } from "@/components/challenge/ChallengeReport";
import { DailyCheckIn } from "@/components/challenge/DailyCheckIn";
import { dateKey } from "@/lib/challenge/dates";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { openSetup, setCareNote, setFocusDate } from "@/store/challengeSlice";

const LINKS = [
  ["#challenge-today", "Today"],
  ["#challenge-calendar", "Calendar"],
  ["#health-trends", "My Health Trends"],
  ["#challenge-insights", "Insights"],
  ["#challenge-report", "Report"],
];

export function ChallengeDashboard() {
  const dispatch = useAppDispatch();
  const challenge = useAppSelector((state) => state.challenge.active);
  const focus = useAppSelector((state) => state.challenge.focusDate);
  const message = useAppSelector((state) => state.challenge.message);
  const today = dateKey();
  if (!challenge) return null;

  return (
    <div className="mt-8 lg:grid lg:grid-cols-[180px_minmax(0,1fr)] lg:gap-8">
      <nav className="mb-6 hidden lg:block" aria-label="Challenge">
        <div className="sticky top-24 grid gap-2 text-sm font-semibold">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} className="rounded-xl px-3 py-2 hover:bg-[#FFF0F2]">{label}</a>
          ))}
        </div>
      </nav>
      <div className="grid gap-8">
        <ChallengeHeader challenge={challenge} today={today} />
        {message ? <p className="text-sm text-[#D90016]">{message}</p> : null}
        <div id="challenge-today">
          <DailyCheckIn challenge={challenge} date={focus} />
        </div>
        <div id="challenge-calendar">
          <ChallengeCalendar challenge={challenge} today={today} focus={focus} />
        </div>
        <BaselineComparison challenge={challenge} today={today} />
        <div id="challenge-insights">
          <ChallengeInsights challenge={challenge} today={today} />
        </div>
        {challenge.journey === "living" ? (
          <div className="rounded-[28px] border border-[#FF1724] bg-[#FFF0F2] p-5">
            <h3 className="text-xl font-semibold">Living with heart disease</h3>
            <p className="mt-2 text-sm">These notes do not replace a care plan. Do not change medicines, fluids, or activity limits. Possible heart attack or stroke symptoms: call emergency services.</p>
            <label className="mt-3 block text-sm font-semibold">Symptom note
              <textarea value={challenge.careNotes.symptoms} onChange={(event) => dispatch(setCareNote({ key: "symptoms", value: event.target.value }))} className="mt-1 w-full rounded-xl border border-[#F0E4E7] bg-white p-3 text-sm font-normal" />
            </label>
            <label className="mt-3 block text-sm font-semibold">Appointment already on your calendar
              <input value={challenge.careNotes.appointment} onChange={(event) => dispatch(setCareNote({ key: "appointment", value: event.target.value }))} className="mt-1 w-full rounded-xl border border-[#F0E4E7] bg-white px-3 py-2 text-sm font-normal" />
            </label>
            <label className="mt-3 block text-sm font-semibold">Question for your clinician
              <input value={challenge.careNotes.question} onChange={(event) => dispatch(setCareNote({ key: "question", value: event.target.value }))} className="mt-1 w-full rounded-xl border border-[#F0E4E7] bg-white px-3 py-2 text-sm font-normal" />
            </label>
            <p className="mt-3 text-sm">Medicine reminders, cardiac rehab, and clinic messages are not connected. If a clinician gave you a goal, write it as a habit target. This screen cannot send it to a care team.</p>
          </div>
        ) : null}
        <ChallengeReport challenge={challenge} today={today} />
        <button type="button" onClick={() => dispatch(openSetup())} className="justify-self-start text-sm font-semibold text-[#FF1724]">Start a new challenge</button>
        <button type="button" onClick={() => dispatch(setFocusDate(today))} className="sticky bottom-4 justify-self-start rounded-full bg-[#FF1724] px-4 py-2 text-sm font-semibold text-white shadow-lg lg:hidden">
          Today’s check-in
        </button>
      </div>
    </div>
  );
}
