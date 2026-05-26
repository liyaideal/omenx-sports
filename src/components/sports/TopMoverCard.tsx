import { cn } from "@/lib/utils";
import { LeagueBadge } from "./LeagueBadge";
import { CountdownPill } from "./CountdownPill";
import { TeamCrest } from "./TeamCrest";
import type { Team } from "@/lib/teams";

export interface TopMoverCardProps {
  league: "epl" | "laliga" | "ucl" | "seriea" | "nba";
  question: string;
  yes: { team?: Team; label?: string; probability: number; delta24h?: number };
  no: { team?: Team; label?: string };
  volume: string;
  endsIn: string;
  openInterest?: string;
  status?: "live" | "upcoming";
  href?: string;
  className?: string;
}

/**
 * Bento-only compact mover card. Mirrors the reference layout: league + countdown
 * pills on top, 2-line question, two circular price bubbles (yes/no), sparkline,
 * Vol/OI footer. Designed to fit 3-up inside a ~520px center column.
 */
export function TopMoverCard({
  league,
  question,
  yes,
  no,
  volume,
  endsIn,
  openInterest,
  status = "live",
  href = "#",
  className,
}: TopMoverCardProps) {
  const yesPct = yes.probability;
  const noPct = Math.max(0, Math.min(100, 100 - yesPct));
  const yesDelta = yes.delta24h ?? 0;
  const noDelta = -yesDelta;
  const spark = buildSpark(question, yesPct, yesDelta);
  const stroke = yesDelta >= 0 ? "var(--win)" : "var(--loss)";

  return (
    <a
      href={href}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-card transition-all hover:-translate-y-0.5 hover:bg-surface-elevated",
        className,
      )}
    >
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

      <h3 className="mt-3 font-display font-semibold text-[15px] leading-snug text-foreground line-clamp-2 min-h-[2.5rem]">
        {question}
      </h3>

      <div className="mt-3 flex items-center justify-center gap-3">
        <PriceBubble side={yes} pct={yesPct} delta={yesDelta} tone="yes" />
        <PriceBubble side={no} pct={noPct} delta={noDelta} tone="no" />
      </div>

      <div className="mt-3 h-8 w-full">
        <Sparkline points={spark} stroke={stroke} />
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-border pt-2 text-[10px] font-mono text-muted-foreground">
        <span>Vol {volume}</span>
        {openInterest && <span className="tabular-nums">OI {openInterest}</span>}
      </div>
    </a>
  );
}

function PriceBubble({
  side,
  pct,
  delta,
  tone,
}: {
  side: { team?: Team; label?: string };
  pct: number;
  delta: number;
  tone: "yes" | "no";
}) {
  const ringColor = tone === "yes" ? "var(--win)" : "var(--loss)";
  const deltaColor = delta >= 0 ? "text-win" : "text-loss";
  const sign = delta >= 0 ? "+" : "";
  return (
    <div className="flex flex-col items-center">
      <div
        className="relative grid h-[68px] w-[68px] place-items-center rounded-full bg-surface-elevated"
        style={{ boxShadow: `0 0 0 1.5px ${ringColor}, 0 0 18px -4px ${ringColor}` }}
      >
        {side.team ? (
          <TeamCrest name={side.team.name} abbr={side.team.short} logoUrl={side.team.logo} size="sm" />
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {side.label?.[0] ?? "•"}
          </span>
        )}
        <div className="absolute -bottom-1 right-0 rounded-md bg-surface px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums text-foreground ring-1 ring-border">
          {pct}¢
        </div>
      </div>
      <div className={cn("mt-2 font-mono text-[10px] tabular-nums", deltaColor)}>
        {sign}
        {delta.toFixed(1)}¢
      </div>
    </div>
  );
}

function Sparkline({ points, stroke }: { points: number[]; stroke: string }) {
  if (points.length < 2) return null;
  const w = 100;
  const h = 32;
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
  const N = 14;
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