import { cn } from "@/lib/utils";

interface Row {
  price: number; // ¢
  size: number;
}

interface OrderBookProps {
  /** "Buy YES" side (descending price). */
  bids?: Row[];
  /** "Buy NO" side (ascending price). */
  asks?: Row[];
  className?: string;
}

const DEFAULT_BIDS: Row[] = [
  { price: 27, size: 1240 },
  { price: 26, size: 880 },
  { price: 25, size: 2030 },
  { price: 24, size: 410 },
  { price: 23, size: 615 },
  { price: 22, size: 1900 },
];
const DEFAULT_ASKS: Row[] = [
  { price: 28, size: 990 },
  { price: 29, size: 510 },
  { price: 30, size: 2200 },
  { price: 31, size: 740 },
  { price: 32, size: 320 },
  { price: 33, size: 1180 },
];

function Side({ rows, tone, accumulate }: { rows: Row[]; tone: "yes" | "no"; accumulate: "left" | "right" }) {
  const max = Math.max(...rows.map((r) => r.size));
  const color = tone === "yes" ? "var(--primary)" : "var(--neon)";
  return (
    <div className="space-y-0.5">
      {rows.map((r, i) => {
        const pct = (r.size / max) * 100;
        const total = rows.slice(0, i + 1).reduce((acc, x) => acc + x.size, 0);
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
                tone === "yes" ? "text-primary" : "text-neon",
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
              {total.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function OrderBook({ bids = DEFAULT_BIDS, asks = DEFAULT_ASKS, className }: OrderBookProps) {
  return (
    <div className={cn("rounded-2xl border border-border bg-surface p-4 shadow-card", className)}>
      <div className="flex items-center justify-between px-2 pb-3">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Order Book</div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Price · Size · Total</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-widest text-primary">Buy Yes</div>
          <Side rows={bids} tone="yes" accumulate="left" />
        </div>
        <div>
          <div className="px-2 pb-1.5 text-right text-[10px] font-mono uppercase tracking-widest text-neon">Buy No</div>
          <Side rows={asks} tone="no" accumulate="right" />
        </div>
      </div>
    </div>
  );
}