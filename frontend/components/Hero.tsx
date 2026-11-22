import { HeartCanvas } from "@/components/HeartCanvas";

export function Hero() {
  return (
    <section className="hero" id="signal">
      <div className="viewport">
        <HeartCanvas />
      </div>
      <div className="hero-copy">
        <p className="spine">VitaPulse / heart disease prediction</p>
        <p className="eyebrow">
          <span className="eyebrow-rule" />
          System 01 — cardiovascular risk
        </p>
        <h1 className="hero-title">
          <span>Heart risk.</span>
          <span className="hero-em">Read early.</span>
        </h1>
        <p className="lede">
          Six measures in. One heart-disease prediction out. Sex, age, blood
          pressure, blood sugar, alcohol status, and drug use.
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="/assess">
            Try it
            <Arrow />
          </a>
          <a className="btn btn-ghost" href="#method">
            See how it works
          </a>
        </div>
        <ul className="hero-foot">
          <li>
            <span>01</span> Six inputs
          </li>
          <li>
            <span>02</span> One model
          </li>
          <li>
            <span>03</span> A risk band
          </li>
        </ul>
      </div>
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
