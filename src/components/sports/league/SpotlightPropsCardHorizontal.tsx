import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { PlayerSpotlight } from "@/data/sports-markets";
import { useTradeDrawer } from "@/components/sports/trade/TradeDrawerProvider";

/**
 * Horizontal variant of the player spotlight bundle. Used inside the
 * league Props tab as a "Featured props" promo — left column is a
 * compact neon-ring portrait, right column lists the player's binary
 * prop markets with inline Y/N buy buttons that open the trade drawer.
 *
 * The vertical {@link PlayerPropsSpotlight} carousel variant is kept
 * intact for the homepage dashboard.
 */
export function SpotlightPropsCardHorizontal({
  player,
}: {
  player: PlayerSpotlight;
}) {
  const { openTrade } = useTradeDrawer();
  const MAX_VISIBLE = 3;
  const [expanded, setExpanded] = useState(false);
  const hasMore = player.props.length > MAX_VISIBLE;
  const visible = expanded || !hasMore ? player.props : player.props.slice(0, MAX_VISIBLE);
  const imageFitClass =
    player.imageFit === "contain" ? "object-contain p-3" : "object-cover object-top";

  return (
    <section className="flex h-full overflow-hidden rounded-2xl border border-border bg-surface bg-ambient shadow-card">
      {/* portrait column */}
      <div className="relative grid w-[120px] shrink-0 place-items-center bg-white/[0.02] sm:w-[150px]">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[140px] w-[140px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_120deg,oklch(0.7_0.28_340/0.85),oklch(0.55_0.2_295/0.4),oklch(0.7_0.28_340/0.85))] blur-[2px]"
          style={{
            WebkitMask:
              "radial-gradient(circle, transparent 44%, black 47%, black 52%, transparent 55%)",
            mask: "radial-gradient(circle, transparent 44%, black 47%, black 52%, transparent 55%)",
          }}
        />
        <img
          src={player.photo}
          alt={`${player.firstName} ${player.lastName}`}
          loading="lazy"
          className={`relative z-10 h-[120px] w-[100px] rounded-[60px] bg-white/[0.04] sm:h-[140px] sm:w-[116px] ${imageFitClass}`}
        />
      </div>

      {/* content column */}
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="text-neon">@</span>
              {player.handle}
            </div>
            <h3 className="truncate font-display text-base font-semibold leading-tight text-foreground">
              {player.firstName} {player.lastName}
            </h3>
            <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {player.position}
            </div>
          </div>
          <span className="shrink-0 rounded-md bg-white/[0.04] px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground ring-1 ring-white/[0.06]">
            {player.props.length} markets
          </span>
        </header>

        <div className="mt-3 flex flex-1 flex-col divide-y divide-white/[0.04] border-t border-white/[0.04]">
          {visible.map((m) => {
            const yes = m.outcomes[0];
            const no = m.outcomes[1];
            if (!yes || !no) return null;
            const yesPct = Math.round(yes.price * 100);
            const noPct = Math.round(no.price * 100);
            return (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium text-foreground">
                    {m.title}
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    Vol {m.volume} · {m.endsLabel}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openTrade({ marketId: m.id, outcomeId: yes.id })}
                    className="inline-flex items-center gap-1 rounded-md bg-[oklch(0.78_0.18_155_/_0.12)] px-2 py-1 font-mono text-[11px] font-semibold tabular-nums text-[oklch(0.85_0.16_155)] ring-1 ring-[oklch(0.78_0.18_155_/_0.3)] transition hover:bg-[oklch(0.78_0.18_155_/_0.22)]"
                    aria-label={`Buy ${yes.label} on ${m.title}`}
                  >
                    <span className="opacity-70">Y</span>
                    <span>{yesPct}¢</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openTrade({ marketId: m.id, outcomeId: no.id })}
                    className="inline-flex items-center gap-1 rounded-md bg-[oklch(0.7_0.22_25_/_0.12)] px-2 py-1 font-mono text-[11px] font-semibold tabular-nums text-[oklch(0.82_0.16_25)] ring-1 ring-[oklch(0.7_0.22_25_/_0.3)] transition hover:bg-[oklch(0.7_0.22_25_/_0.22)]"
                    aria-label={`Buy ${no.label} on ${m.title}`}
                  >
                    <span className="opacity-70">N</span>
                    <span>{noPct}¢</span>
                  </button>
                </div>
              </div>
            );
          })}
          {hasMore && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center justify-center gap-1.5 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground transition hover:text-foreground"
            >
              <span>
                {expanded
                  ? "Show less"
                  : `+${player.props.length - MAX_VISIBLE} more`}
              </span>
              <ChevronDown
                className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}