import { useState } from "react";
import { cn } from "@/lib/utils";
import { LeagueBadge } from "./LeagueBadge";

type Tab = "positions" | "orders" | "history";

export interface PositionRowData {
  market: string;
  league: "epl" | "laliga" | "ucl" | "seriea" | "nba";
  side: "yes" | "no";
  size: number;
  entry: number; // ¢
  mark: number; // ¢
  leverage: number;
  pnl: number; // USDC
}

export interface OrderRowData {
  market: string;
  league: "epl" | "laliga" | "ucl" | "seriea" | "nba";
  side: "yes" | "no";
  type: "limit" | "market";
  price: number;
  size: number;
  filled: number; // 0–100 %
}

interface PositionsTableProps {
  positions?: PositionRowData[];
  orders?: OrderRowData[];
  className?: string;
}

const DEFAULT_POS: PositionRowData[] = [
  { market: "Man City win UCL?", league: "ucl", side: "yes", size: 250, entry: 28, mark: 34, leverage: 5, pnl: 53.6 },
  { market: "El Clásico — Real wins?", league: "laliga", side: "no", size: 120, entry: 47, mark: 41, leverage: 1, pnl: 15.3 },
  { market: "Liverpool top 4?", league: "epl", side: "yes", size: 80, entry: 62, mark: 55, leverage: 3, pnl: -16.8 },
];
const DEFAULT_ORD: OrderRowData[] = [
  { market: "Arsenal vs Spurs — Arsenal", league: "epl", side: "yes", type: "limit", price: 55, size: 200, filled: 40 },
  { market: "Lakers vs Celtics — Celtics", league: "nba", side: "no", type: "limit", price: 48, size: 100, filled: 0 },
];

const tabs: { id: Tab; label: string }[] = [
  { id: "positions", label: "Positions" },
  { id: "orders", label: "Open Orders" },
  { id: "history", label: "History" },
];

export function PositionsTable({ positions = DEFAULT_POS, orders = DEFAULT_ORD, className }: PositionsTableProps) {
  const [tab, setTab] = useState<Tab>("positions");
  return (
    <div className={cn("rounded-2xl border border-border bg-surface shadow-card", className)}>
      <div className="flex items-center gap-1 border-b border-border px-4 pt-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "relative px-3 py-2 text-xs font-display font-semibold uppercase tracking-widest transition-colors",
              tab === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            {tab === t.id && (
              <span className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-gradient-neon" />
            )}
            <span className="ml-1.5 rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">
              {t.id === "positions" ? positions.length : t.id === "orders" ? orders.length : 0}
            </span>
          </button>
        ))}
      </div>
      {tab === "positions" && <PositionTable rows={positions} />}
      {tab === "orders" && <OrderTable rows={orders} />}
      {tab === "history" && (
        <div className="p-12 text-center font-mono text-xs text-muted-foreground">
          No historical trades yet.
        </div>
      )}
    </div>
  );
}

function PositionTable({ rows }: { rows: PositionRowData[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <Th>Market</Th>
            <Th>Side</Th>
            <Th className="text-right">Size</Th>
            <Th className="text-right">Entry</Th>
            <Th className="text-right">Mark</Th>
            <Th className="text-right">Lev</Th>
            <Th className="text-right">PnL</Th>
            <Th />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-white/[0.02]">
              <Td>
                <div className="flex items-center gap-2">
                  <LeagueBadge league={r.league} showLabel={false} />
                  <span className="font-medium text-foreground">{r.market}</span>
                </div>
              </Td>
              <Td>
                <SideTag side={r.side} />
              </Td>
              <Td className="text-right font-mono tabular-nums">{r.size}</Td>
              <Td className="text-right font-mono tabular-nums">{r.entry}¢</Td>
              <Td className="text-right font-mono tabular-nums">{r.mark}¢</Td>
              <Td className="text-right font-mono tabular-nums">{r.leverage}×</Td>
              <Td className={cn("text-right font-mono tabular-nums", r.pnl >= 0 ? "text-win" : "text-loss")}>
                {r.pnl >= 0 ? "+" : ""}
                {r.pnl.toFixed(2)}
              </Td>
              <Td className="text-right">
                <button className="rounded-md border border-border bg-white/[0.04] px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground">
                  Close
                </button>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderTable({ rows }: { rows: OrderRowData[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <Th>Market</Th>
            <Th>Side</Th>
            <Th>Type</Th>
            <Th className="text-right">Price</Th>
            <Th className="text-right">Size</Th>
            <Th className="text-right">Filled</Th>
            <Th />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-white/[0.02]">
              <Td>
                <div className="flex items-center gap-2">
                  <LeagueBadge league={r.league} showLabel={false} />
                  <span className="font-medium text-foreground">{r.market}</span>
                </div>
              </Td>
              <Td>
                <SideTag side={r.side} />
              </Td>
              <Td className="font-mono uppercase text-[10px] tracking-widest text-muted-foreground">{r.type}</Td>
              <Td className="text-right font-mono tabular-nums">{r.price}¢</Td>
              <Td className="text-right font-mono tabular-nums">{r.size}</Td>
              <Td className="text-right font-mono tabular-nums">{r.filled}%</Td>
              <Td className="text-right">
                <button className="rounded-md border border-loss/30 bg-loss/10 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-loss hover:bg-loss/20">
                  Cancel
                </button>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn("px-4 py-2 font-normal", className)}>{children}</th>;
}
function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3", className)}>{children}</td>;
}
function SideTag({ side }: { side: "yes" | "no" }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest",
        side === "yes" ? "bg-primary/15 text-primary" : "bg-neon/15 text-neon",
      )}
    >
      {side}
    </span>
  );
}