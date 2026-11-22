import { AnimatedStatCard } from "@/components/evidence/AnimatedStatCard";
import { InsightPanel } from "@/components/evidence/InsightPanel";
import { RiskFactorBoard } from "@/components/evidence/RiskFactorBoard";
import { evidenceNote, evidenceStats } from "@/lib/evidenceData";

export function EvidenceSection() {
  return (
    <section id="evidence" className="mx-auto max-w-6xl px-5 py-20">
      <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.16em] text-[#FF1724]">
        <span className="h-[3px] w-8 rounded-full bg-[#FF1724]" />
        EVIDENCE
      </p>
      <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">The scale of heart disease.</h2>
      <p className="mt-4 max-w-2xl text-[#667085]">
        Understanding the global burden of cardiovascular disease helps explain why prevention and early awareness matter.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {evidenceStats.map((stat) => (
          <AnimatedStatCard key={stat.id} stat={stat} />
        ))}
      </div>
      <div className="mt-8 rounded-[28px] border border-[#F0E4E7] bg-white p-5 shadow-[0_18px_50px_rgba(16,16,20,0.04)] lg:grid lg:grid-cols-[1.3fr_0.7fr] lg:gap-8 lg:p-8">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold">Key risk factors in U.S. adults</h3>
          <p className="mt-1 max-w-xl text-sm text-[#667085]">{evidenceNote}</p>
          <RiskFactorBoard />
        </div>
        <InsightPanel />
      </div>
    </section>
  );
}
