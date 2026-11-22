"use client";

import { ChallengeDashboard } from "@/components/challenge/ChallengeDashboard";
import { ChallengeSetup } from "@/components/challenge/ChallengeSetup";
import { StartChallengeButton } from "@/components/challenge/StartChallengeButton";
import { useAppSelector } from "@/store/hooks";

export function ChallengeSection() {
  const open = useAppSelector((state) => state.challenge.setupOpen);
  const active = useAppSelector((state) => state.challenge.active);
  return (
    <section id="challenge" className="bg-white px-5 py-16 text-[#101014]">
      <div className="mx-auto max-w-7xl">
        {!active && !open ? (
          <div id="health-trends">
            <p className="text-xs font-bold tracking-[0.16em] text-[#FF1724]">MY HEALTH TRENDS</p>
            <h2 className="mt-2 text-4xl font-semibold tracking-tight">No measurement history is stored yet.</h2>
            <p className="mt-3 max-w-2xl text-[#667085]">This app has no account, no device connection, and no clinic record feed. Readings you add during a challenge stay in this browser session and update the comparison immediately. They are not written to a medical record.</p>
            <p className="mt-3 font-semibold">No previous measurements available. Start tracking today.</p>
            <StartChallengeButton />
          </div>
        ) : null}
        {open ? <ChallengeSetup /> : null}
        {active ? <ChallengeDashboard /> : null}
      </div>
    </section>
  );
}
