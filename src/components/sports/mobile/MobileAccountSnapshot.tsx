import { ArrowUpRight } from "lucide-react";

/**
 * Mobile equivalent of the desktop BridgeStrip — the 3 personal numbers
 * (open positions / today P&L / to claim) shown as a tappable card that
 * hands off to the OmenX portfolio.
 */
export function MobileAccountSnapshot({
  openPositions,
  pnlToday,
  toClaim,
  portfolioHref,
}: {
  openPositions: number;
  pnlToday: string;
  toClaim: string;
  portfolioHref: string;
}) {
  const trimmed = pnlToday.trim();
  const pnlUp = trimmed.startsWith("+");
  const pnlDown = trimmed.startsWith("-") || trimmed.startsWith("−");
  const pnlTone = pnlUp
    ? "text-win"
    : pnlDown
      ? "text-loss"
      : "text-foreground";

  const stats: Array<{ label: string; value: string; tone?: string }> = [
    { label: "Open", value: String(openPositions) },
    { label: "Today", value: pnlToday, tone: pnlTone },
    { label: "To claim", value: toClaim },
  ];

  return (
    <a
      href={portfolioHref}
      className="block rounded-2xl border border-border bg-surface p-4 shadow-card transition active:scale-[0.99]"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Your portfolio
        </span>
        <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-primary">
          Open <ArrowUpRight className="h-3 w-3" />
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-background/40 px-3 py-2.5 ring-1 ring-border"
          >
            <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              {s.label}
            </div>
            <div
              className={`mt-0.5 font-display text-base font-semibold tabular-nums ${s.tone ?? "text-foreground"}`}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </a>
  );
}