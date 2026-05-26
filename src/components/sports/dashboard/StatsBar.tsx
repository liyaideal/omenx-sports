import { BarChart3, TrendingUp, Wallet } from "lucide-react";

export function StatsBar({
  available,
  openPositions,
  pnlToday,
}: {
  available: string;
  openPositions: number;
  pnlToday: string;
}) {
  const up = pnlToday.trim().startsWith("+");
  return (
    <div className="grid grid-cols-3 divide-x divide-white/[0.06] rounded-2xl border border-border bg-surface/80 backdrop-blur">
      <Stat icon={<Wallet className="h-3.5 w-3.5" />} label="Available" value={available} tone="neon" />
      <Stat icon={<BarChart3 className="h-3.5 w-3.5" />} label="Positions" value={String(openPositions)} />
      <Stat icon={<TrendingUp className="h-3.5 w-3.5" />} label="P&L Today" value={pnlToday} tone={up ? "win" : "loss"} />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "neon" | "win" | "loss";
}) {
  const toneClass =
    tone === "neon"
      ? "text-neon"
      : tone === "win"
        ? "text-[oklch(0.78_0.18_155)]"
        : tone === "loss"
          ? "text-[oklch(0.7_0.22_25)]"
          : "text-foreground";
  return (
    <div className="flex flex-col items-center gap-0.5 px-4 py-3">
      <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className={`font-display text-base font-semibold tabular-nums ${toneClass}`}>{value}</div>
    </div>
  );
}