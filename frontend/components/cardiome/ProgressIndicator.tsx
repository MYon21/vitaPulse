export function ProgressIndicator({
  done = false,
  label,
  filled,
  total,
}: {
  done?: boolean;
  label: string;
  filled?: number;
  total?: number;
}) {
  const counted = filled != null && total != null && total > 0;
  const complete = counted ? filled >= total : done;
  const width = counted ? Math.max(0, Math.min(100, (filled / total) * 100)) : complete ? 100 : 0;
  const status = counted ? (complete ? "Complete" : `${filled}/${total}`) : complete ? "Complete" : "Needed";

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.12em] text-[#667085]">
        <span>{label}</span>
        <span>{status}</span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-[#F6E7EA]">
        <div className="h-full rounded-full bg-[#FF1724] transition-all duration-500 motion-reduce:transition-none" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
