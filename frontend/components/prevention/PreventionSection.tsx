"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Apple,
  Bed,
  Calendar,
  CalendarPlus,
  Check,
  CigaretteOff,
  Gauge,
  Heart,
  PersonStanding,
  Pill,
  Shield,
  Target,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useState } from "react";
import { StartChallengeButton } from "@/components/challenge/StartChallengeButton";
import { LIVING_ACTIONS, matchedActions, PREVENT_ACTIONS, type PreventionAction, type PreventionPath } from "@/lib/prevention";
import { useAppSelector } from "@/store/hooks";
import { selectHeartFields } from "@/store/heartRiskSlice";

const ICONS = {
  numbers: Gauge,
  move: PersonStanding,
  food: Apple,
  tobacco: CigaretteOff,
  sleep: Bed,
  checkups: CalendarPlus,
  medications: Pill,
  followups: Calendar,
  warnings: TriangleAlert,
  rehab: Heart,
} as const;

export function PreventionSection() {
  const reduce = useReducedMotion();
  const prediction = useAppSelector((state) => state.heartRisk.prediction);
  const fields = useAppSelector(selectHeartFields);
  const [checked, setChecked] = useState<Record<PreventionPath, string[]>>({ prevent: [], living: [] });
  const [path, setPath] = useState<PreventionPath>("prevent");
  const [planFor, setPlanFor] = useState<PreventionPath | null>(null);
  const [hint, setHint] = useState("");

  const preventPicked = checked.prevent;
  const livingPicked = checked.living;
  const planActions = planFor === "living" ? LIVING_ACTIONS : PREVENT_ACTIONS;
  const planChosen = planFor ? planActions.filter((action) => checked[planFor].includes(action.id)) : [];
  const matched = prediction ? matchedActions(fields, prediction.band) : null;
  const higher = prediction?.band === "Elevated" || prediction?.band === "High";
  const resultId = prediction?.id ?? null;

  useEffect(() => {
    if (!resultId || !prediction) {
      setChecked({ prevent: [], living: [] });
      setPlanFor(null);
      setPath("prevent");
      return;
    }
    const next = matchedActions(fields, prediction.band);
    setChecked({ prevent: next.prevent, living: next.living });
    setPlanFor(null);
    setPath(prediction.band === "Elevated" || prediction.band === "High" ? "living" : "prevent");
    // Re-check only when a new result arrives. Later edits stay with the user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultId]);

  const toggle = (which: PreventionPath, id: string) => {
    setChecked((current) => {
      const list = current[which];
      const next = list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
      return { ...current, [which]: next };
    });
    setPath(which);
    setHint("");
  };

  const buildPlan = (which: PreventionPath) => {
    if (checked[which].length === 0) {
      setPlanFor(null);
      setHint("Choose at least one action first.");
      return;
    }
    setHint("");
    setPlanFor(which);
    setPath(which);
  };

  return (
    <section id="prevent" className="bg-[#FFF7F8] px-5 py-20 text-[#101014]">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-4xl font-semibold tracking-tight sm:text-5xl">Your heart. Your next step.</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-[#667085]">
          Choose the path that fits you best. Get practical, evidence-based actions you can take today.
        </p>
        {prediction && matched ? (
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm font-medium text-[#101014]">
            Risk signal {prediction.score.toFixed(2)} · {prediction.band}.{" "}
            {higher
              ? `${matched.living.length} heart-health ${matched.living.length === 1 ? "step is" : "steps are"} checked on I live with heart disease.`
              : `${matched.prevent.length} prevention ${matched.prevent.length === 1 ? "step is" : "steps are"} checked on I want to prevent heart disease.`}{" "}
            A score is not a diagnosis.
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <PathPill active={path === "prevent"} onClick={() => setPath("prevent")}>
            I want to prevent heart disease
          </PathPill>
          <PathPill active={path === "living"} onClick={() => setPath("living")}>
            I live with heart disease
          </PathPill>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <article
            id="prevent-plan"
            className={`rounded-[28px] border bg-white p-4 shadow-[0_16px_40px_rgba(255,23,36,0.06)] sm:p-5 ${
              path === "prevent" ? "border-[#FF1724]" : "border-[#F6D5D8]"
            }`}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF0F2] text-[#FF1724]">
                  <Target size={22} />
                </span>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">My Heart Prevention Plan</h3>
                  <p className="text-sm text-[#667085]">Six key actions to lower your risk and keep your heart strong.</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-[210px]">
                  <p className="text-xs text-[#667085]">
                    Progress: <span className="font-semibold text-[#FF1724]">{preventPicked.length} of {PREVENT_ACTIONS.length}</span> actions completed
                  </p>
                  <div className="mt-2 flex gap-1" aria-hidden="true">
                    {PREVENT_ACTIONS.map((action, index) => (
                      <span
                        key={action.id}
                        className={`h-1.5 flex-1 rounded-full ${index < preventPicked.length ? "bg-[#FF1724]" : "bg-[#F0E4E7]"}`}
                      />
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => buildPlan("prevent")}
                  className="inline-flex items-center justify-center rounded-full bg-[#FF1724] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,23,36,0.28)] transition hover:bg-[#D90016]"
                >
                  Build My Plan <span aria-hidden="true" className="ml-1">→</span>
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {PREVENT_ACTIONS.map((action) => (
                <PreventCard
                  key={action.id}
                  action={action}
                  checked={preventPicked.includes(action.id)}
                  matched={Boolean(matched?.prevent.includes(action.id))}
                  onToggle={() => toggle("prevent", action.id)}
                />
              ))}
            </div>
          </article>

          <article
            id="living-plan"
            className={`rounded-[28px] border bg-white p-4 shadow-[0_16px_40px_rgba(255,23,36,0.06)] sm:p-5 ${
              path === "living" ? "border-[#FF1724]" : "border-[#F6D5D8]"
            }`}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF0F2] text-[#FF1724]">
                  <Heart size={22} />
                </span>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">My Heart Health Plan</h3>
                  <p className="text-sm text-[#667085]">Tools and support for people with heart disease.</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-[210px]">
                  <p className="text-xs text-[#667085]">
                    Progress: <span className="font-semibold text-[#FF1724]">{livingPicked.length} of {LIVING_ACTIONS.length}</span> actions completed
                  </p>
                  <div className="mt-2 flex gap-1" aria-hidden="true">
                    {LIVING_ACTIONS.map((action, index) => (
                      <span
                        key={action.id}
                        className={`h-1.5 flex-1 rounded-full ${index < livingPicked.length ? "bg-[#FF1724]" : "bg-[#F0E4E7]"}`}
                      />
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => buildPlan("living")}
                  className="inline-flex items-center justify-center rounded-full bg-[#FF1724] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,23,36,0.28)] transition hover:bg-[#D90016]"
                >
                  Build My Plan <span aria-hidden="true" className="ml-1">→</span>
                </button>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {LIVING_ACTIONS.map((action) => (
                <PreventCard
                  key={action.id}
                  action={action}
                  checked={livingPicked.includes(action.id)}
                  matched={Boolean(matched?.living.includes(action.id))}
                  onToggle={() => toggle("living", action.id)}
                />
              ))}
            </div>
            <p className="mt-4 rounded-2xl border border-[#FF1724] bg-[#FFF0F2] px-3 py-3 text-xs font-medium leading-relaxed text-[#101014]">
              Chest pressure, sudden shortness of breath, fainting, or pain in the arm, neck, or jaw: call emergency services. Do not drive yourself.
            </p>
          </article>
        </div>

        <p className="mt-5 flex items-center justify-center gap-2 text-center text-sm text-[#667085]" role="status">
          <Shield size={15} className="text-[#FF1724]" aria-hidden="true" />
          {hint || "Educational guidance only. Not a diagnosis or emergency service."}
        </p>

        <AnimatePresence>
          {planFor && planChosen.length > 0 ? (
            <motion.section
              initial={reduce ? undefined : { opacity: 0, y: 12 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: 12 }}
              className="mt-6 overflow-hidden rounded-[32px] border border-[#F0E4E7] bg-white shadow-[0_24px_60px_rgba(16,16,20,0.08)]"
              aria-label={planFor === "prevent" ? "Your prevention plan" : "Your heart health plan"}
            >
              <div className="flex flex-col gap-4 border-b border-[#F0E4E7] px-5 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] text-[#FF1724]">
                    {prediction ? "BUILT FROM YOUR RESULT" : "YOUR PLAN"}
                  </p>
                  <h3 className="mt-2 text-4xl font-semibold leading-none tracking-tight sm:text-5xl">
                    {planFor === "prevent" ? "Your prevention plan." : "Your heart health plan."}
                  </h3>
                </div>
                <p className="text-5xl font-semibold leading-none tracking-tight">
                  {planChosen.length}
                  <span className="ml-2 text-base font-medium text-[#667085]">steps</span>
                </p>
              </div>
              <ol>
                {planChosen.map((action, index) => {
                  const Icon = ICONS[action.id as keyof typeof ICONS];
                  return (
                    <motion.li
                      key={action.id}
                      initial={reduce ? undefined : { opacity: 0, x: -8 }}
                      animate={reduce ? undefined : { opacity: 1, x: 0 }}
                      transition={{ delay: reduce ? 0 : index * 0.06 }}
                      className="flex items-start gap-4 border-b border-[#F6D5D8] px-5 py-5 last:border-b-0 sm:gap-6 sm:px-8"
                    >
                      <span className="w-10 shrink-0 text-2xl font-semibold tabular-nums text-[#FF1724]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FF1724] text-white">
                        <Icon size={20} />
                      </span>
                      <span className="min-w-0 pt-0.5">
                        <span className="block text-lg font-semibold tracking-tight">{action.title}</span>
                        <span className="mt-1 block text-sm leading-relaxed text-[#667085]">{action.detail}</span>
                      </span>
                    </motion.li>
                  );
                })}
              </ol>
              <div className="border-t border-[#F0E4E7] px-5 py-6 sm:px-8">
                <p className="text-sm text-[#667085]">Turn the checked steps into a 30-day challenge. The score does not start it for you.</p>
                <StartChallengeButton />
              </div>
            </motion.section>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}

function PathPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-[#FF1724] text-white shadow-[0_8px_20px_rgba(255,23,36,0.28)]"
          : "border border-[#F6D5D8] bg-white text-[#101014] hover:border-[#FF1724]"
      }`}
    >
      <Heart size={16} className={active ? "text-white" : "text-[#FF1724]"} aria-hidden="true" />
      {children}
    </button>
  );
}

function PreventCard({
  action,
  checked,
  matched,
  onToggle,
}: {
  action: PreventionAction;
  checked: boolean;
  matched: boolean;
  onToggle: () => void;
}) {
  const Icon = ICONS[action.id as keyof typeof ICONS];
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={onToggle}
      className={`relative flex h-full flex-col items-center rounded-2xl border px-2 py-4 text-center transition duration-200 hover:-translate-y-0.5 motion-reduce:transform-none ${
        checked ? "border-[#FF1724] bg-[#FFF5F6]" : "border-[#F3E4E6] bg-white hover:border-[#FF1724]/40"
      }`}
    >
      <span
        className={`absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-md border ${
          checked ? "border-[#FF1724] bg-[#FF1724] text-white" : "border-[#E4D5D8] bg-white text-transparent"
        }`}
        aria-hidden="true"
      >
        <Check size={12} strokeWidth={3} />
      </span>
      <span className="mt-2 text-[#FF1724]">
        <Icon size={28} strokeWidth={1.75} />
      </span>
      <span className="mt-3 block text-sm font-semibold leading-tight">{action.title}</span>
      <span className="mt-1 block text-[11px] leading-snug text-[#667085]">{action.text}</span>
      {matched ? <span className="mt-2 text-[10px] font-bold tracking-wide text-[#FF1724]">FROM YOUR RESULT</span> : null}
    </button>
  );
}

