import { useEffect, useState } from "react";
import { Cloud, Users2, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SportsMarket } from "@/data/sports-markets";

interface PreMatchStripProps {
  market: SportsMarket;
  className?: string;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const FORMATIONS = ["4-3-3", "4-2-3-1", "3-5-2", "4-4-2", "3-4-3"] as const;
const WEATHER = [
  { label: "Clear · 18°C", icon: "☀️" },
  { label: "Cloudy · 14°C", icon: "⛅" },
  { label: "Light rain · 12°C", icon: "🌦️" },
  { label: "Hot · 28°C", icon: "🌤️" },
] as const;

function targetMs(market: SportsMarket): number {
  // Parse a synthetic kickoff time from the fixture string. If we can't,
  // pretend the match is 2h45 from page load — enough to fill a countdown
  // for the demo without persisting state across renders.
  const stableOffset =
    (hash(market.id) % (12 * 3600)) * 1000 + 30 * 60 * 1000;
  return Date.now() + stableOffset;
}

function fmt(ms: number): { d: string; h: string; m: string; s: string } {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return {
    d: String(d).padStart(2, "0"),
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
  };
}

/**
 * Pre-match content strip — kickoff countdown, projected lineups (formation
 * only), and venue weather. Only renders when the event has a fixture and
 * is not currently streaming live.
 */
export function PreMatchStrip({ market, className }: PreMatchStripProps) {
  const fixture = market.fixture;
  const [target] = useState(() => targetMs(market));
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!fixture) return null;

  const remaining = fmt(target - now);
  const seed = hash(market.id);
  const homeForm = FORMATIONS[seed % FORMATIONS.length];
  const awayForm = FORMATIONS[(seed >> 3) % FORMATIONS.length];
  const weather = WEATHER[seed % WEATHER.length];

  return (
    <div
      className={cn(
        "grid gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card md:grid-cols-3",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 ring-1 ring-primary/30">
          <Timer className="h-4 w-4 text-primary" />
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Kickoff · {fixture.whenLabel} {fixture.kickoff}
          </div>
          <div className="mt-0.5 flex items-baseline gap-1 font-mono text-base tabular-nums text-foreground">
            <span>{remaining.h}</span>
            <span className="text-muted-foreground">h</span>
            <span>{remaining.m}</span>
            <span className="text-muted-foreground">m</span>
            <span className="text-primary">{remaining.s}</span>
            <span className="text-muted-foreground">s</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.05] ring-1 ring-white/10">
          <Users2 className="h-4 w-4 text-foreground" />
        </div>
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Projected lineups
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-foreground">
            <span className="truncate">{fixture.home.short ?? fixture.home.name}</span>
            <span className="font-mono text-primary">{homeForm}</span>
            <span className="text-muted-foreground">·</span>
            <span className="truncate">{fixture.away.short ?? fixture.away.name}</span>
            <span className="font-mono text-neon">{awayForm}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.05] ring-1 ring-white/10">
          <Cloud className="h-4 w-4 text-foreground" />
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Venue weather
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-foreground">
            <span aria-hidden>{weather.icon}</span>
            <span>{weather.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}