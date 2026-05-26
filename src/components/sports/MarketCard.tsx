import { Layers, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeagueBadge } from "./LeagueBadge";
import { OutcomePill } from "./OutcomePill";
import { CountdownPill } from "./CountdownPill";

export interface MarketCardProps {
  league: "epl" | "laliga" | "ucl" | "seriea" | "nba";
  question: string;
  /** Two outcomes. For team-vs-team markets, label = team name; for neutral, "Yes" / "No". */
  outcomes: [
    { label: string; probability: number },
    { label: string; probability: number },
  ];
  volume: string;
  endsIn: string;
  /** Open Interest — total notional value of open positions. */
  openInterest?: string;
  status?: "live" | "upcoming";
  selected?: "yes" | "no" | null;
  onSelect?: (tone: "yes" | "no") => void;
  className?: string;
}

export function MarketCard({
  league,
  question,
  outcomes,
  volume,
  endsIn,
  openInterest,
  status = "upcoming",
  selected = null,
  onSelect,
  className,
}: MarketCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-card transition-all hover:bg-surface-elevated hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <LeagueBadge league={league} />
        <CountdownPill value={endsIn} tone={status === "live" ? "live" : "muted"} />
      </div>

      <h3 className="mt-4 font-display font-semibold text-base leading-snug text-foreground line-clamp-2 min-h-[2.75rem]">
        {question}
      </h3>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <OutcomePill
          label={outcomes[0].label}
          probability={outcomes[0].probability}
          tone="yes"
          selected={selected === "yes"}
          onClick={() => onSelect?.("yes")}
        />
        <OutcomePill
          label={outcomes[1].label}
          probability={outcomes[1].probability}
          tone="no"
          selected={selected === "no"}
          onClick={() => onSelect?.("no")}
        />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11px] font-mono text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-3 w-3" />
          <span>Vol {volume}</span>
        </div>
        {openInterest && (
          <div className="flex items-center gap-1.5">
            <Layers className="h-3 w-3" />
            <span className="tabular-nums">OI {openInterest}</span>
          </div>
        )}
      </div>
    </div>
  );
}