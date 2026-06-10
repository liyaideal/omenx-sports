import { ArrowUpRight } from "lucide-react";

/**
 * OmenX bridge strip — sits at the bottom of the sports zone and nudges
 * the user back to the OmenX portfolio with their current personal
 * trading state. Stateless / presentational so the playground can render
 * many variants side by side.
 */
export function BridgeStrip({
  openPositions,
  pnlToday,
  portfolioHref,
  headline = "Made a call? Cash it in.",
}: {
  openPositions: number;
  /** Signed string, e.g. "+$142.20" or "-$12.40" or "$0.00". */
  pnlToday: string;
  /** @deprecated retained for backward-compatible call sites; not rendered. */
  toClaim?: string;
  portfolioHref: string;
  headline?: string;
}) {
  const trimmed = pnlToday.trim();
  const pnlUp = trimmed.startsWith("+");
  const pnlDown = trimmed.startsWith("-") || trimmed.startsWith("−");
  const pnlTone = pnlUp ? "text-win" : pnlDown ? "text-loss" : "text-muted-foreground";
  const pnlArrow = pnlUp ? "↑" : pnlDown ? "↓" : "·";
  return (
    <div className="border-t border-border px-6 py-4 md:px-8">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="font-display text-base font-medium text-foreground">
            {headline}
          </span>
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/70 shadow-[0_0_6px_var(--primary)]" />
              {openPositions} open
            </span>
            <span className="text-border">·</span>
            <span className={`inline-flex items-center gap-1 ${pnlTone}`}>
              {pnlToday} today {pnlArrow}
            </span>
          </span>
        </div>
        <a
          href={portfolioHref}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-4 py-1.5 text-xs font-semibold text-foreground ring-1 ring-primary/30 transition hover:bg-primary/20"
        >
          Open Portfolio <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}