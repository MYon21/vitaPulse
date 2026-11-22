"use client";

import { useState } from "react";
import { RiskFactorsChart } from "@/components/evidence/RiskFactorsChart";
import { evidenceBars } from "@/lib/evidenceData";

export function RiskFactorBoard() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const activeId = hoveredId ?? selectedId;
  const active = evidenceBars.find((bar) => bar.id === activeId) ?? null;

  function select(id: string) {
    setSelectedId((current) => (current === id ? null : id));
  }

  return (
    <>
      <RiskFactorsChart activeId={activeId} onSelect={select} onHover={setHoveredId} />
      <p className="min-h-6 text-sm text-[#667085]" aria-live="polite">
        {active ? `${active.label}: ${active.value}%. ${active.definition} ${active.source}.` : "Hover or select a factor to read its definition."}
      </p>
      <table className="mt-2 w-full text-left text-sm">
        <caption className="sr-only">Published shares behind the chart. Select a row to highlight that factor.</caption>
        <thead className="text-xs uppercase tracking-wide text-[#98A2B3]">
          <tr>
            <th className="py-2 font-medium">Measure</th>
            <th className="py-2 font-medium">Share</th>
            <th className="py-2 font-medium">Definition</th>
          </tr>
        </thead>
        <tbody>
          {evidenceBars.map((bar) => {
            const selected = bar.id === activeId;
            return (
              <tr
                key={bar.id}
                className={`border-t border-[#F0E4E7] ${selected ? "bg-[#FFF0F2]" : ""}`}
                onMouseEnter={() => setHoveredId(bar.id)}
                onMouseLeave={() => setHoveredId((current) => (current === bar.id ? null : current))}
              >
                <td className="py-2 pr-3">
                  <button
                    type="button"
                    className="rounded-md px-1 py-1 text-left hover:text-[#FF1724] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF1724]"
                    aria-pressed={bar.id === selectedId}
                    onClick={() => select(bar.id)}
                    onFocus={() => setHoveredId(bar.id)}
                    onBlur={() => setHoveredId((current) => (current === bar.id ? null : current))}
                  >
                    {bar.label}
                  </button>
                </td>
                <td className="py-2 pr-3 font-semibold text-[#FF1724]">{bar.value}%</td>
                <td className="py-2 text-[#667085]">
                  {bar.definition} {bar.source}.
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
