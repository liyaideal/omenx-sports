import type { ReactNode } from "react";

/**
 * Page-level section header used by the homepage and homepage playground.
 * Title + italic accent, optional live dot, optional account-stat inline,
 * and an optional right slot.
 */
export function PageSectionHeader({
  title,
  accent,
  right,
  stats,
  live,
  as: As = "h2",
}: {
  title: string;
  accent?: string;
  right?: ReactNode;
  stats?: { positions: number; pnl: string };
  live?: boolean;
  as?: "h1" | "h2";
}) {
  const pnlUp = stats?.pnl.trim().startsWith("+");
  const pnlTone = stats ? (pnlUp ? "text-win" : "text-loss") : "";
  return (
    <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-5 gap-y-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <As className="inline-flex items-center gap-2.5 font-display text-2xl font-semibold leading-9">
          {live && (
            <span
              aria-label="Live"
              className="h-2 w-2 animate-pulse rounded-full bg-[oklch(0.7_0.22_25)] shadow-[0_0_8px_oklch(0.7_0.22_25)]"
            />
          )}
          <span>
            {title}
            {accent && (
              <span className="font-serif-display italic text-neon"> {accent}</span>
            )}
          </span>
        </As>
        {stats && (
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/70 shadow-[0_0_6px_var(--primary)]" />
              {stats.positions} open
            </span>
            <span className="text-border">·</span>
            <span className={`inline-flex items-center gap-1 ${pnlTone}`}>
              {stats.pnl} today {pnlUp ? "↑" : "↓"}
            </span>
          </span>
        )}
      </div>
      {right}
    </div>
  );
}