import { Clock, Users } from "lucide-react";
import type { Outcome, SportsMarket, TeamLite } from "@/data/sports-markets";
import { PricePill } from "./PricePill";
import { LeagueChip } from "../LeagueBadge";

/**
 * Universal event market tile — supports two OmenX market shapes:
 *   • three-way (soccer 1X2: home / draw / away)
 *   • binary    (two-team A/B, or single-market YES/NO)
 *
 * Layout adapts to outcome count and presence of a fixture. Designed to
 * sit in a wide grid (2-3 tiles per row at lg+).
 */
export function EventMarketTileCard({ market }: { market: SportsMarket }) {
  const hasFixture = Boolean(market.fixture);
  const isBinary = market.shape === "binary";
  return (
    <a
      href={market.tradeHref}
      className="group flex h-full flex-col gap-4 rounded-3xl border border-border bg-surface p-5 shadow-card transition hover:border-white/15"
    >
      <header className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2">
          <LeagueChip short={market.league.short} />
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">· EVENT</span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {market.shape === "three-way" ? "1 · X · 2" : "YES / NO"}
        </span>
      </header>

      {hasFixture ? (
        <div className="flex items-center justify-between gap-3">
          <TeamSide team={market.fixture!.home} align="left" />
          <span className="font-serif-display italic text-base text-muted-foreground">vs</span>
          <TeamSide team={market.fixture!.away} align="right" />
        </div>
      ) : (
        <h3 className="font-display text-base font-semibold leading-tight text-foreground">
          {market.title}
        </h3>
      )}

      {isBinary ? (
        <div className="grid flex-1 grid-cols-2 gap-2">
          {market.outcomes.map((o) => (
            <OutcomeBlock key={o.id} outcome={o} />
          ))}
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-1.5">
          {market.outcomes.map((o) => (
            <OutcomeRow key={o.id} outcome={o} />
          ))}
        </div>
      )}

      <footer className="mt-auto flex items-center justify-between border-t border-border pt-3 text-[11px] font-mono text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><Clock className="h-3 w-3" /> {market.endsLabel}</span>
        <span className="inline-flex items-center gap-3">
          <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {market.participants.toLocaleString()}</span>
          <span className="text-foreground">Vol {market.volume}</span>
        </span>
      </footer>
    </a>
  );
}

function OutcomeBlock({ outcome }: { outcome: Outcome }) {
  const isYes = outcome.label.toUpperCase() === "YES";
  const isNo = outcome.label.toUpperCase() === "NO";
  const cents = Math.round(outcome.price * 100);
  const delta = outcome.delta24h ?? 0;
  const deltaPts = Math.round(delta * 100);
  const deltaUp = deltaPts > 0;
  const deltaDown = deltaPts < 0;
  return (
    <div className="flex h-full flex-col justify-between gap-3 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.05] transition group-hover:bg-white/[0.06]">
      <div className="flex min-w-0 items-center gap-2">
        {outcome.team ? (
          <img src={outcome.team.logo} alt="" className="h-5 w-5 shrink-0 object-contain" />
        ) : (
          <span
            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full font-mono text-[9px] font-bold ${
              isYes
                ? "bg-[oklch(0.78_0.18_155_/_0.18)] text-[oklch(0.78_0.18_155)]"
                : isNo
                  ? "bg-[oklch(0.7_0.22_25_/_0.18)] text-[oklch(0.7_0.22_25)]"
                  : "bg-white/[0.06] text-muted-foreground"
            }`}
          >
            {isYes ? "Y" : isNo ? "N" : "·"}
          </span>
        )}
        <span className="truncate text-xs font-medium text-muted-foreground">
          {outcome.team?.name ?? outcome.label}
        </span>
      </div>
      <div className="font-display text-3xl font-semibold leading-none text-foreground">
        {cents}<span className="text-lg text-muted-foreground">¢</span>
      </div>
      <div
        title="24h change"
        className={`font-mono text-[11px] ${
          deltaUp
            ? "text-[oklch(0.78_0.18_155)]"
            : deltaDown
              ? "text-[oklch(0.7_0.22_25)]"
              : "text-muted-foreground"
        }`}
      >
        {deltaUp ? "↗" : deltaDown ? "↘" : "·"}{" "}
        {deltaUp ? `+${deltaPts}¢` : deltaDown ? `−${Math.abs(deltaPts)}¢` : "0¢"}
        <span className="text-muted-foreground"> · 24h</span>
      </div>
    </div>
  );
}

function OutcomeRow({ outcome }: { outcome: Outcome }) {
  const isDraw = !outcome.team && (outcome.label === "Draw" || outcome.meta === "X");
  const isYes = outcome.label.toUpperCase() === "YES";
  const isNo = outcome.label.toUpperCase() === "NO";
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2 ring-1 ring-white/[0.05] transition group-hover:bg-white/[0.06]">
      <div className="flex min-w-0 items-center gap-2">
        {outcome.team ? (
          <img src={outcome.team.logo} alt="" className="h-5 w-5 shrink-0 object-contain" />
        ) : isDraw ? (
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/[0.06] font-mono text-[10px] text-muted-foreground">X</span>
        ) : (
          <span
            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full font-mono text-[9px] font-bold ${
              isYes
                ? "bg-[oklch(0.78_0.18_155_/_0.18)] text-[oklch(0.78_0.18_155)]"
                : isNo
                  ? "bg-[oklch(0.7_0.22_25_/_0.18)] text-[oklch(0.7_0.22_25)]"
                  : "bg-white/[0.06] text-muted-foreground"
            }`}
          >
            {isYes ? "Y" : isNo ? "N" : "·"}
          </span>
        )}
        <span className="truncate text-sm font-medium text-foreground">
          {outcome.team?.name ?? outcome.label}
        </span>
      </div>
      <PricePill price={outcome.price} delta={outcome.delta24h} size="md" />
    </div>
  );
}

function TeamSide({ team, align }: { team: TeamLite; align: "left" | "right" }) {
  return (
    <div className={`flex min-w-0 flex-1 items-center gap-2 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
      <div
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/[0.05] p-1 ring-1 ring-white/10"
        style={{ boxShadow: `0 0 16px -4px oklch(0.7 0.22 ${team.hue} / 0.55)` }}
      >
        <img src={team.logo} alt={team.name} className="h-full w-full object-contain" />
      </div>
      <span className="truncate text-xs font-medium text-foreground">{team.short}</span>
    </div>
  );
}