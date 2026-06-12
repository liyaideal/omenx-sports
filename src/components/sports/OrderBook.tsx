import { cn } from "@/lib/utils";

interface Row {
  price: number; // ¢
  size: number;
}

interface OrderBookProps {
  /**
   * Resting bids on the YES contract (below the last price, sorted desc).
   * Kept as a back-compat alias — if `yesBids` is omitted this is used.
   */
  yesBook?: Row[];
  /** Resting bids on the YES contract (below last). Sorted high → low. */
  yesBids?: Row[];
  /** Resting asks on the YES contract (above last). Sorted low → high
   *  is fine — we re-sort internally for display (high → low, like Polymarket). */
  yesAsks?: Row[];
  /** Mark price of the YES contract, in ¢. */
  mark?: number;
  /**
   * Optional team aliases. When set, column headers display the team names
   * (e.g. "MAN CITY BOOK / REAL MADRID BOOK") instead of "YES BOOK / NO BOOK"
   * — keeping the whole surface in one language.
   */
  sideLabels?: { yes: string; no: string };
  className?: string;
}

const DEFAULT_YES_BIDS: Row[] = [
  { price: 27, size: 1240 },
  { price: 26, size: 880 },
  { price: 25, size: 2030 },
  { price: 24, size: 410 },
  { price: 23, size: 615 },
  { price: 22, size: 1900 },
];

const DEFAULT_YES_ASKS: Row[] = [
  { price: 29, size: 1450 },
  { price: 30, size: 720 },
  { price: 31, size: 1980 },
  { price: 32, size: 540 },
  { price: 33, size: 880 },
  { price: 34, size: 1610 },
];

const ASK_COLOR = "oklch(0.7 0.22 25)"; // red
const BID_COLOR = "oklch(0.78 0.18 155)"; // green

function HalfSide({
  rows,
  tone,
  accumulate,
}: {
  /** Already in display order (top → bottom). */
  rows: Row[];
  tone: "ask" | "bid";
  accumulate: "left" | "right";
}) {
  if (rows.length === 0) return null;
  const max = Math.max(...rows.map((r) => r.size));
  const color = tone === "ask" ? ASK_COLOR : BID_COLOR;
  const priceClass = tone === "ask" ? "text-[oklch(0.82_0.16_25)]" : "text-[oklch(0.85_0.16_155)]";
  // Cumulative depth from the "inside" of the book (best price = closest to
  // the spread divider). For asks (sorted high → low, best at the bottom)
  // we accumulate bottom-up; for bids (sorted high → low, best at the top)
  // we accumulate top-down.
  const totals = (() => {
    if (tone === "bid") {
      let acc = 0;
      return rows.map((r) => (acc += r.size));
    }
    const out: number[] = new Array(rows.length);
    let acc = 0;
    for (let i = rows.length - 1; i >= 0; i--) {
      acc += rows[i].size;
      out[i] = acc;
    }
    return out;
  })();
  return (
    <div className="space-y-0.5">
      {rows.map((r, i) => {
        const pct = (r.size / max) * 100;
        return (
          <div
            key={i}
            className="relative grid grid-cols-3 items-center px-2 py-1 text-[11px] font-mono tabular-nums"
          >
            <div
              className="absolute inset-y-0 opacity-[0.12]"
              style={{
                background: color,
                width: `${pct}%`,
                [accumulate === "left" ? "left" : "right"]: 0,
              }}
            />
            <span
              className={cn(
                "relative",
                priceClass,
                accumulate === "right" && "text-right",
              )}
            >
              {r.price}¢
            </span>
            <span className="relative text-center text-foreground">{r.size.toLocaleString()}</span>
            <span
              className={cn(
                "relative text-muted-foreground",
                accumulate === "right" ? "text-left" : "text-right",
              )}
            >
              {totals[i].toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SpreadDivider({
  last,
  spread,
  align,
}: {
  last: number;
  spread: number;
  align: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "my-1 flex items-center gap-2 border-y border-white/[0.06] px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground",
        align === "right" && "justify-end",
      )}
    >
      <span>
        Last <span className="text-foreground tabular-nums">{last}¢</span>
      </span>
      <span className="opacity-40">·</span>
      <span>
        Spread <span className="text-foreground tabular-nums">{spread}¢</span>
      </span>
    </div>
  );
}

export function OrderBook({
  yesBook,
  yesBids,
  yesAsks,
  mark = 28,
  sideLabels,
  className,
}: OrderBookProps) {
  // Resolve YES side
  const yBids = [...(yesBids ?? yesBook ?? DEFAULT_YES_BIDS)].sort((a, b) => b.price - a.price);
  const yAsks = [...(yesAsks ?? DEFAULT_YES_ASKS)].sort((a, b) => b.price - a.price); // high → low for display

  // NO column mirrors YES with price = 100 − p AND ask/bid swap.
  // YES ask @ p → NO bid @ (100−p); YES bid @ p → NO ask @ (100−p).
  const nBids: Row[] = yAsks.map((r) => ({ price: 100 - r.price, size: r.size }))
    .sort((a, b) => b.price - a.price); // bids high → low
  const nAsks: Row[] = yBids.map((r) => ({ price: 100 - r.price, size: r.size }))
    .sort((a, b) => b.price - a.price); // asks high → low

  const yBestAsk = yAsks[yAsks.length - 1]?.price ?? mark;
  const yBestBid = yBids[0]?.price ?? mark;
  const ySpread = Math.max(0, yBestAsk - yBestBid);
  const yLast = mark;

  const nBestAsk = nAsks[nAsks.length - 1]?.price ?? 100 - mark;
  const nBestBid = nBids[0]?.price ?? 100 - mark;
  const nSpread = Math.max(0, nBestAsk - nBestBid);
  const nLast = 100 - mark;

  const yesHeader = sideLabels ? `${sideLabels.yes} Book` : "YES Book";
  const noHeader = sideLabels ? `${sideLabels.no} Book` : "NO Book";
  return (
    <div className={cn("rounded-2xl border border-border bg-surface p-4 shadow-card", className)}>
      <div className="flex items-center justify-between px-2 pb-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Order Book</div>
        <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <span>
            Mark <span className="text-foreground tabular-nums">{mark}¢</span>
          </span>
          <span>
            Spread <span className="text-foreground tabular-nums">{ySpread}¢</span>
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between px-2 pb-2 text-[10px] font-mono uppercase tracking-widest">
        <span className="text-muted-foreground/70 normal-case tracking-normal">
          Two opposite sides of the same market
        </span>
        <span className="text-muted-foreground">Price · Size · Total</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-widest text-[oklch(0.85_0.16_155)]">{yesHeader}</div>
          <HalfSide rows={yAsks} tone="ask" accumulate="left" />
          <SpreadDivider last={yLast} spread={ySpread} align="left" />
          <HalfSide rows={yBids} tone="bid" accumulate="left" />
        </div>
        <div>
          <div className="px-2 pb-1.5 text-right text-[10px] font-mono uppercase tracking-widest text-[oklch(0.85_0.16_155)]">{noHeader}</div>
          <HalfSide rows={nAsks} tone="ask" accumulate="right" />
          <SpreadDivider last={nLast} spread={nSpread} align="right" />
          <HalfSide rows={nBids} tone="bid" accumulate="right" />
        </div>
      </div>
    </div>
  );
}