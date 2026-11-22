"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Alcohol, DrugUse, ReadingInput, Sex } from "@/lib/assess";
import { Monitor } from "@/components/Monitor";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetReading, runReading } from "@/store/readingSlice";

type Draft = {
  sex: "" | Sex;
  age: string;
  systolic: string;
  diastolic: string;
  sugar: string;
  alcohol: "" | Alcohol;
  drugUse: "" | DrugUse;
};

type Errors = Partial<Record<keyof Draft, string>>;

const EMPTY: Draft = {
  sex: "",
  age: "",
  systolic: "",
  diastolic: "",
  sugar: "",
  alcohol: "",
  drugUse: "",
};

function integer(raw: string) {
  const value = raw.trim();
  if (!/^\d{1,3}$/.test(value)) return null;
  return Number(value);
}

function parseDraft(draft: Draft): { ok: true; value: ReadingInput } | { ok: false; errors: Errors } {
  const errors: Errors = {};
  if (draft.sex !== "female" && draft.sex !== "male") errors.sex = "Choose a sex.";

  const age = integer(draft.age);
  if (age === null || age < 18 || age > 100) errors.age = "Enter an age from 18 to 100.";

  const systolic = integer(draft.systolic);
  if (systolic === null || systolic < 70 || systolic > 250) {
    errors.systolic = "Enter a systolic pressure from 70 to 250.";
  }

  const diastolic = integer(draft.diastolic);
  if (diastolic === null || diastolic < 40 || diastolic > 150) {
    errors.diastolic = "Enter a diastolic pressure from 40 to 150.";
  } else if (systolic !== null && diastolic >= systolic) {
    errors.diastolic = "Diastolic pressure has to sit below systolic.";
  }

  const sugar = integer(draft.sugar);
  if (sugar === null || sugar < 40 || sugar > 400) errors.sugar = "Enter a blood sugar from 40 to 400 mg/dL.";

  if (draft.alcohol !== "none" && draft.alcohol !== "occasional" && draft.alcohol !== "regular") {
    errors.alcohol = "Choose an alcohol status.";
  }
  if (draft.drugUse !== "none" && draft.drugUse !== "former" && draft.drugUse !== "current") {
    errors.drugUse = "Choose a drug-use status.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      sex: draft.sex as Sex,
      age: age as number,
      systolic: systolic as number,
      diastolic: diastolic as number,
      sugar: sugar as number,
      alcohol: draft.alcohol as Alcohol,
      drugUse: draft.drugUse as DrugUse,
    },
  };
}

