import { useState } from "react";
import { ChevronDown, Clock, Flame, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { PlayerSpotlight } from "@/data/sports-markets";
import { useTradeDrawer } from "@/components/sports/trade/TradeDrawerProvider";
import { CardHeader, TypeChip } from "@/components/sports/CardChip";

/**
 * Horizontal variant of the player spotlight bundle. Used inside the
 * league Props tab as a "Featured props" promo — left column is a
 * compact neon-ring portrait, right column lists the player's binary
 * prop markets with inline Y/N buy buttons that open the trade drawer.
 *
 * The vertical {@link PlayerPropsSpotlight} carousel variant is kept
 * intact for the homepage dashboard.
 */
function parseDollars(v: string): number {
  // accepts "$1.10M" / "$680K" / "$420" → number
  const m = v.replace(/[$,]/g, "").trim().match(/^([\d.]+)\s*([KMB]?)$/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const unit = (m[2] || "").toUpperCase();
  const mult = unit === "B" ? 1e9 : unit === "M" ? 1e6 : unit === "K" ? 1e3 : 1;
  return n * mult;
}

function formatDollars(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${Math.round(n)}`;
}

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

  // aggregates for footer + hot badge
  const totalTraders = player.props.reduce((s, m) => s + (m.participants ?? 0), 0);
  const totalVol = player.props.reduce((s, m) => s + parseDollars(m.volume), 0);
  const total24h = player.props.reduce((s, m) => s + parseDollars(m.volume24h ?? "0"), 0);
  const endsLabel = player.props[0]?.endsLabel ?? "";
  const primaryMarketId = player.props[0]?.id;

  return (
    <section className="relative flex h-full overflow-hidden rounded-2xl border border-border bg-surface bg-ambient shadow-card">
      {primaryMarketId && (
        <Link
          to="/event/$id"
          params={{ id: primaryMarketId }}
          aria-label={`Open ${player.firstName} ${player.lastName} props`}
          className="absolute inset-0 z-0 rounded-2xl"
        />
      )}
      {/* portrait column */}
      <div className="relative grid w-[160px] shrink-0 place-items-center sm:w-[200px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[oklch(0.55_0.2_295_/_0.18)] via-transparent to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_120deg,oklch(0.7_0.28_340/0.85),oklch(0.55_0.2_295/0.4),oklch(0.7_0.28_340/0.85))] blur-[2px]"
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
          className={`relative z-10 h-[160px] w-[136px] rounded-[72px] bg-white/[0.04] sm:h-[184px] sm:w-[156px] ${imageFitClass}`}
        />
        {total24h > 0 && (
          <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-foreground ring-1 ring-white/15 backdrop-blur">
              24h · {formatDollars(total24h)}
            </span>
          </div>
        )}
        {/* right edge fade into content column */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-r from-transparent to-[var(--surface,oklch(0.18_0.02_290))]/40"
        />
      </div>

      {/* content column */}
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <CardHeader
          chip={<TypeChip icon={Flame} label="Featured props" tone="violet" />}
          title={`${player.firstName} ${player.lastName}`}
          titleSize="lg"
        />

        <div className="relative z-10 mt-3 flex flex-1 flex-col divide-y divide-white/[0.04] border-t border-white/[0.04]">
          {visible.map((m) => {
            const yes = m.outcomes[0];
            const no = m.outcomes[1];
            if (!yes || !no) return null;
            const yesPct = Math.round(yes.price * 100);
            const noPct = Math.round(no.price * 100);
            const delta = yes.delta24h ?? 0;
            const deltaPts = Math.round(delta * 100);
            const deltaUp = deltaPts > 0;
            const deltaDown = deltaPts < 0;
            return (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium text-foreground">
                    {m.title}
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
                    <span>Vol {m.volume}</span>
                    {deltaPts !== 0 && (
                      <span
                        className={
                          deltaUp
                            ? "text-[oklch(0.85_0.16_155)]"
                            : "text-[oklch(0.82_0.16_25)]"
                        }
                      >
                        {deltaUp ? "↗" : deltaDown ? "↘" : "·"}{" "}
                        {deltaUp ? `+${deltaPts}` : `−${Math.abs(deltaPts)}`}¢
                      </span>
                    )}
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

        <footer className="mt-auto flex items-center justify-between border-t border-border pt-3 font-mono text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3 w-3" /> {endsLabel}
          </span>
          <span className="inline-flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" /> {totalTraders.toLocaleString()}
            </span>
            <span className="text-foreground">Vol {formatDollars(totalVol)}</span>
          </span>
        </footer>
      </div>
    </section>
  );
}