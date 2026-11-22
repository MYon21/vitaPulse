"use client";

import { ArrowDown, ArrowRight } from "lucide-react";

export function StepConnector({ active }: { active: boolean }) {
  const color = active ? "text-[#FF1724]" : "text-[#E7C9CE]";
  return (
    <div className={`flex items-center justify-center ${color}`} aria-hidden="true">
      <ArrowDown className="lg:hidden" size={22} />
      <ArrowRight className="hidden lg:block" size={22} />
    </div>
  );
}
