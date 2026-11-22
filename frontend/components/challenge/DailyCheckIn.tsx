"use client";

import { HabitCard } from "@/components/challenge/HabitCard";
import { formatLong } from "@/lib/challenge/dates";
import type { ActiveChallenge } from "@/lib/challenge/types";

export function DailyCheckIn({ challenge, date }: { challenge: ActiveChallenge; date: string }) {
  return (
    <div>
      <h3 className="text-xl font-semibold">Check-in for {formatLong(date)}</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {challenge.habits.map((habit) => (
          <HabitCard key={`${habit.id}-${date}`} habit={habit} date={date} check={challenge.checks[date]?.[habit.id]} />
        ))}
      </div>
    </div>
  );
}
