import { ALL_MARKETS, type SportsMarket } from "@/data/sports-markets";

/** Pull every team short that appears anywhere on a market — fixture sides,
 *  subjectTeam, or outcome teams. Used to compute event-to-event relatedness. */
function teamShorts(m: SportsMarket): Set<string> {
  const s = new Set<string>();
  if (m.fixture?.home?.short) s.add(m.fixture.home.short);
  if (m.fixture?.away?.short) s.add(m.fixture.away.short);
  if (m.subjectTeam?.short) s.add(m.subjectTeam.short);
  for (const o of m.outcomes) if (o.team?.short) s.add(o.team.short);
  return s;
}

/**
 * Return other real events from `ALL_MARKETS` that relate to the given one
 * (shared team in fixture / subject / outcomes, or same exact fixture).
 * Excludes the source market itself and any per-team binary stub that is
 * just a row inside a bundled multi-outcome event (those expose
 * `eventMarketId`). Capped at 6 so the chip strip stays scannable.
 * Returns [] when nothing relates — caller hides the module.
 */
export function getRelatedMarkets(market: SportsMarket): SportsMarket[] {
  const ownTeams = teamShorts(market);
  if (ownTeams.size === 0) return [];
  const results: SportsMarket[] = [];
  for (const m of ALL_MARKETS) {
    if (m.id === market.id) continue;
    // Skip bundled per-team Y/N stubs — they navigate back to a parent
    // event we likely already surface, and they read as duplicates.
    if (m.eventMarketId) continue;
    const teams = teamShorts(m);
    let shares = false;
    for (const t of teams) {
      if (ownTeams.has(t)) {
        shares = true;
        break;
      }
    }
    if (shares) results.push(m);
    if (results.length >= 6) break;
  }
  return results;
}