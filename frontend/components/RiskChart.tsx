"use client";

import { useState } from "react";
import { useAppSelector } from "@/store/hooks";

const PLOT_W = 680;
const PLOT_H = 280;
const MAX = 40;

export function RiskChart() {
  const points = useAppSelector((state) => state.landing.chart);
  const title = useAppSelector((state) => state.landing.chartTitle);
  const note = useAppSelector((state) => state.landing.chartNote);
  const revealed = useAppSelector((state) => state.landing.revealed.evidence);
  const [active, setActive] = useState<number | null>(null);

  const step = PLOT_W / (points.length - 1);
  const coords = points.map((point, index) => ({
    ...point,
    x: index * step,
    y: (1 - point.value / MAX) * PLOT_H,
  }));
  const line = coords
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${PLOT_W} ${PLOT_H} L0 ${PLOT_H} Z`;
  const ticks = [0, 10, 20, 30, 40];
  const current = active !== null ? coords[active] : null;
  const peak = points[points.length - 1];

  return (
    <figure className="chart-panel">
      <figcaption className="chart-head">
        <div>
          <p className="kicker">Age pattern</p>
          <h3>{title}</h3>
          <p>{note}</p>
        </div>
        <div className="chart-aside">
          <p className="legend">
            <span />
            Percent of adults
          </p>
          <p className="peak">
            <strong>{peak.value}%</strong>
            <span>by age {peak.label}</span>
          </p>
        </div>
      </figcaption>
      <div className="plot-row">
        <div className="y-labels" aria-hidden="true">
          {ticks.map((tick) => (
            <span key={tick} style={{ top: `${(1 - tick / MAX) * 100}%` }}>
              {tick}
            </span>
          ))}
        </div>
        <div className="plot-svg">
          <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} role="group" aria-label={title}>
            <defs>
              <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff1a1a" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#ff1a1a" stopOpacity="0.04" />
              </linearGradient>
            </defs>
            {ticks.map((tick) => {
              const y = (1 - tick / MAX) * PLOT_H;
              return <line key={tick} x1={0} x2={PLOT_W} y1={y} y2={y} className="grid" />;
            })}
            <path d={area} fill="url(#riskFill)" className={revealed ? "area is-drawn" : "area"} />
            {current && (
              <line x1={current.x} x2={current.x} y1={0} y2={PLOT_H} className="cursor" />
            )}
            <path d={line} pathLength={1} className={revealed ? "series is-drawn" : "series"} />
            {coords.map((point, index) => (
              <g key={point.label}>
                <rect
                  x={index === 0 ? 0 : point.x - step / 2}
                  y={0}
                  width={index === 0 || index === coords.length - 1 ? step / 2 : step}
                  height={PLOT_H}
                  className="hit"
                  onMouseEnter={() => setActive(index)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(index)}
                  onBlur={() => setActive(null)}
                  tabIndex={0}
                  role="img"
                  aria-label={`${point.label} years: ${point.value} percent of adults`}
                />
                <circle cx={point.x} cy={point.y} r={active === index ? 6 : 4} className="node" />
              </g>
            ))}
          </svg>
          {current && (
            <div
              className="tip"
              style={{
                left: `${(current.x / PLOT_W) * 100}%`,
                top: `${(current.y / PLOT_H) * 100}%`,
              }}
            >
              <strong>{current.label}</strong>
              <span>{current.value}% of adults</span>
            </div>
          )}
        </div>
      </div>
      <div className="x-labels" aria-hidden="true">
        {coords.map((point) => (
          <span key={point.label} style={{ left: `${(point.x / PLOT_W) * 100}%` }}>
            {point.label}
          </span>
        ))}
      </div>
    </figure>
  );
}
