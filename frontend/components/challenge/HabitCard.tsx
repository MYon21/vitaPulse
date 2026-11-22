"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { HabitCheck, HabitGoal } from "@/lib/challenge/types";
import { useAppDispatch } from "@/store/hooks";
import { addMeasurement, setCheckNote, toggleCheck } from "@/store/challengeSlice";

export function HabitCard({ habit, date, check }: { habit: HabitGoal; date: string; check: HabitCheck | undefined }) {
  const dispatch = useAppDispatch();
  const completed = Boolean(check?.completed);
  const [value, setValue] = useState("");
  const [value2, setValue2] = useState("");
  const [context, setContext] = useState<"fasting" | "post_meal" | "random" | "unspecified">("unspecified");
  const [note, setNote] = useState(check?.note ?? "");

  return (
    <article className={`rounded-2xl border p-4 ${completed ? "border-[#FF1724] bg-[#FFF0F2]" : "border-[#F0E4E7] bg-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{habit.title}</h3>
          <p className="mt-1 text-sm text-[#667085]">{habit.goal}</p>
        </div>
        <button
          type="button"
          aria-pressed={completed}
          onClick={() => dispatch(toggleCheck({ date, habitId: habit.id }))}
          className={`flex h-9 w-9 items-center justify-center rounded-xl border ${completed ? "border-[#FF1724] bg-[#FF1724] text-white" : "border-[#F0E4E7] text-transparent"}`}
        >
          <Check size={16} aria-hidden="true" />
          <span className="sr-only">{completed ? "Undo completion" : "Mark complete"}</span>
        </button>
      </div>
      <p className="mt-2 text-xs text-[#667085]">{habit.tip}</p>
      {check?.completedAt ? <p className="mt-2 text-xs font-semibold">Completed {new Date(check.completedAt).toLocaleString()}</p> : null}
      {habit.measurement ? (
        <form
          className="mt-3 grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            dispatch(addMeasurement({ kind: habit.measurement!, value, value2, context: habit.measurement === "glucose" ? context : "unspecified", recordedOn: date }));
          }}
        >
          <div className="flex gap-2">
            <input value={value} onChange={(event) => setValue(event.target.value)} placeholder={habit.measurement === "blood_pressure" ? "Systolic" : "Value"} className="w-full rounded-xl border border-[#F0E4E7] px-3 py-2 text-sm" />
            {habit.measurement === "blood_pressure" ? (
              <input value={value2} onChange={(event) => setValue2(event.target.value)} placeholder="Diastolic" className="w-full rounded-xl border border-[#F0E4E7] px-3 py-2 text-sm" />
            ) : null}
          </div>
          {habit.measurement === "glucose" ? (
            <select value={context} onChange={(event) => setContext(event.target.value as typeof context)} className="rounded-xl border border-[#F0E4E7] px-3 py-2 text-sm">
              <option value="unspecified">Unspecified timing</option>
              <option value="fasting">Fasting</option>
              <option value="post_meal">After a meal</option>
              <option value="random">Random</option>
            </select>
          ) : null}
          <button type="submit" className="rounded-full border border-[#FF1724] px-3 py-1.5 text-sm font-semibold text-[#FF1724]">Save reading</button>
        </form>
      ) : null}
      <label className="mt-3 block text-xs font-semibold text-[#667085]">
        Note
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          onBlur={() => dispatch(setCheckNote({ date, habitId: habit.id, note }))}
          className="mt-1 w-full rounded-xl border border-[#F0E4E7] bg-white px-3 py-2 text-sm font-normal text-[#101014]"
        />
      </label>
      {check && check.edits.length > 0 ? <p className="mt-2 text-[11px] text-[#667085]">{check.edits.length} edit{check.edits.length === 1 ? "" : "s"} saved with timestamps.</p> : null}
    </article>
  );
}
