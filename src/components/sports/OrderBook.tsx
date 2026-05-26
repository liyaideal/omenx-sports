import { cn } from "@/lib/utils";

interface Row {
  price: number; // ¢
  size: number;
}

interface OrderBookProps {
  /**
   * Resting orders on the YES contract. The NO book is rendered as a mirror
   * (`no_price = 100 − yes_price`), since YES and NO are two views of the
   * same binary market.
   */
  yesBook?: Row[];
  /** Mark price of the YES contract, in ¢. */
  mark?: number;
  className?: string;
}

const DEFAULT_YES: Row[] = [
  { price: 27, size: 1240 },
  { price: 26, size: 880 },
  { price: 25, size: 2030 },
  { price: 24, size: 410 },
  { price: 23, size: 615 },
  { price: 22, size: 1900 },
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

export function OrderBook({ yesBook = DEFAULT_YES, mark = 28, className }: OrderBookProps) {
  // NO book is the mirror of YES book: every YES row at price p with size s
  // corresponds to a NO row at price (100 − p) with the same size.
  const noBook: Row[] = yesBook.map((r) => ({ price: 100 - r.price, size: r.size }));
  const bestYes = yesBook[0]?.price ?? 0;
  const bestNo = noBook[0]?.price ?? 0;
  const spread = Math.max(0, 100 - bestYes - bestNo);
  return (
    <div className={cn("rounded-2xl border border-border bg-surface p-4 shadow-card", className)}>
      <div className="flex items-center justify-between px-2 pb-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Order Book</div>
        <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <span>
            Mark <span className="text-foreground tabular-nums">{mark}¢</span>
          </span>
          <span>
            Spread <span className="text-foreground tabular-nums">{spread}¢</span>
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between px-2 pb-2 text-[10px] font-mono uppercase tracking-widest">
        <span className="text-muted-foreground/70 normal-case tracking-normal">
          NO book mirrors YES · price = 100 − yes_price
        </span>
        <span className="text-muted-foreground">Price · Size · Total</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-widest text-primary">YES Book</div>
          <Side rows={yesBook} tone="yes" accumulate="left" />
        </div>
        <div>
          <div className="px-2 pb-1.5 text-right text-[10px] font-mono uppercase tracking-widest text-neon">NO Book</div>
          <Side rows={noBook} tone="no" accumulate="right" />
        </div>
      </div>
    </div>
  );
}