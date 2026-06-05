import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import type { Outcome, SportsMarket } from "@/data/sports-markets";

/**
 * Multi-line price chart that overlays the historical price of every outcome
 * in a market on a single canvas. Mirrors `<PriceChart>`'s visual language
 * (range pills, dark surface) but is purpose-built for the new
 * Polymarket-style outcomes panel — same data shape, different layout.
 */
export interface CombinedPriceChartProps {
  market: SportsMarket;
  /** Optional outcome id to emphasize (thicker line + full opacity). */
  highlightedOutcomeId?: string;
  /** Click an outcome legend dot to surface it upstream. */
  onLegendSelect?: (outcomeId: string) => void;
  /**
   * Open positions on this event. Rendered as dashed reference lines + a
   * right-edge chip per position (TradingView-style position overlay).
   * When omitted or empty, the chart renders without any overlay chrome.
   */
  positions?: ChartPosition[];
  className?: string;
}

/**
 * One open position to overlay onto the chart. The chart's Y axis is the
 * YES price for each outcome (0–100¢); a NO position at entry¢ is plotted
 * at the equivalent YES price (100 − entry) so the geometry "where I'm at
 * vs where the market is" reads correctly.
 */
export interface ChartPosition {
  outcomeId: string;
  side: "yes" | "no";
  /** Entry price in ¢ (0–100), on the side the user actually bought. */
  entry: number;
  /** Unrealized P/L in USDC (signed). */
  pnl: number;
  /** Contracts held. Used for the title/tooltip; not rendered as a number
   *  in the chip to keep it compact. */
  size: number;
  /** Outcome alias to show in the chip, e.g. "USA" or "Draw". */
  outcomeLabel: string;
  /** Fires when the user clicks the chip's × button. Usually a Sell shortcut
   *  via the TradeDrawer; the chart itself stays presentational. */
  onClose?: () => void;
}

const RANGES = ["1H", "6H", "1D", "1W", "ALL"] as const;
type Range = (typeof RANGES)[number];

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 100;
}

/** Deterministic per-outcome series that ends close to the live price. */
function genSeries(seed: number, endPrice: number, n = 60): number[] {
  const out: number[] = [];
  let p = endPrice * 100 * 0.7 + (seed % 25);
  for (let i = 0; i < n; i++) {
    const s = Math.sin((i + seed) * 0.37) * 3;
    const r = ((seed * (i + 7)) % 7) - 3;
    p = Math.max(2, Math.min(98, p + s * 0.4 + r * 0.5));
    out.push(Number(p.toFixed(2)));
  }
  // Force the very last point to the actual current price so the legend
  // value matches what the user sees in the outcomes list.
  out[out.length - 1] = Math.round(endPrice * 100);
  return out;
}

/**
 * Palette used when an outcome doesn't have an inferable hue. Picked to feel
 * at home in the OmenX dark theme and to stay distinguishable when 7+ lines
 * overlap (futures markets, top scorer, etc.).
 */
const FALLBACK_PALETTE = [
  "oklch(0.72 0.18 250)", // sky
  "oklch(0.78 0.18 155)", // win green
  "oklch(0.78 0.18 60)",  // amber
  "oklch(0.7 0.22 25)",   // loss red
  "oklch(0.72 0.2 305)",  // violet
  "oklch(0.78 0.16 195)", // teal
  "oklch(0.78 0.15 110)", // lime
  "oklch(0.74 0.18 340)", // pink
];

export function outcomeColor(o: Outcome, idx: number): string {
  if (o.team) return `oklch(0.72 0.2 ${o.team.hue})`;
  const lbl = o.label.toUpperCase();
  if (lbl === "YES") return "oklch(0.78 0.18 155)";
  if (lbl === "NO") return "oklch(0.7 0.22 25)";
  if (lbl === "DRAW" || o.meta === "X") return "oklch(0.85 0.17 85)";
  return FALLBACK_PALETTE[idx % FALLBACK_PALETTE.length];
}

export function CombinedPriceChart({
  market,
  highlightedOutcomeId,
  onLegendSelect,
  positions,
  className,
}: CombinedPriceChartProps) {
  const [range, setRange] = useState<Range>("1D");

  // Build a wide-form dataset: `{ t, [outcomeId]: price, ... }`
  const { data, perOutcome } = useMemo(() => {
    const rangeBump = RANGES.indexOf(range);
    const series = market.outcomes.map((o, idx) => {
      const seed = hashSeed(market.id + ":" + o.id) + rangeBump * 13;
      return {
        id: o.id,
        label: o.team?.short ?? o.label,
        color: outcomeColor(o, idx),
        values: genSeries(seed, o.price),
      };
    });
    const len = series[0]?.values.length ?? 0;
    const data: Record<string, number>[] = [];
    for (let i = 0; i < len; i++) {
      const row: Record<string, number> = { t: i };
      for (const s of series) row[s.id] = s.values[i];
      data.push(row);
    }
    return { data, perOutcome: series };
  }, [market, range]);

  // Build the overlay rows (one chip per position). We resolve the outcome
  // here so the chip can borrow that outcome's color and YES price.
  const overlay = useMemo(() => {
    if (!positions || positions.length === 0) return [];
    return positions
      .map((p) => {
        const idx = market.outcomes.findIndex((o) => o.id === p.outcomeId);
        if (idx < 0) return null;
        const o = market.outcomes[idx];
        const color = outcomeColor(o, idx);
        // YES-axis position of the entry. NO is mirrored to the YES axis.
        const yChart = p.side === "yes" ? p.entry : 100 - p.entry;
        return { ...p, color, yChart };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      // Top-down so chips don't read in a random order when they overlap.
      .sort((a, b) => b.yChart - a.yChart);
  }, [positions, market.outcomes]);

  return (
    <div className={cn("rounded-2xl border border-border bg-surface p-5 shadow-card", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Price history
          </div>
          <div className="mt-1 font-display text-sm text-foreground/80">
            All outcomes
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-white/[0.04] p-1 ring-1 ring-white/5">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={cn(
                "rounded-full px-2.5 py-0.5 font-mono text-[11px] transition-colors",
                range === r
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <XAxis dataKey="t" hide />
            <YAxis domain={[0, 100]} hide />
            <Tooltip
              cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }}
              contentStyle={{
                background: "var(--surface-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
              }}
              labelStyle={{ color: "var(--muted-foreground)" }}
              formatter={(v: number, name: string) => {
                const o = perOutcome.find((s) => s.id === name);
                return [`${Math.round(v)}¢`, o?.label ?? name];
              }}
              labelFormatter={() => ""}
            />
            {perOutcome.map((s) => {
              const dimmed = highlightedOutcomeId && highlightedOutcomeId !== s.id;
              return (
                <Line
                  key={s.id}
                  type="monotone"
                  dataKey={s.id}
                  stroke={s.color}
                  strokeWidth={dimmed ? 1.25 : 2.25}
                  strokeOpacity={dimmed ? 0.45 : 1}
                  dot={false}
                  isAnimationActive={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend strip — colored dot + name + current ¢. Click to highlight. */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {perOutcome.map((s) => {
          const cents = s.values[s.values.length - 1];
          const dim = highlightedOutcomeId && highlightedOutcomeId !== s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onLegendSelect?.(s.id)}
              className={cn(
                "group inline-flex items-center gap-1.5 text-[11px] font-mono transition-opacity",
                dim ? "opacity-55 hover:opacity-100" : "opacity-100",
              )}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }}
              />
              <span className="text-foreground">{s.label}</span>
              <span className="tabular-nums text-muted-foreground">{cents}¢</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}