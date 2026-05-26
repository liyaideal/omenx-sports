import { ArrowUpRight } from "lucide-react";
import { LeagueBadge } from "./LeagueBadge";
import { TeamCrest } from "./TeamCrest";
import type { Team } from "@/lib/teams";

interface HeroMarketCardProps {
  league: "epl" | "laliga" | "ucl" | "seriea" | "nba";
  home: Team;
  away: Team;
  /** Live score, e.g. "1 – 0" */
  score: string;
  /** Live minute, e.g. "67'" */
  minute: string;
  /** Settlement countdown, e.g. "47m" */
  endsIn: string;
  /** YES (home) probability 0–100 */
  yesProbability: number;
  /** YES 24h delta in percentage points */
  yesDelta: number;
  /** Where the Buy buttons jump to. */
  href: string;
}

/**
 * Hero-sized live market card — the first thing a visitor's eye lands on.
 * Mirrors the binary contract from MarketCard but expanded with score, live
 * minute, sparkline, and two explicit Buy CTAs so the homepage opens with
 * an actionable price instead of brand decoration.
 */
export function HeroMarketCard({
  league,
  home,
  away,
  score,
  minute,
  endsIn,
  yesProbability,
  yesDelta,
  href,
}: HeroMarketCardProps) {
  const noProbability = Math.max(0, Math.min(100, 100 - yesProbability));
  const noDelta = -yesDelta;
  const spark = buildSpark(`${home.id}-${away.id}`, yesProbability, yesDelta);

  return (
    <div className="relative w-[340px] overflow-hidden rounded-3xl border border-border bg-surface p-5 shadow-card ring-1 ring-neon/15">
      {/* Soft ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full opacity-40 blur-3xl"
        style={{ backgroundImage: "radial-gradient(circle, var(--neon) 0%, transparent 60%)" }}
      />

      {/* Header: league + live + countdown */}
      <div className="relative flex items-center justify-between">
        <LeagueBadge league={league} />
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-loss/15 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-loss">
            <span className="relative inline-flex h-1.5 w-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-loss/70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-loss" />
            </span>
            Live
          </span>
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-mono tabular-nums text-muted-foreground">
            {endsIn}
          </span>
        </div>
      </div>

      {/* Score row */}
      <div className="relative mt-5 flex items-center justify-between">
        <div className="flex flex-col items-center gap-1.5">
          <TeamCrest name={home.name} abbr={home.short} logoUrl={home.logo} size="md" />
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {home.short}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="font-display font-bold text-3xl tabular-nums">{score}</div>
          <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-loss">
            {minute}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <TeamCrest name={away.name} abbr={away.short} logoUrl={away.logo} size="md" />
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {away.short}
          </div>
        </div>
      </div>

      {/* Sparkline */}
      <div className="relative mt-4 h-10">
        <Sparkline points={spark} stroke={yesDelta >= 0 ? "var(--win)" : "var(--loss)"} />
      </div>

      {/* Price row */}
      <div className="relative mt-3 flex items-baseline justify-between font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        <span>{home.short} to win</span>
        <span className={yesDelta >= 0 ? "text-win" : "text-loss"}>
          {yesDelta >= 0 ? "+" : ""}
          {yesDelta.toFixed(1)}% 24h
        </span>
      </div>

      {/* Buy buttons */}
      <div className="relative mt-3 grid grid-cols-2 gap-2">
        <a
          href={href}
          className="group flex items-center justify-between rounded-xl border border-win/30 bg-win/10 px-3 py-3 transition-all hover:bg-win/20 hover:-translate-y-0.5"
        >
          <div className="flex flex-col items-start">
            <span className="font-mono text-[9px] uppercase tracking-wider text-win/80">
              Buy {home.short}
            </span>
            <span className="font-display font-bold text-lg tabular-nums text-win">
              {yesProbability}¢
            </span>
          </div>
          <ArrowUpRight className="h-4 w-4 text-win opacity-60 transition-opacity group-hover:opacity-100" />
        </a>
        <a
          href={href}
          className="group flex items-center justify-between rounded-xl border border-loss/30 bg-loss/10 px-3 py-3 transition-all hover:bg-loss/20 hover:-translate-y-0.5"
        >
          <div className="flex flex-col items-start">
            <span className="font-mono text-[9px] uppercase tracking-wider text-loss/80">
              Buy {away.short}
            </span>
            <span className="font-display font-bold text-lg tabular-nums text-loss">
              {noProbability}¢
            </span>
          </div>
          <ArrowUpRight className="h-4 w-4 text-loss opacity-60 transition-opacity group-hover:opacity-100" />
        </a>
      </div>
      <p className="sr-only">
        NO (away) 24h delta: {noDelta >= 0 ? "+" : ""}
        {noDelta.toFixed(1)}%
      </p>
    </div>
  );
}

function Sparkline({ points, stroke }: { points: number[]; stroke: string }) {
  if (points.length < 2) return null;
  const w = 100;
  const h = 40;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const path = points
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * (h - 6) - 3;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  const area = `${path} L${w} ${h} L0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-full w-full">
      <defs>
        <linearGradient id="hero-spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#hero-spark-fill)" />
      <path d={path} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
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
  const N = 18;
  const start = end - delta;
  const out: number[] = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const trend = start + (end - start) * t;
    const jitter = (rand() - 0.5) * 5;
    out.push(trend + jitter);
  }
  out[N - 1] = end;
  return out;
}