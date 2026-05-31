import { Clock, Users, Trophy, Target, HelpCircle } from "lucide-react";
import type { SportsMarket } from "@/data/sports-markets";
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
  const Icon =
    market.kind === "league-winner"
      ? Trophy
      : market.kind === "player-prop" || market.kind === "top-scorer"
        ? Target
        : HelpCircle;

  return (
    <section className="flex h-full flex-col rounded-2xl border border-border bg-surface p-4 shadow-card">
      <header className="flex items-center justify-between pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-foreground/80 ring-1 ring-white/10">
            <Icon className="h-4 w-4" />
          </span>
          <h3 className="line-clamp-2 font-display text-sm font-semibold leading-tight text-foreground">
            {market.title}
          </h3>
        </div>
      </header>

      {/* gauge — slim, matches the rhythm of group standings */}
      <div className="pt-1 pb-3">
        <div className="mb-1 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-widest">
          <span className="text-[oklch(0.85_0.16_155)]">{yes.label} {yesPct}%</span>
          <span className="text-[oklch(0.82_0.16_25)]">{no.label} {noPct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[oklch(0.7_0.22_25_/_0.18)] ring-1 ring-white/[0.04]">
          <div
            className="h-full"
            style={{
              width: `${yesPct}%`,
              background:
                "linear-gradient(90deg, oklch(0.78 0.18 155 / 0.95), oklch(0.78 0.18 155 / 0.7))",
              boxShadow: "0 0 12px -2px oklch(0.78 0.18 155 / 0.55)",
            }}
          />
        </div>
      </div>

      {/* YES / NO action rows — mirror GroupWinnerCard row styling */}
      <div className="flex flex-1 flex-col divide-y divide-white/[0.04]">
        {[
          { o: yes, pct: yesPct, kind: "y" as const },
          { o: no, pct: noPct, kind: "n" as const },
        ].map(({ o, pct, kind }) => {
          const isYes = kind === "y";
          return (
            <div
              key={o.id}
              className="grid grid-cols-[1fr_auto] items-center gap-2.5 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[10px] font-bold ${
                    isYes
                      ? "bg-[oklch(0.78_0.18_155_/_0.18)] text-[oklch(0.85_0.16_155)]"
                      : "bg-[oklch(0.7_0.22_25_/_0.18)] text-[oklch(0.82_0.16_25)]"
                  }`}
                >
                  {isYes ? "Y" : "N"}
                </span>
                <span className="truncate text-sm font-medium text-foreground">
                  {o.label}
                </span>
              </div>
              <button
                type="button"
                onClick={() => openTrade({ marketId: market.id, outcomeId: o.id })}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums ring-1 transition ${
                  isYes
                    ? "bg-[oklch(0.78_0.18_155_/_0.12)] text-[oklch(0.85_0.16_155)] ring-[oklch(0.78_0.18_155_/_0.3)] hover:bg-[oklch(0.78_0.18_155_/_0.22)]"
                    : "bg-[oklch(0.7_0.22_25_/_0.12)] text-[oklch(0.82_0.16_25)] ring-[oklch(0.7_0.22_25_/_0.3)] hover:bg-[oklch(0.7_0.22_25_/_0.22)]"
                }`}
                aria-label={`Buy ${o.label}`}
              >
                <span>{pct}¢</span>
              </button>
            </div>
          );
        })}
      </div>

      <footer className="mt-auto flex items-center justify-between border-t border-border pt-3 font-mono text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3 w-3" /> {market.endsLabel}
        </span>
        <span className="inline-flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" /> {market.participants.toLocaleString()}
          </span>
          <span className="text-foreground">Vol {market.volume}</span>
        </span>
      </footer>
    </section>
  );
}