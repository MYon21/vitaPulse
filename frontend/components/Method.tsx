"use client";

import { useAppSelector } from "@/store/hooks";
import type { Step } from "@/store/landingSlice";

const FACTORS = [
  "Sex",
  "Age",
  "Blood pressure",
  "Blood sugar",
  "Alcohol status",
  "Drug use",
];

export function Method() {
  const steps = useAppSelector((state) => state.landing.steps);
  const revealed = useAppSelector((state) => state.landing.revealed.method);

  return (
    <section id="method" className={revealed ? "section is-in" : "section"}>
      <div className="wrap">
        <div className="section-head">
          <p className="kicker">02 — Method</p>
          <div className="section-head-row">
            <h2>Three steps from signals to a prediction.</h2>
            <p>
              A reading uses only what a person can know: who they are, how they
              live, and two measures from a checkup. Nothing here is a diagnosis.
            </p>
          </div>
        </div>
        <ul className="factors">
          {FACTORS.map((factor) => (
            <li key={factor}>{factor}</li>
          ))}
        </ul>
        <div className="steps">
          {steps.map((step) => (
            <article className="step" key={step.id}>
              <Panel step={step} />
              <div className="step-copy">
                <p className="step-index">{step.index}</p>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                <ul className="tags">
                  {step.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
        <div className="method-cta">
          <a className="btn btn-primary" href="/assess">
            Try a reading
          </a>
        </div>
      </div>
    </section>
  );
}

function Panel({ step }: { step: Step }) {
  if (step.panel === "profile") {
    const rows = [
      { label: "Age", value: "54", width: "72%" },
      { label: "Sex", value: "Female", width: "48%" },
      { label: "Alcohol", value: "Occasional", width: "61%" },
      { label: "Drug use", value: "None", width: "24%" },
    ];
    return (
      <div className="panel" aria-hidden="true">
        <div className="panel-top">
          <span>Example profile</span>
          <span className="rec">Input</span>
        </div>
        <ul className="rows">
          {rows.map((row, index) => (
            <li key={row.label}>
              <span>{row.label}</span>
              <span className="track">
                <i style={{ width: row.width }} />
              </span>
              <em>{row.value}</em>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (step.panel === "vitals") {
    return (
      <div className="panel" aria-hidden="true">
        <div className="panel-top">
          <span>Example entry</span>
          <span className="rec">Vitals</span>
        </div>
        <div className="vital-grid">
          <p>
            <small>Blood pressure</small>
            <strong>
              128<span>/82</span>
            </strong>
            <em>mmHg</em>
          </p>
          <p>
            <small>Blood sugar</small>
            <strong>104</strong>
            <em>mg/dL</em>
          </p>
        </div>
        <svg className="trace" viewBox="0 0 280 46" preserveAspectRatio="none">
          <path d="M0 28 H46 l6-8 8 16 10-26 8 28 8-10 H280" />
        </svg>
      </div>
    );
  }

  return (
    <div className="panel" aria-hidden="true">
      <div className="panel-top">
        <span>Sample reading</span>
        <span className="rec">Output</span>
      </div>
      <div className="result">
        <svg viewBox="0 0 120 68" className="dial">
          <path d="M14 58 A46 46 0 0 1 106 58" pathLength={1} className="dial-track" />
          <path d="M14 58 A46 46 0 0 1 106 58" pathLength={1} className="dial-value" />
        </svg>
        <div>
          <small>Illustrative band</small>
          <strong>Moderate</strong>
          <em>Not a personal result</em>
        </div>
      </div>
    </div>
  );
}
