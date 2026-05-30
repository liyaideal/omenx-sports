import type { SportsMarket } from "@/data/sports-markets";
import { LeagueChip } from "@/components/sports/LeagueBadge";
import { useTradeDrawer } from "@/components/sports/trade/TradeDrawerProvider";

/**
 * Polymarket-style YES/NO gauge card for a single binary question. The
 * gauge is a horizontal bar split by the YES probability; below it sit
 * two pill buttons (BUY YES / BUY NO) deep-linking to /event/$id.
 *
 * The component normalises the two outcomes to YES (first) / NO (second).
 * Markets that aren't truly yes-no (e.g. "A beats B") still render — the
 * first outcome takes the "YES" slot, second takes "NO".
 */
export function BinaryQuestionCard({ market }: { market: SportsMarket }) {
  const [yes, no] = market.outcomes;
  const { openTrade } = useTradeDrawer();
  if (!yes || !no) return null;
  const yesPct = Math.round(yes.price * 100);
  const noPct = 100 - yesPct;

  return (
    <section className="flex h-full flex-col rounded-2xl border border-border bg-surface p-4 shadow-card">
      <header className="flex items-center gap-2 pb-3">
        <LeagueChip short={market.league.short} />
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          · {market.endsLabel}
        </span>
      </header>

      <h3 className="font-display text-sm font-semibold leading-snug text-foreground">
        {market.title}
      </h3>

      {/* gauge */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-widest">
          <span className="text-[oklch(0.78_0.18_155)]">{yes.label} {yesPct}¢</span>
          <span className="text-[oklch(0.7_0.22_25)]">{no.label} {noPct}¢</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.04] ring-1 ring-white/[0.06]">
          <div
            className="h-full"
            style={{
              width: `${yesPct}%`,
              background:
                "linear-gradient(90deg, oklch(0.78 0.18 155 / 0.95), oklch(0.78 0.18 155 / 0.7))",
              boxShadow: "0 0 14px -2px oklch(0.78 0.18 155 / 0.6)",
            }}
          />
        </div>
      </div>

      {/* buy buttons */}
      <div className="mt-3 grid flex-1 grid-cols-2 items-end gap-2">
        <button
          type="button"
          onClick={() => openTrade({ marketId: market.id, outcomeId: yes.id })}
          className="inline-flex items-center justify-between gap-2 rounded-xl bg-[oklch(0.78_0.18_155_/_0.12)] px-3 py-2 ring-1 ring-[oklch(0.78_0.18_155_/_0.3)] transition hover:bg-[oklch(0.78_0.18_155_/_0.2)]"
        >
          <span className="font-mono text-[10px] uppercase tracking-widest text-[oklch(0.85_0.16_155)]">
            Buy {yes.label}
          </span>
          <span className="font-display text-sm font-semibold text-foreground tabular-nums">
            {yesPct}¢
          </span>
        </button>
        <button
          type="button"
          onClick={() => openTrade({ marketId: market.id, outcomeId: no.id })}
          className="inline-flex items-center justify-between gap-2 rounded-xl bg-[oklch(0.7_0.22_25_/_0.12)] px-3 py-2 ring-1 ring-[oklch(0.7_0.22_25_/_0.3)] transition hover:bg-[oklch(0.7_0.22_25_/_0.2)]"
        >
          <span className="font-mono text-[10px] uppercase tracking-widest text-[oklch(0.82_0.16_25)]">
            Buy {no.label}
          </span>
          <span className="font-display text-sm font-semibold text-foreground tabular-nums">
            {noPct}¢
          </span>
        </button>
      </div>

      <footer className="mt-3 flex items-center justify-between border-t border-border pt-2 font-mono text-[10px] text-muted-foreground">
        <span>{market.participants.toLocaleString()} traders</span>
        <span className="text-foreground">Vol {market.volume}</span>
      </footer>
    </section>
  );
}