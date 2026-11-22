import { buildInsights } from "@/lib/challenge/insights";
import type { ActiveChallenge } from "@/lib/challenge/types";

export function ChallengeInsights({ challenge, today }: { challenge: ActiveChallenge; today: string }) {
  const insights = buildInsights(challenge, today);
  return (
    <div>
      <h3 className="text-2xl font-semibold">What the records support</h3>
      <div className="mt-3 grid gap-3">
        {insights.map((insight) => (
          <article key={insight.id} className="rounded-2xl border border-[#F0E4E7] p-4">
            <p className="font-semibold">{insight.text}</p>
            <p className="mt-2 text-sm text-[#667085]">{insight.explanation}</p>
            <p className="mt-2 text-xs text-[#667085]">Period: {insight.period}. Source: {insight.source}</p>
            <p className="mt-2 text-sm">{insight.next}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
