import type { StandingRow } from "@/data/sports-mock";

interface LeagueTableCardProps {
  league: string;
  rows: StandingRow[];
}

export function LeagueTableCard({ league, rows }: LeagueTableCardProps) {
  return (
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-card">
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 pb-3 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
        <span className="text-foreground">{league}</span>
        <span className="w-6 text-right">P</span>
        <span className="w-6 text-right">W</span>
        <span className="w-6 text-right">O</span>
        <span className="w-8 text-right">L</span>
      </div>
      <div className="flex flex-col divide-y divide-white/[0.04]">
        {rows.map((r) => (
          <div key={r.team.short} className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 py-2.5">
            <div className="flex items-center gap-2.5">
              <div
                className="grid h-7 w-7 place-items-center rounded-full bg-white/[0.05] p-0.5"
                style={{ boxShadow: `0 0 14px -4px oklch(0.7 0.22 ${r.team.hue} / 0.55)` }}
              >
                <img src={r.team.logo} alt="" className="h-full w-full object-contain" />
              </div>
              <span className="text-sm font-medium text-foreground">{r.team.name}</span>
            </div>
            <span className="w-6 text-right font-mono text-sm tabular-nums text-foreground">{r.played}</span>
            <span className="w-6 text-right font-mono text-sm tabular-nums text-foreground">{r.wins}</span>
            <span className="w-6 text-right font-mono text-sm tabular-nums text-muted-foreground">{r.draws}</span>
            <span className="w-8 text-right font-mono text-sm font-semibold tabular-nums text-foreground">{r.losses}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
