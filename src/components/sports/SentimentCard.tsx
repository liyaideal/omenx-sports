import { cn } from "@/lib/utils";
import { TeamCrest } from "./TeamCrest";
import { LeagueBadge } from "./LeagueBadge";
import { RatioBar } from "./RatioBar";

export interface SentimentCardProps {
  league: "epl" | "laliga" | "ucl" | "seriea" | "nba";
  question: string;
  home: string;
  away: string;
  kickoff: string;
  /** Notional on YES contracts (USDC). Derived from real open positions. */
  yesNotional: number;
  /** Notional on NO contracts (USDC). Derived from real open positions. */
  noNotional: number;
  openInterest: string;
  oiDelta24h?: number; // % change
  className?: string;
}

function fmtUSDC(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toFixed(0);
}

/**
 * SentimentCard — shows the Yes/No money split for a market. Not social,
 * not voting; the bar reflects real position notional from the orderbook.
 */
export function SentimentCard({
  league,
  question,
  home,
  away,
  kickoff,
  yesNotional,
  noNotional,
  openInterest,
  oiDelta24h,
  className,
}: SentimentCardProps) {
  const total = yesNotional + noNotional || 1;
  const yesPct = Math.round((yesNotional / total) * 100);
  const positive = (oiDelta24h ?? 0) >= 0;
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-card",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <LeagueBadge league={league} />
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Sentiment
        </span>
      </div>

      <h3 className="mt-3 font-display font-semibold text-base leading-snug text-foreground">
        {question}
      </h3>

      <div className="mt-4 flex items-center justify-center gap-6">
        <TeamCrest name={home} size="lg" />
        <div className="text-center">
          <div className="font-serif-display italic text-xl text-muted-foreground">vs</div>
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {kickoff}
          </div>
        </div>
        <TeamCrest name={away} size="lg" />
      </div>

      <div className="mt-5">
        <RatioBar
          value={yesPct}
          leftTone="win"
          rightTone="loss"
          leftLabel={`Yes $${fmtUSDC(yesNotional)}`}
          rightLabel={`No $${fmtUSDC(noNotional)}`}
        />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11px] font-mono text-muted-foreground">
        <span>OI {openInterest}</span>
        {oiDelta24h !== undefined && (
          <span className={cn("tabular-nums", positive ? "text-win" : "text-loss")}>
            24h {positive ? "+" : ""}
            {oiDelta24h}%
          </span>
        )}
      </div>
    </div>
  );
}