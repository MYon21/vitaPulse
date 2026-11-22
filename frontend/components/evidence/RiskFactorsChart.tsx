"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { evidenceBars, type EvidenceBar } from "@/lib/evidenceData";

type TickProps = {
  x?: string | number;
  y?: string | number;
  payload?: { value?: string };
  onSelect?: (id: string) => void;
};

function FactorTick({ x = 0, y = 0, payload, onSelect }: TickProps) {
  const label = payload?.value ?? "";
  const left = Number(x);
  const top = Number(y);
  const bar = evidenceBars.find((item) => item.label === label);
  const lines = label.length > 16 ? [label.slice(0, label.lastIndexOf(" ")), label.slice(label.lastIndexOf(" ") + 1)] : [label];

  return (
    <g transform={`translate(${left},${top})`}>
      <text
        textAnchor="end"
        fill="#667085"
        fontSize={12}
        style={{ cursor: "pointer" }}
        onClick={() => {
          if (bar) onSelect?.(bar.id);
        }}
      >
        {lines.map((line, index) => (
          <tspan key={line} x={0} dy={index === 0 ? (lines.length > 1 ? -7 : 4) : 14}>
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

function FactorTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: EvidenceBar }>;
}) {
  const bar = payload?.[0]?.payload;
  if (!active || !bar) return null;

  return (
    <div className="max-w-[240px] rounded-xl border border-[#F0E4E7] bg-white px-3 py-2 shadow-[0_10px_30px_rgba(16,16,20,0.08)]">
      <p className="text-sm font-semibold text-[#101014]">{bar.label}</p>
      <p className="text-sm font-semibold text-[#FF1724]">{bar.value}%</p>
      <p className="mt-1 text-xs leading-relaxed text-[#667085]">{bar.definition}</p>
    </div>
  );
}

export function RiskFactorsChart({
  activeId,
  onSelect,
  onHover,
}: {
  activeId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  return (
    <div className="h-[28rem] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={evidenceBars} layout="vertical" margin={{ top: 8, right: 28, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="riskBar" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FF8A93" />
              <stop offset="100%" stopColor="#FF1724" />
            </linearGradient>
            <linearGradient id="riskBarSoft" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#FFE4E7" />
              <stop offset="100%" stopColor="#FFB3BA" />
            </linearGradient>
          </defs>
          <XAxis type="number" domain={[0, 50]} tickFormatter={(value) => `${value}%`} stroke="#98A2B3" fontSize={12} />
          <YAxis
            type="category"
            dataKey="label"
            width={132}
            stroke="#667085"
            tickLine={false}
            axisLine={false}
            tick={(props: TickProps) => <FactorTick {...props} onSelect={onSelect} />}
          />
          <Tooltip cursor={{ fill: "rgba(255, 23, 36, 0.04)" }} content={<FactorTooltip />} />
          <Bar
            dataKey="value"
            radius={[0, 10, 10, 0]}
            barSize={16}
            style={{ cursor: "pointer" }}
            activeBar={{ stroke: "#D90016", strokeWidth: 1 }}
            onMouseEnter={(bar: { id?: string; payload?: { id?: string } }) => {
              const id = bar.payload?.id ?? bar.id;
              if (id) onHover(id);
            }}
            onMouseLeave={() => onHover(null)}
            onClick={(bar: { id?: string; payload?: { id?: string } }) => {
              const id = bar.payload?.id ?? bar.id;
              if (id) onSelect(id);
            }}
          >
            {evidenceBars.map((bar) => (
              <Cell key={bar.id} fill={activeId && activeId !== bar.id ? "url(#riskBarSoft)" : "url(#riskBar)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