export function Assess() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.reading.status);
  const result = useAppSelector((state) => state.reading.result);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [shown, setShown] = useState(0);
  const stageRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const baseId = useId();

  useEffect(() => {
    if (status === "idle") return;
    const section = document.getElementById("reading");
    if (!section) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = section.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top: Math.max(0, top), behavior: reduce ? "auto" : "smooth" });
  }, [status]);

  useEffect(() => {
    if (status !== "ready" || !result) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(result.percent);
      return;
    }
    const target = result.percent;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 700);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [status, result]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (status === "reading") return;
    const parsed = parseDraft(draft);
    if (!parsed.ok) {
      setErrors(parsed.errors);
      const key = Object.keys(parsed.errors)[0];
      const node = formRef.current?.querySelector<HTMLElement>(`[data-field="${key}"]`);
      node?.focus();
      return;
    }
    setErrors({});
    dispatch(runReading(parsed.value));
  };

  return (
    <section className="assess" id="reading">
      <form className="assess-form" ref={formRef} onSubmit={onSubmit} noValidate>
        <p className="spine">VitaPulse / try a reading</p>
        <p className="eyebrow">
          <span className="eyebrow-rule" />
          System 02 — six signals
        </p>
        <h1 className="assess-title">
          Enter the
          <span> six measures.</span>
        </h1>
        <p className="lede">
          Sex, age, blood pressure, blood sugar, alcohol status, and drug use. The percent that
          comes back is a simulated preview, not a diagnosis.
        </p>

        <fieldset className={errors.sex ? "is-bad" : ""}>
          <legend>Sex</legend>
          <div className="segment">
            {(
              [
                ["female", "Female"],
                ["male", "Male"],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className={draft.sex === value ? "is-on" : ""}>
                <input
                  type="radio"
                  name={`${baseId}-sex`}
                  value={value}
                  checked={draft.sex === value}
                  data-field={value === "female" ? "sex" : undefined}
                  onChange={() => set("sex", value)}
                />
                {label}
              </label>
            ))}
          </div>
          {errors.sex ? <small>{errors.sex}</small> : null}
        </fieldset>

        <div className="field-row">
          <label className={errors.age ? "field is-bad" : "field"}>
            <span>Age</span>
            <span className="field-control">
              <input
                inputMode="numeric"
                autoComplete="off"
                value={draft.age}
                data-field="age"
                aria-invalid={errors.age ? true : undefined}
                onChange={(event) => set("age", event.target.value)}
              />
              <em>Years</em>
            </span>
            {errors.age ? <small>{errors.age}</small> : null}
          </label>
          <label className={errors.sugar ? "field is-bad" : "field"}>
            <span>Blood sugar</span>
            <span className="field-control">
              <input
                inputMode="numeric"
                autoComplete="off"
                value={draft.sugar}
                data-field="sugar"
                aria-invalid={errors.sugar ? true : undefined}
                onChange={(event) => set("sugar", event.target.value)}
              />
              <em>mg/dL</em>
            </span>
            {errors.sugar ? <small>{errors.sugar}</small> : null}
          </label>
        </div>

        <div className="field-row">
          <label className={errors.systolic ? "field is-bad" : "field"}>
            <span>Systolic</span>
            <span className="field-control">
              <input
                inputMode="numeric"
                autoComplete="off"
                value={draft.systolic}
                data-field="systolic"
                aria-invalid={errors.systolic ? true : undefined}
                onChange={(event) => set("systolic", event.target.value)}
              />
              <em>mmHg</em>
            </span>
            {errors.systolic ? <small>{errors.systolic}</small> : null}
          </label>
          <label className={errors.diastolic ? "field is-bad" : "field"}>
            <span>Diastolic</span>
            <span className="field-control">
              <input
                inputMode="numeric"
                autoComplete="off"
                value={draft.diastolic}
                data-field="diastolic"
                aria-invalid={errors.diastolic ? true : undefined}
                onChange={(event) => set("diastolic", event.target.value)}
              />
              <em>mmHg</em>
            </span>
            {errors.diastolic ? <small>{errors.diastolic}</small> : null}
          </label>
        </div>

        <fieldset className={errors.alcohol ? "is-bad" : ""}>
          <legend>Alcohol status</legend>
          <div className="segment">
            {(
              [
                ["none", "None"],
                ["occasional", "Occasional"],
                ["regular", "Regular"],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className={draft.alcohol === value ? "is-on" : ""}>
                <input
                  type="radio"
                  name={`${baseId}-alcohol`}
                  value={value}
                  checked={draft.alcohol === value}
                  data-field={value === "none" ? "alcohol" : undefined}
                  onChange={() => set("alcohol", value)}
                />
                {label}
              </label>
            ))}
          </div>
          {errors.alcohol ? <small>{errors.alcohol}</small> : null}
        </fieldset>

        <fieldset className={errors.drugUse ? "is-bad" : ""}>
          <legend>Drug use</legend>
          <div className="segment">
            {(
              [
                ["none", "None"],
                ["former", "Former"],
                ["current", "Current"],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className={draft.drugUse === value ? "is-on" : ""}>
                <input
                  type="radio"
                  name={`${baseId}-drug`}
                  value={value}
                  checked={draft.drugUse === value}
                  data-field={value === "none" ? "drugUse" : undefined}
                  onChange={() => set("drugUse", value)}
                />
                {label}
              </label>
            ))}
          </div>
          <p className="field-note">Status only. This preview does not ask which substance.</p>
          {errors.drugUse ? <small>{errors.drugUse}</small> : null}
        </fieldset>

        <div className="assess-actions">
          <button className="btn btn-primary" type="submit" disabled={status === "reading"}>
            {status === "reading" ? "Reading" : "Get the chance"}
            <Arrow />
          </button>
          {status === "ready" ? (
            <button className="btn btn-ghost" type="button" onClick={() => dispatch(resetReading())}>
              Clear result
            </button>
          ) : null}
        </div>
        <p className="assess-note">
          The number is calculated from these six entries inside the preview. It is not a medical
          device and it does not provide a diagnosis.
        </p>
      </form>

      <aside className="stage" ref={stageRef} aria-live="polite">
        {status === "reading" ? (
          <div className="stage-read">
            <p className="stage-kicker">Reading</p>
            <Monitor live />
            <p>Scoring the six signals.</p>
          </div>
        ) : status === "ready" && result ? (
          <div className="stage-result">
            <p className="stage-kicker">Simulated chance</p>
            <p className="chance">
              <span>{shown}</span>
              <small>%</small>
            </p>
            <p className="band">
              {result.band} · {result.level}/10
            </p>
            <p className="stage-copy">1 is the best end of this demo scale. 10 is the worst.</p>
            <p className="stage-copy">
              Heart-disease chance for this pattern in the preview model.
            </p>
            <ul className="notes">
              {result.notes.length > 0 ? (
                result.notes.map((note) => <li key={note}>{note}</li>)
              ) : (
                <li>None of the six signals pushed this preview into a higher band.</li>
              )}
            </ul>
            <p className="stage-foot">Not a diagnosis. Take a real concern to a clinician.</p>
          </div>
        ) : (
          <div className="stage-idle">
            <p className="stage-kicker">Waiting</p>
            <Monitor live={false} />
            <p>The chance appears here after the six measures are read.</p>
          </div>
        )}
      </aside>
    </section>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="arrow">
      <path d="M2 8h12M9 3.5 13.5 8 9 12.5" />
    </svg>
  );
}
