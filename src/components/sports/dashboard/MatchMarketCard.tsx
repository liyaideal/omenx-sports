import { Clock, MoreHorizontal, Users } from "lucide-react";
import type { SportsMarket, TeamLite } from "@/data/sports-markets";
import { PricePill } from "./PricePill";

/**
 * Featured match market — replaces the old FanPollCard. Two crests, a
 * 3-way 1X2 outcome list (or 2-way for binary), each outcome shows price
 * and routes into the OmenX trade screen.
 */
export function MatchMarketCard({ market }: { market: SportsMarket }) {
  if (!market.fixture) return null;
  const { home, away, whenLabel, kickoff } = market.fixture;
  const total = market.outcomes.reduce((s, o) => s + o.price, 0) || 1;
  return (
    <article className="relative overflow-hidden rounded-3xl border border-border bg-surface p-5 shadow-card">
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(60%_100%_at_50%_100%,oklch(0.7_0.28_340/0.18),transparent_70%)]" />

      <header className="relative flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-gradient-neon text-[8px] font-bold text-primary-foreground">L</span>
          {market.league.short}
        </span>
        <button aria-label="More" className="text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </header>

      <h3 className="relative mt-3 font-display text-lg font-semibold text-foreground">{market.title}</h3>

      <div className="relative mt-5 flex items-center justify-center gap-4">
        <CrestBubble team={home} />
        <div className="flex flex-col items-center gap-1">
          <span className="font-serif-display italic text-xl text-muted-foreground">vs</span>
          <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {whenLabel}
            <br />
            at {kickoff}
          </span>
        </div>
        <CrestBubble team={away} />
      </div>

      <a href={market.tradeHref} className="relative mt-5 block space-y-2">
        {market.outcomes.map((o) => (
          <OutcomeRow key={o.id} label={o.label} price={o.price} delta={o.delta24h} pct={(o.price / total) * 100} team={o.team} />
        ))}
      </a>

      <footer className="relative mt-5 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {market.endsLabel}</span>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {market.participants.toLocaleString()}</span>
          <span className="text-foreground">Vol {market.volume}</span>
        </div>
      </footer>
    </article>
  );
}

function CrestBubble({ team }: { team: TeamLite }) {
  return (
    <div
      className="grid h-20 w-20 place-items-center rounded-full bg-white/[0.05] p-2 ring-1 ring-white/10"
      style={{ boxShadow: `0 0 30px -6px oklch(0.7 0.22 ${team.hue} / 0.55)` }}
    >
      <img src={team.logo} alt={team.name} className="h-full w-full object-contain" />
    </div>
  );
}

function OutcomeRow({
  label,
  price,
  delta,
  pct,
  team,
}: {
  label: string;
  price: number;
  delta?: number;
  pct: number;
  team?: TeamLite;
}) {
  const hue = team?.hue ?? 305;
  return (
    <div className="flex items-center gap-3">
      {team ? (
        <img src={team.logo} alt="" className="h-5 w-5 shrink-0 object-contain" />
      ) : (
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/[0.06] font-mono text-[10px] text-muted-foreground">X</span>
      )}
      <div className="relative h-8 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${Math.max(pct, 8)}%`,
            backgroundImage: `linear-gradient(90deg, oklch(0.55 0.18 ${hue} / 0.85), oklch(0.7 0.22 ${hue} / 0.95))`,
          }}
        />
        <div className="relative flex h-full items-center justify-between px-3">
          <span className="font-mono text-[11px] font-semibold text-foreground/95">{label}</span>
        </div>
      </div>
      <PricePill price={price} delta={delta} size="sm" />
    </div>
  );
}