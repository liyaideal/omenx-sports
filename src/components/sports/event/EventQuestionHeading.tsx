import { Clock } from "lucide-react";
import { LeagueBadge } from "@/components/sports/LeagueBadge";
import type { SportsMarket } from "@/data/sports-markets";

/** Map a SportsMarket kind to a default human-readable label for the
 *  event header. Markets can override via `kindLabel`. */
export function getMarketKindLabel(market: SportsMarket): string {
  if (market.kindLabel) return market.kindLabel;
  switch (market.kind) {
    case "league-winner":
      return "Tournament winner";
    case "top-scorer":
      return "Top scorer";
    case "player-prop":
      return "Player prop";
    case "match":
      return "Match";
    default:
      return "Market";
  }
}

/** Resolve a free-form league short label (e.g. "EPL", "WC", "La Liga") to
 *  a LeagueBadge preset key. Falls back to "epl" so the badge always renders. */
function leagueKeyFromShort(short: string) {
  const s = short.replace(/\s+/g, "").toLowerCase();
  if (s === "epl" || s === "premierleague") return "epl" as const;
  if (s === "laliga") return "laliga" as const;
  if (s === "ucl" || s === "championsleague") return "ucl" as const;
  if (s === "seriea") return "seriea" as const;
  if (s === "mls") return "mls" as const;
  if (s === "nba") return "nba" as const;
  if (s === "wc" || s === "worldcup" || s === "worldcup2026") return "wc" as const;
  return "epl" as const;
}

/**
 * Left-aligned text-first heading for events that don't have a two-team
 * fixture (tournament winners, top-scorer races, group winners, prop
 * questions). Designed to look right even when the outcomes can't be
 * mapped to a crest — the event itself is the visual anchor, not its
 * markets.
 */
export function EventQuestionHeading({ market }: { market: SportsMarket }) {
  return (
    <div className="flex min-h-[176px] flex-1 flex-col justify-center px-8 py-8 md:px-12 md:py-10">
      <div className="flex items-center gap-2.5">
        <LeagueBadge league={leagueKeyFromShort(market.league.short)} size="sm" showLabel={false} />
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
          {market.league.name}
        </span>
        <span aria-hidden className="text-muted-foreground/40">·</span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
          {getMarketKindLabel(market)}
        </span>
      </div>

      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        {market.title}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3 w-3" />
          {market.endsLabel}
        </span>
        <span aria-hidden className="text-muted-foreground/40">·</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-win opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-win shadow-[0_0_8px_currentColor]" />
          </span>
          <span className="uppercase tracking-[0.18em] text-foreground/80">Open</span>
        </span>
      </div>
    </div>
  );
}