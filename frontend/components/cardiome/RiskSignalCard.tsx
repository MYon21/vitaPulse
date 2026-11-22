"use client";

import { ChevronDown } from "lucide-react";
import { AnimatedRiskGauge } from "@/components/cardiome/AnimatedRiskGauge";
import { ResultQr } from "@/components/cardiome/ResultQr";
import { StartChallengeButton } from "@/components/challenge/StartChallengeButton";
import { LIVING_ACTIONS, matchedActions, PREVENT_ACTIONS } from "@/lib/prevention";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectHeartFields, setExplainOpen } from "@/store/heartRiskSlice";

export function RiskSignalCard() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.heartRisk.status);
  const prediction = useAppSelector((state) => state.heartRisk.prediction);
  const open = useAppSelector((state) => state.heartRisk.explainOpen);
  const errorMessage = useAppSelector((state) => state.heartRisk.errorMessage);
  const fields = useAppSelector(selectHeartFields);
  const gaugeStatus = status === "calculating" ? "calculating" : status === "ready" ? "ready" : status === "error" ? "error" : "idle";
  const matched = prediction ? matchedActions(fields, prediction.band) : null;
  const heartSteps = matched
    ? LIVING_ACTIONS.filter((action) => matched.living.includes(action.id)).map((action) => action.title)
    : [];
  const preventSteps = matched
    ? PREVENT_ACTIONS.filter((action) => matched.prevent.includes(action.id)).map((action) => action.title)
    : [];
  const higher = prediction?.band === "Elevated" || prediction?.band === "High";

  return (
    <article className="rounded-[28px] border border-[#F0E4E7] bg-white p-5 shadow-[0_18px_50px_rgba(255,23,36,0.06)]">
      <p className="text-xs font-semibold text-[#FF1724]">02</p>
      <h3 className="mt-1 text-xl font-semibold tracking-tight">Get your risk signal</h3>
      <p className="mt-1 text-sm text-[#667085]">The trained model’s chance, from 0 to 1. Not a diagnosis.</p>
      <div className="mt-2">
        <AnimatedRiskGauge status={gaugeStatus} band={prediction?.band} score={prediction?.score} errorLabel={errorMessage ? "Try again" : undefined} />
      </div>
      {errorMessage ? <p className="mt-2 text-sm text-[#D90016]">{errorMessage}</p> : null}
      {status === "calculating" ? (
        <svg viewBox="0 0 220 36" className="mt-4 h-9 w-full" aria-hidden="true">
          <path className="monitor-sweep" d="M0 20 H40 L48 20 L56 8 L66 30 L76 6 L86 22 H220" fill="none" stroke="#FF1724" strokeWidth="2" />
        </svg>
      ) : null}
      {prediction && matched ? (
        <div className="mt-3 text-sm text-[#667085]">
          <p>
            Model chance {prediction.score.toFixed(2)}. This {prediction.band} signal checks these steps on{" "}
            <a href={higher ? "#living-plan" : "#prevent-plan"} className="font-semibold text-[#FF1724]">
              {higher ? "I live with heart disease" : "I want to prevent heart disease"}
            </a>
            . A score is not a diagnosis.
          </p>
          <ul className="mt-2 space-y-1">
            {(higher ? heartSteps : preventSteps).map((title) => (
              <li key={title}>
                <a href={higher ? "#living-plan" : "#prevent-plan"} className="font-medium text-[#101014]">
                  {title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <StartChallengeButton />
      <p className="mt-2 text-xs text-[#667085]">Starting a challenge does not turn this score into a medical program. Without a completed assessment, the challenge stays general and educational.</p>
      <button
        type="button"
        className="mt-4 flex w-full items-center justify-between rounded-xl bg-[#FFF0F2] px-3 py-2 text-left text-sm font-medium"
        aria-expanded={open}
        onClick={() => dispatch(setExplainOpen(!open))}
      >
        Understand this result
        <ChevronDown size={16} className={open ? "rotate-180 transition" : "transition"} />
      </button>
      {open ? (
        <p className="mt-2 text-sm leading-relaxed text-[#667085]">
          {prediction
            ? `${prediction.disclaimer} Sex, age, BMI, family history, alcohol, smoking, drug use, blood pressure, and glucose are sent to the model. ${prediction.summary}`
            : "After you calculate, this card shows the model’s chance from 0 to 1. The model was trained on synthetic data. It cannot diagnose heart disease."}
        </p>
      ) : null}
      {prediction ? <ResultQr id={prediction.id} lanIp={prediction.lanIp} /> : null}
    </article>
  );
}
