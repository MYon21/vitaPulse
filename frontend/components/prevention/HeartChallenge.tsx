"use client";

import { Check, ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CHALLENGE_DAYS,
  CHALLENGE_HABITS,
  addDays,
  challengeEnd,
  clearChallenge,
  dayOffset,
  formatShort,
  isDayComplete,
  loadChallenge,
  saveChallenge,
  streaks,
  todayKey,
  weekDays,
  weekStart,
  weekdayLetter,
  type ChallengeHabitId,
  type ChallengeRecord,
} from "@/lib/heartChallenge";

export function HeartChallenge() {
  const today = todayKey();
  const [record, setRecord] = useState<ChallengeRecord | null>(null);
  const [ready, setReady] = useState(false);
  const [picked, setPicked] = useState<ChallengeHabitId[]>([]);
  const [focusDay, setFocusDay] = useState(today);
  const [week, setWeek] = useState(weekStart(today));

  useEffect(() => {
    const saved = loadChallenge();
    setRecord(saved);
    if (saved) setWeek(weekStart(today));
    setReady(true);
  }, [today]);

  const togglePick = (id: ChallengeHabitId) => {
    setPicked((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 3) return current;
      return [...current, id];
    });
  };

  const start = () => {
    if (picked.length < 2 || picked.length > 3) return;
    const next: ChallengeRecord = { startedOn: today, habitIds: picked, checks: {} };
    saveChallenge(next);
    setRecord(next);
    setFocusDay(today);
    setWeek(weekStart(today));
  };

  const restart = () => {
    clearChallenge();
    setRecord(null);
    setPicked([]);
    setFocusDay(today);
  };

  const toggleCheck = (id: ChallengeHabitId) => {
    setRecord((current) => {
      if (!current) return current;
      const done = new Set(current.checks[focusDay] ?? []);
      if (done.has(id)) done.delete(id);
      else done.add(id);
      const next = { ...current, checks: { ...current.checks, [focusDay]: [...done] } };
      saveChallenge(next);
      return next;
    });
  };

  if (!ready) return null;

  if (!record) {
    return (
      <div className="border-t border-[#F0E4E7] px-5 py-6 sm:px-8">
        <p className="text-xs font-bold tracking-[0.2em] text-[#FF1724]">30 DAYS</p>
        <h3 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">30-Day Heart Challenge</h3>
        <p className="mt-2 max-w-xl text-sm text-[#667085]">Pick two or three prevention habits you can keep. Check in each day. Your streak grows when every habit for that day is done.</p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CHALLENGE_HABITS.map((habit) => {
            const selected = picked.includes(habit.id);
            return (
              <button
                key={habit.id}
                type="button"
                aria-pressed={selected}
                onClick={() => togglePick(habit.id)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  selected ? "border-[#FF1724] bg-[#FFF0F2]" : "border-[#F0E4E7] bg-white hover:border-[#FF1724]/40"
                }`}
              >
                <span className="block text-sm font-semibold">{habit.title}</span>
                <span className="mt-1 block text-xs text-[#667085]">{habit.text}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={start}
            disabled={picked.length < 2}
            className="inline-flex items-center justify-center rounded-full bg-[#FF1724] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,23,36,0.28)] transition hover:bg-[#D90016] disabled:cursor-not-allowed disabled:bg-[#F0E4E7] disabled:text-[#667085] disabled:shadow-none"
          >
            Start challenge
          </button>
          <p className="text-sm text-[#667085]">{picked.length} of 2–3 selected</p>
        </div>
      </div>
    );
  }

  const end = challengeEnd(record.startedOn);
  const firstWeek = weekStart(record.startedOn);
  const lastWeek = weekStart(end);
  const days = weekDays(week);
  const score = streaks(record, today);
  const focusChecks = record.checks[focusDay] ?? [];
  const focusOffset = dayOffset(record.startedOn, focusDay);
  const focusInChallenge = focusOffset >= 0 && focusOffset < CHALLENGE_DAYS && focusDay <= today;
  const finished = today > end;

  return (
    <div className="border-t border-[#F0E4E7] px-5 py-6 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-[#FF1724]">30 DAYS</p>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">30-Day Heart Challenge</h3>
          <p className="mt-2 text-sm text-[#667085]">
            {finished ? "These 30 days are complete." : `Day ${Math.min(CHALLENGE_DAYS, dayOffset(record.startedOn, today) + 1)} of ${CHALLENGE_DAYS}.`} Check-ins stay on this device.
          </p>
        </div>
        <div className="flex items-end gap-6">
          <p className="text-5xl font-semibold leading-none tracking-tight">
            {score.current}
            <span className="ml-2 inline-flex items-center gap-1 text-base font-medium text-[#667085]">
              <Flame size={16} className="text-[#FF1724]" aria-hidden="true" />
              day streak
            </span>
          </p>
          <p className="pb-1 text-sm font-semibold text-[#101014]">Best {score.best}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous week"
          disabled={week <= firstWeek}
          onClick={() => setWeek(addDays(week, -7))}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F0E4E7] disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        <p className="text-sm font-semibold">
          {formatShort(days[0])} – {formatShort(days[6])}
        </p>
        <button
          type="button"
          aria-label="Next week"
          disabled={week >= lastWeek}
          onClick={() => setWeek(addDays(week, 7))}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#F0E4E7] disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2">
        {days.map((day) => {
          const offset = dayOffset(record.startedOn, day);
          const inChallenge = offset >= 0 && offset < CHALLENGE_DAYS;
          const future = day > today;
          const complete = inChallenge && isDayComplete(record, day);
          const partial = inChallenge && !complete && (record.checks[day]?.length ?? 0) > 0;
          const selected = day === focusDay;
          const label = `${formatShort(day)}${complete ? ", complete" : partial ? ", partly done" : ""}`;
          return (
            <button
              key={day}
              type="button"
              disabled={!inChallenge || future}
              aria-pressed={selected}
              aria-label={label}
              onClick={() => setFocusDay(day)}
              className={`flex h-16 flex-col items-center justify-center rounded-2xl border text-sm font-semibold ${
                complete
                  ? "border-[#FF1724] bg-[#FF1724] text-white"
                  : partial
                    ? "border-[#FF1724] bg-[#FFF0F2] text-[#101014]"
                    : "border-[#F0E4E7] bg-white text-[#101014]"
              } ${selected && !complete ? "ring-2 ring-[#FF1724]" : ""} ${!inChallenge || future ? "opacity-40" : ""}`}
            >
              <span className="text-[10px] font-bold tracking-wide">{weekdayLetter(day)}</span>
              <span>{Number(day.slice(-2))}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold">
          {focusDay === today ? "Today’s check-in" : `Check-in for ${formatShort(focusDay)}`}
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {record.habitIds.map((id) => {
            const habit = CHALLENGE_HABITS.find((item) => item.id === id);
            if (!habit) return null;
            const done = focusChecks.includes(id);
            return (
              <button
                key={id}
                type="button"
                aria-pressed={done}
                disabled={!focusInChallenge}
                onClick={() => toggleCheck(id)}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left ${
                  done ? "border-[#FF1724] bg-[#FFF0F2]" : "border-[#F0E4E7] bg-white"
                } disabled:opacity-50`}
              >
                <span>
                  <span className="block text-sm font-semibold">{habit.title}</span>
                  <span className="mt-0.5 block text-xs text-[#667085]">{habit.text}</span>
                </span>
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                    done ? "border-[#FF1724] bg-[#FF1724] text-white" : "border-[#F0E4E7] text-transparent"
                  }`}
                  aria-hidden="true"
                >
                  <Check size={14} strokeWidth={3} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <button type="button" onClick={restart} className="mt-5 text-sm font-semibold text-[#FF1724]">
        Start a new challenge
      </button>
    </div>
  );
}
