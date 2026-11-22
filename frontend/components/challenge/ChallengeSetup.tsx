"use client";

import { HABIT_CATALOG, habitsForJourney } from "@/lib/challenge/habits";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  activateChallenge,
  closeSetup,
  setCondition,
  setConfirmed,
  setConsent,
  setJourney,
  setSchedule,
  setStep,
  setTarget,
  toggleDraftHabit,
} from "@/store/challengeSlice";
import type { HeartCondition, Journey } from "@/lib/challenge/types";

const CONDITIONS: { id: HeartCondition; label: string }[] = [
  { id: "coronary", label: "Coronary artery disease" },
  { id: "heart_attack", label: "Previous heart attack" },
  { id: "heart_failure", label: "Heart failure" },
  { id: "arrhythmia", label: "Arrhythmia" },
  { id: "valve", label: "Heart valve disease" },
  { id: "other", label: "Other / not sure" },
];

export function ChallengeSetup() {
  const dispatch = useAppDispatch();
  const draft = useAppSelector((state) => state.challenge.draft);
  const step = useAppSelector((state) => state.challenge.step);
  const message = useAppSelector((state) => state.challenge.message);
  const prediction = useAppSelector((state) => state.heartRisk.prediction);
  const status = useAppSelector((state) => state.heartRisk.status);
  const fields = useAppSelector((state) => state.heartRisk.fields);
  const hasAssessment = status === "ready" && prediction !== null;
  const habits = draft.journey ? habitsForJourney(draft.journey) : HABIT_CATALOG.filter((habit) => habit.id !== "medications");

  return (
    <div className="rounded-[28px] border border-[#F0E4E7] bg-white p-5 shadow-[0_16px_40px_rgba(16,16,20,0.05)] sm:p-8">
      <p className="text-xs font-bold tracking-[0.16em] text-[#FF1724]">STEP {step} OF 4</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight">Set up your challenge</h2>
      <p className="mt-2 max-w-2xl text-sm text-[#667085]">
        {hasAssessment
          ? "This session has a risk signal from a synthetic model. It is not a validated clinical assessment, and it will not start a medical program."
          : "No completed assessment is in this session. You can still start a general educational challenge."}
      </p>

      {step === 1 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {(["prevent", "living"] as Journey[]).map((journey) => (
            <button
              key={journey}
              type="button"
              aria-pressed={draft.journey === journey}
              onClick={() => dispatch(setJourney(journey))}
              className={`rounded-2xl border px-4 py-4 text-left font-semibold ${draft.journey === journey ? "border-[#FF1724] bg-[#FFF0F2]" : "border-[#F0E4E7]"}`}
            >
              {journey === "prevent" ? "I want to prevent heart disease" : "I live with heart disease"}
            </button>
          ))}
          {draft.journey === "living" ? (
            <div className="sm:col-span-2">
              <p className="text-sm font-semibold">Optional condition, for education only</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {CONDITIONS.map((condition) => (
                  <button
                    key={condition.id}
                    type="button"
                    aria-pressed={draft.condition === condition.id}
                    onClick={() => dispatch(setCondition(draft.condition === condition.id ? "" : condition.id))}
                    className={`rounded-full border px-3 py-1.5 text-sm ${draft.condition === condition.id ? "border-[#FF1724] bg-[#FFF0F2]" : "border-[#F0E4E7]"}`}
                  >
                    {condition.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm text-[#101014]">Chest pressure, sudden shortness of breath, fainting, or pain in the arm, neck, or jaw: call emergency services. Do not use this challenge instead.</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {habits.map((habit) => {
            const selected = draft.habitIds.includes(habit.id);
            return (
              <div key={habit.id} className={`rounded-2xl border p-4 ${selected ? "border-[#FF1724] bg-[#FFF0F2]" : "border-[#F0E4E7]"}`}>
                <button type="button" aria-pressed={selected} onClick={() => dispatch(toggleDraftHabit(habit.id))} className="text-left">
                  <span className="block font-semibold">{habit.title}</span>
                  <span className="mt-1 block text-sm text-[#667085]">{habit.tip}</span>
                </button>
                {selected ? (
                  <div className="mt-3 grid gap-2">
                    <label className="text-xs font-semibold text-[#667085]">
                      Your target
                      <input
                        value={draft.targets[habit.id] ?? habit.goal}
                        onChange={(event) => dispatch(setTarget({ id: habit.id, value: event.target.value }))}
                        className="mt-1 w-full rounded-xl border border-[#F0E4E7] bg-white px-3 py-2 text-sm text-[#101014]"
                      />
                    </label>
                    <label className="text-xs font-semibold text-[#667085]">
                      Schedule
                      <select
                        value={draft.schedules[habit.id] ?? habit.schedule}
                        onChange={(event) => dispatch(setSchedule({ id: habit.id, value: event.target.value as "daily" | "weekdays" }))}
                        className="mt-1 w-full rounded-xl border border-[#F0E4E7] bg-white px-3 py-2 text-sm"
                      >
                        <option value="daily">Every day</option>
                        <option value="weekdays">Weekdays, weekends rest</option>
                      </select>
                    </label>
                  </div>
                ) : null}
              </div>
            );
          })}
          <p className="text-sm text-[#667085] sm:col-span-2">{draft.habitIds.length} of 2–3 selected. Targets are notes, not prescriptions.</p>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-6 text-sm text-[#101014]">
          <h3 className="text-xl font-semibold">Review your starting point</h3>
          {hasAssessment ? (
            <ul className="mt-3 space-y-2 text-[#667085]">
              <li>Blood pressure on the form: {fields.systolic && fields.diastolic ? `${fields.systolic}/${fields.diastolic} mmHg, one reading, context not specified.` : "Not entered."}</li>
              <li>Glucose on the form: {fields.sugar ? `${fields.sugar} mg/dL, unspecified timing. It will not be averaged with fasting or after-meal readings.` : "Not entered."}</li>
              <li>Weight: {fields.weightKg ? `${fields.weightKg} kg from the form.` : "Not entered. BMI alone is not converted into a weight."}</li>
              <li>Sleep and activity: no history is stored. No previous measurements available for those. Start tracking today.</li>
            </ul>
          ) : (
            <p className="mt-3 text-[#667085]">No previous measurements available. Start tracking today.</p>
          )}
          <p className="mt-3">The baseline lookback is 30 days. This app has no record store, so a baseline can only copy this session’s form, and only if you agree below. It is locked when the challenge starts.</p>
          <label className="mt-4 flex items-start gap-2">
            <input type="checkbox" checked={draft.consentReuse} onChange={(event) => dispatch(setConsent(event.target.checked))} />
            <span>I agree to copy this session’s blood pressure, glucose, and weight into the challenge baseline. Nothing is sent to a health record.</span>
          </label>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="mt-6 text-sm">
          <h3 className="text-xl font-semibold">Confirm challenge</h3>
          <ul className="mt-3 space-y-1 text-[#667085]">
            <li>Journey: {draft.journey === "living" ? "I live with heart disease" : "I want to prevent heart disease"}</li>
            <li>Habits: {draft.habitIds.map((id) => habits.find((habit) => habit.id === id)?.title).filter(Boolean).join(", ") || "None yet"}</li>
            <li>Starts today and runs 30 days. Reminders stay on this screen. No notification is sent.</li>
            <li>Health data permission: {draft.consentReuse ? "copy this session’s form readings" : "do not copy form readings"}.</li>
          </ul>
          <label className="mt-4 flex items-start gap-2">
            <input type="checkbox" checked={draft.confirmed} onChange={(event) => dispatch(setConfirmed(event.target.checked))} />
            <span>I confirm this challenge is educational. It does not prescribe exercise, diet, fluids, or medicine changes.</span>
          </label>
        </div>
      ) : null}

      {message ? <p className="mt-4 text-sm text-[#D90016]">{message}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        {step > 1 ? (
          <button type="button" onClick={() => dispatch(setStep((step - 1) as 1 | 2 | 3 | 4))} className="rounded-full border border-[#F0E4E7] px-4 py-2 text-sm font-semibold">
            Back
          </button>
        ) : (
          <button type="button" onClick={() => dispatch(closeSetup())} className="rounded-full border border-[#F0E4E7] px-4 py-2 text-sm font-semibold">
            Close
          </button>
        )}
        {step < 4 ? (
          <button
            type="button"
            disabled={(step === 1 && !draft.journey) || (step === 2 && (draft.habitIds.length < 2 || draft.habitIds.length > 3))}
            onClick={() => dispatch(setStep((step + 1) as 2 | 3 | 4))}
            className="rounded-full bg-[#FF1724] px-4 py-2 text-sm font-semibold text-white disabled:bg-[#F0E4E7] disabled:text-[#667085]"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={() => dispatch(activateChallenge({ fields: hasAssessment ? fields : null, hasAssessment }))}
            className="rounded-full bg-[#FF1724] px-4 py-2 text-sm font-semibold text-white"
          >
            Start Challenge
          </button>
        )}
      </div>
    </div>
  );
}
