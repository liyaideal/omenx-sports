import { useState } from "react";
import { cn } from "@/lib/utils";
import { LeagueBadge } from "./LeagueBadge";

type Tab = "positions" | "orders" | "history";

export interface PositionRowData {
  market: string;
  league: "epl" | "laliga" | "ucl" | "seriea" | "nba";
  /**
   * Which side of the binary the position is on. All positions are long
   * (Buy YES or Buy NO); there is no short side. The outcome alone determines
   * P/L direction and color.
   */
  outcome: "yes" | "no";
  /** Display label for the outcome (team alias or "Yes" / "No"). */
  outcomeLabel: string;
  size: number;
  entry: number; // ¢
  mark: number; // ¢
  leverage: number;
  mode: "cross" | "isolated";
  margin: number; // USDC
  liq: number; // ¢
  pnl: number; // USDC
}

export interface OrderRowData {
  market: string;
  league: "epl" | "laliga" | "ucl" | "seriea" | "nba";
  outcome: "yes" | "no";
  outcomeLabel: string;
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
  { market: "Man City win UCL?", league: "ucl", outcome: "yes", outcomeLabel: "Man City", size: 250, entry: 28, mark: 34, leverage: 5, mode: "cross", margin: 50, liq: 12, pnl: 53.6 },
  { market: "El Clásico", league: "laliga", outcome: "no", outcomeLabel: "Barcelona", size: 120, entry: 53, mark: 59, leverage: 1, mode: "isolated", margin: 120, liq: 99, pnl: 15.3 },
  { market: "Liverpool top 4?", league: "epl", outcome: "yes", outcomeLabel: "Liverpool", size: 80, entry: 62, mark: 55, leverage: 3, mode: "cross", margin: 27, liq: 28, pnl: -16.8 },
];
const DEFAULT_ORD: OrderRowData[] = [
  { market: "Arsenal vs Spurs", league: "epl", outcome: "yes", outcomeLabel: "Arsenal", type: "limit", price: 55, size: 200, filled: 40 },
  { market: "Lakers vs Celtics", league: "nba", outcome: "no", outcomeLabel: "Celtics", type: "limit", price: 52, size: 100, filled: 0 },
  { market: "Will it snow at tip-off?", league: "nba", outcome: "yes", outcomeLabel: "Yes", type: "market", price: 18, size: 60, filled: 100 },
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
            <Th>Outcome</Th>
            <Th className="text-right">Size</Th>
            <Th className="text-right">Entry</Th>
            <Th className="text-right">Mark</Th>
            <Th className="text-right">Lev</Th>
            <Th className="text-right">Mode</Th>
            <Th className="text-right">Margin</Th>
            <Th className="text-right">Liq</Th>
            <Th className="text-right">PnL</Th>
            <Th className="text-right">ROE</Th>
            <Th />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r, i) => {
            const roe = r.margin > 0 ? (r.pnl / r.margin) * 100 : 0;
            return (
            <tr key={i} className="hover:bg-white/[0.02]">
              <Td>
                <div className="flex items-center gap-2">
                  <LeagueBadge league={r.league} showLabel={false} />
                  <span className="font-medium text-foreground">{r.market}</span>
                </div>
              </Td>
              <Td>
                <OutcomeTag outcome={r.outcome} label={r.outcomeLabel} />
              </Td>
              <Td className="text-right font-mono tabular-nums">{r.size}</Td>
              <Td className="text-right font-mono tabular-nums">{r.entry}¢</Td>
              <Td className="text-right font-mono tabular-nums">{r.mark}¢</Td>
              <Td className="text-right font-mono tabular-nums">{r.leverage}×</Td>
              <Td className="text-right font-mono uppercase text-[10px] tracking-widest text-muted-foreground">{r.mode}</Td>
              <Td className="text-right font-mono tabular-nums">{r.margin.toFixed(0)}</Td>
              <Td className="text-right font-mono tabular-nums text-loss">{r.liq}¢</Td>
              <Td className={cn("text-right font-mono tabular-nums", r.pnl >= 0 ? "text-win" : "text-loss")}>
                {r.pnl >= 0 ? "+" : ""}
                {r.pnl.toFixed(2)}
              </Td>
              <Td className={cn("text-right font-mono tabular-nums", roe >= 0 ? "text-win" : "text-loss")}>
                {roe >= 0 ? "+" : ""}
                {roe.toFixed(1)}%
              </Td>
              <Td className="text-right">
                <button className="rounded-md border border-border bg-white/[0.04] px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground">
                  Close
                </button>
              </Td>
            </tr>
            );
          })}
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
            <Th>Outcome</Th>
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
                <OutcomeTag outcome={r.outcome} label={r.outcomeLabel} />
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
/**
 * Renders the user-facing outcome. For team-vs-team markets the label IS the
 * side alias (e.g. "Arsenal" = YES); color carries the yes/no semantic. For
 * neutral markets without sideLabels, the label is literally "Yes" / "No".
 */
function OutcomeTag({ outcome, label }: { outcome: "yes" | "no"; label: string }) {
  const isNeutral = label.toLowerCase() === "yes" || label.toLowerCase() === "no";
  const display = isNeutral
    ? label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()
    : label;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        outcome === "yes"
          ? "bg-win/15 text-win ring-1 ring-win/25"
          : "bg-loss/15 text-loss ring-1 ring-loss/25",
      )}
    >
      {display}
    </span>
  );
}