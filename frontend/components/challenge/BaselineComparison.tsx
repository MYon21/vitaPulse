"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { comparisonRows, seriesFor, type CompareWindow } from "@/lib/challenge/comparisons";
import { addDays } from "@/lib/challenge/dates";
import { dayMark } from "@/lib/challenge/streaks";
import type { ActiveChallenge, MeasurementKind } from "@/lib/challenge/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setChart, setCompareWindow } from "@/store/challengeSlice";

const WINDOWS: CompareWindow[] = [7, 14, 30, 90];

export function BaselineComparison({ challenge, today }: { challenge: ActiveChallenge; today: string }) {
  const dispatch = useAppDispatch();
  const windowDays = useAppSelector((state) => state.challenge.compareWindow);
  const chart = useAppSelector((state) => state.challenge.chart);
  const rows = comparisonRows(challenge, today, windowDays);
  const updated = [...challenge.measurements].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt)).at(-1)?.recordedAt;
  const data = chart === "adherence"
    ? Array.from({ length: 30 }, (_, index) => {
        const date = addDays(challenge.startedOn, index);
        const mark = dayMark(challenge, date, today);
        return { date: date.slice(5), value: mark === "complete" ? 100 : mark === "partial" ? 50 : mark === "upcoming" || mark === "outside" ? null : 0 };
      })
    : seriesFor(challenge, chart as MeasurementKind).map((point) => ({ date: point.date.slice(5), value: point.value, value2: point.value2, context: point.context, source: point.source }));

  return (
    <div id="health-trends">
      <h3 className="text-2xl font-semibold">Then vs. Now</h3>
      <p className="mt-1 text-sm text-[#667085]">A change here is a difference between recorded numbers. It is not proof that heart-disease risk went down. Chart updated {updated ? new Date(updated).toLocaleString() : "when a reading is saved"}.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {WINDOWS.map((days) => (
          <button key={days} type="button" aria-pressed={windowDays === days} onClick={() => dispatch(setCompareWindow(days))} className={`rounded-full px-3 py-1 text-sm font-semibold ${windowDays === days ? "bg-[#FF1724] text-white" : "bg-[#FFF0F2]"}`}>
            {days} days
          </button>
        ))}
      </div>
      {challenge.baseline.emptyMessage && rows.length === 0 ? <p className="mt-4 font-semibold">{challenge.baseline.emptyMessage}</p> : null}
      {rows.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="text-[#667085]">
                <th className="py-2">Measurement</th>
                <th>Baseline</th>
                <th>Current</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-[#F0E4E7]">
                  <td className="py-3 font-semibold">{row.label}</td>
                  <td>{row.baseline}</td>
                  <td>{row.current}</td>
                  <td>{row.change}<span className="mt-1 block text-xs text-[#667085]">{row.note}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {(["blood_pressure", "glucose", "weight", "sleep", "activity", "adherence"] as const).map((item) => (
          <button key={item} type="button" aria-pressed={chart === item} onClick={() => dispatch(setChart(item))} className={`rounded-full px-3 py-1 text-sm ${chart === item ? "bg-[#101014] text-white" : "bg-[#FFF0F2]"}`}>
            {item === "blood_pressure" ? "Blood pressure" : item === "adherence" ? "Daily adherence" : item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>
      <div className="mt-3 h-56">
        {data.length === 0 ? <p className="text-sm text-[#667085]">No readings for this chart yet.</p> : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="#F0E4E7" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#FF1724" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} name={chart === "blood_pressure" ? "Systolic" : "Value"} />
              {chart === "blood_pressure" ? <Line type="monotone" dataKey="value2" stroke="#101014" strokeWidth={2} dot={{ r: 3 }} name="Diastolic" /> : null}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
