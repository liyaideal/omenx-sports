import { Layers, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeagueBadge } from "./LeagueBadge";
import { OutcomePill } from "./OutcomePill";
import { CountdownPill } from "./CountdownPill";
import type { Team } from "@/lib/teams";

export interface MarketCardProps {
  league: "epl" | "laliga" | "ucl" | "seriea" | "nba";
  question: string;
  /**
   * Every market is a single Yes/No binary. Team-vs-team events alias the two
   * sides via `sideLabels: { yes, no }`. Price and delta are always mirrored
   * (`p(No) = 100 − p(Yes)`, `delta(No) = −delta(Yes)`), so the card only
   * accepts the YES side's truth and renders NO automatically.
   */
  yes: { team?: Team; label?: string; probability: number; delta24h?: number };
  no: { team?: Team; label?: string };
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
  yes,
  no,
  volume,
  endsIn,
  openInterest,
  status = "upcoming",
  selected = null,
  onSelect,
  className,
}: MarketCardProps) {
  const yesProbability = yes.probability;
  const noProbability = Math.max(0, Math.min(100, 100 - yesProbability));
  const yesDelta = yes.delta24h;
  const noDelta = yesDelta === undefined ? undefined : -yesDelta;
  // Deterministic mock 24h sparkline derived from question + current prob.
  // Replace with real series once the markets API is wired.
  const spark = buildSpark(question, yesProbability, yesDelta ?? 0);
  const sparkStroke =
    yesDelta === undefined
      ? "var(--muted-foreground)"
      : yesDelta >= 0
      ? "var(--win)"
      : "var(--loss)";
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-card transition-all hover:bg-surface-elevated hover:-translate-y-0.5",
        className,
      )}
    >
      {/* Hover underline — hints "tradable" */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-neon opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="flex items-center justify-between">
        <LeagueBadge league={league} />
        <div className="flex items-center gap-1.5">
          {status === "live" && (
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-loss/70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-loss" />
            </span>
          )}
          <CountdownPill value={endsIn} tone={status === "live" ? "live" : "muted"} />
        </div>
      </div>

      <h3 className="mt-4 font-display font-semibold text-base leading-snug text-foreground line-clamp-2 min-h-[2.75rem]">
        {question}
      </h3>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <OutcomePill
          team={yes.team}
          label={yes.label}
          probability={yesProbability}
          delta24h={yesDelta}
          tone="yes"
          selected={selected === "yes"}
          onClick={() => onSelect?.("yes")}
        />
        <OutcomePill
          team={no.team}
          label={no.label}
          probability={noProbability}
          delta24h={noDelta}
          tone="no"
          selected={selected === "no"}
          onClick={() => onSelect?.("no")}
        />
      </div>

      {/* Mini 24h sparkline — communicates "this market is moving" */}
      <div className="mt-3 h-6 w-full">
        <Sparkline points={spark} stroke={sparkStroke} />
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-border pt-3 text-[11px] font-mono text-muted-foreground">
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

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline({ points, stroke }: { points: number[]; stroke: string }) {
  if (points.length < 2) return null;
  const w = 100;
  const h = 24;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const path = points
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-full w-full">
      <path d={path} fill="none" stroke={stroke} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function buildSpark(seed: string, end: number, delta: number): number[] {
  // Tiny deterministic PRNG so the sparkline is stable per market.
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 1000) / 1000;
  };
  const N = 12;
  const start = end - delta;
  const out: number[] = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const trend = start + (end - start) * t;
    const jitter = (rand() - 0.5) * 4;
    out.push(trend + jitter);
  }
  out[N - 1] = end;
  return out;
}