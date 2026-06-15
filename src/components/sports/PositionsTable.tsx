import { useMemo, useState } from "react";
import { Gift, Lock, Pencil, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { LeagueBadge } from "./LeagueBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { validateTpSl, previewTpSlPnl } from "@/lib/tpsl";

type Tab = "positions" | "orders" | "history";

/**
 * Shape of the underlying event:
 *   - "binary" — 2-outcome event; each outcome IS a side. Market pill shows
 *     just the team alias (e.g. "Arsenal") with yes/no color.
 *   - "multi"  — 3+ outcomes; each outcome is its own binary sub-market and
 *     the user trades YES or NO on that candidate. Market pill shows
 *     `<ALIAS> YES|NO` (e.g. "CAN YES").
 */
export type EventShape = "binary" | "multi";

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
  eventShape?: EventShape;
  size: number;
  entry: number; // ¢
  mark: number; // ¢
  leverage: number;
  mode: "cross" | "isolated";
  margin: number; // USDC
  liq: number; // ¢
  pnl: number; // USDC
  /** Take-profit price in ¢, or null if unset. */
  tp?: number | null;
  /** Stop-loss price in ¢, or null if unset. */
  sl?: number | null;
  /**
   * When true, this is an airdrop/voucher position: shows the AIRDROP badge,
   * TP/SL is locked (no edit), and leverage is capped at 5× upstream.
   */
  isAirdrop?: boolean;
}

export interface OrderRowData {
  market: string;
  league: "epl" | "laliga" | "ucl" | "seriea" | "nba";
  outcome: "yes" | "no";
  outcomeLabel: string;
  eventShape?: EventShape;
  type: "limit" | "market";
  price: number;
  size: number;
  filled: number; // 0–100 %
}

export interface HistoryRowData {
  market: string;
  league: "epl" | "laliga" | "ucl" | "seriea" | "nba";
  outcome: "yes" | "no";
  outcomeLabel: string;
  eventShape?: EventShape;
  action: "open" | "close" | "fill";
  price: number; // ¢
  size: number;
  pnl?: number; // USDC, only for close
  when: string; // relative label
}

interface PositionsTableProps {
  positions?: PositionRowData[];
  orders?: OrderRowData[];
  history?: HistoryRowData[];
  className?: string;
  /** Called when a row's Close button is clicked. Receives the index in `positions`. */
  onClosePosition?: (index: number) => void;
  /** Called when a row's Cancel button is clicked. Receives the index in `orders`. */
  onCancelOrder?: (index: number) => void;
  /**
   * Called when the user saves a TP/SL change for a row in `positions`. Pass
   * `null` for either field to clear it. Omit to hide the TP/SL editor.
   */
  onUpdateTpsl?: (
    index: number,
    next: { tp: number | null; sl: number | null },
  ) => void;
}

const DEFAULT_POS: PositionRowData[] = [
  { market: "Man City win UCL?", league: "ucl", outcome: "yes", outcomeLabel: "MCI", eventShape: "multi", size: 250, entry: 28, mark: 34, leverage: 5, mode: "cross", margin: 50, liq: 12, pnl: 53.6, tp: 45, sl: 18 },
  { market: "El Clásico", league: "laliga", outcome: "no", outcomeLabel: "Barcelona", eventShape: "binary", size: 120, entry: 53, mark: 59, leverage: 1, mode: "isolated", margin: 120, liq: 99, pnl: 15.3, tp: null, sl: null },
  { market: "Liverpool top 4?", league: "epl", outcome: "yes", outcomeLabel: "Yes", eventShape: "binary", size: 80, entry: 62, mark: 55, leverage: 3, mode: "cross", margin: 27, liq: 28, pnl: -16.8, tp: 80, sl: 45 },
  { market: "United States vs Paraguay", league: "ucl", outcome: "yes", outcomeLabel: "USA", eventShape: "multi", size: 200, entry: 25, mark: 25, leverage: 5, mode: "isolated", margin: 10, liq: 5, pnl: 0, tp: null, sl: null, isAirdrop: true },
];
const DEFAULT_ORD: OrderRowData[] = [
  { market: "Arsenal vs Spurs", league: "epl", outcome: "yes", outcomeLabel: "Arsenal", eventShape: "binary", type: "limit", price: 55, size: 200, filled: 40 },
  { market: "Top scorer 2025", league: "ucl", outcome: "yes", outcomeLabel: "HAA", eventShape: "multi", type: "limit", price: 32, size: 100, filled: 0 },
  { market: "Will it snow at tip-off?", league: "nba", outcome: "yes", outcomeLabel: "Yes", eventShape: "binary", type: "market", price: 18, size: 60, filled: 100 },
];
const DEFAULT_HIST: HistoryRowData[] = [
  { market: "Real Madrid win UCL?", league: "ucl", outcome: "yes", outcomeLabel: "RMA", eventShape: "multi", action: "close", price: 41, size: 180, pnl: 23.4, when: "2h ago" },
  { market: "Inter vs Juventus", league: "seriea", outcome: "no", outcomeLabel: "Juventus", eventShape: "binary", action: "open", price: 47, size: 120, when: "5h ago" },
  { market: "Warriors over 220.5?", league: "nba", outcome: "yes", outcomeLabel: "Yes", eventShape: "binary", action: "fill", price: 52, size: 75, when: "Yesterday" },
  { market: "PSG top scorer 2025", league: "ucl", outcome: "no", outcomeLabel: "MBA", eventShape: "multi", action: "close", price: 33, size: 200, pnl: -12.0, when: "2d ago" },
];

const tabs: { id: Tab; label: string }[] = [
  { id: "positions", label: "Positions" },
  { id: "orders", label: "Open Orders" },
  { id: "history", label: "History" },
];

export function PositionsTable({
  positions = DEFAULT_POS,
  orders = DEFAULT_ORD,
  history = DEFAULT_HIST,
  className,
  onClosePosition,
  onCancelOrder,
  onUpdateTpsl,
}: PositionsTableProps) {
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
              {t.id === "positions" ? positions.length : t.id === "orders" ? orders.length : history.length}
            </span>
          </button>
        ))}
      </div>
      {tab === "positions" && (
        <PositionTable
          rows={positions}
          onClose={onClosePosition}
          onUpdateTpsl={onUpdateTpsl}
        />
      )}
      {tab === "orders" && (
        <OrderTable rows={orders} onCancel={onCancelOrder} />
      )}
      {tab === "history" && <HistoryTable rows={history} />}
    </div>
  );
}

function PositionTable({
  rows,
  onClose,
  onUpdateTpsl,
}: {
  rows: PositionRowData[];
  onClose?: (index: number) => void;
  onUpdateTpsl?: (
    index: number,
    next: { tp: number | null; sl: number | null },
  ) => void;
}) {
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const editRow = editIdx !== null ? rows[editIdx] : null;
  return (
    <>
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <Th>Event</Th>
            <Th>Market</Th>
            <Th className="text-right">Size</Th>
            <Th className="text-right">Entry</Th>
            <Th className="text-right">Mark</Th>
            <Th className="text-right">Lev</Th>
            <Th className="text-right">Margin</Th>
            <Th className="text-right">Liq</Th>
            <Th className="text-right">TP / SL</Th>
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
                <OutcomeTag outcome={r.outcome} label={r.outcomeLabel} eventShape={r.eventShape} />
              </Td>
              <Td className="text-right font-mono tabular-nums">{r.size}</Td>
              <Td className="text-right font-mono tabular-nums">{r.entry}¢</Td>
              <Td className="text-right font-mono tabular-nums">{r.mark}¢</Td>
              <Td className="text-right font-mono tabular-nums">{r.leverage}×</Td>
              <Td className="text-right font-mono tabular-nums">{r.margin.toFixed(0)}</Td>
              <Td className="text-right font-mono tabular-nums text-loss">{r.liq}¢</Td>
              <Td className="text-right">
                <TpSlCell
                  tp={r.tp ?? null}
                  sl={r.sl ?? null}
                  disabled={!onUpdateTpsl}
                  onClick={() => setEditIdx(i)}
                />
              </Td>
              <Td className={cn("text-right font-mono tabular-nums", r.pnl >= 0 ? "text-win" : "text-loss")}>
                {r.pnl >= 0 ? "+" : ""}
                {r.pnl.toFixed(2)}
              </Td>
              <Td className={cn("text-right font-mono tabular-nums", roe >= 0 ? "text-win" : "text-loss")}>
                {roe >= 0 ? "+" : ""}
                {roe.toFixed(1)}%
              </Td>
              <Td className="text-right">
                <ClosePositionDialog row={r} roe={roe} onConfirm={() => onClose?.(i)} />
              </Td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    {editRow && onUpdateTpsl && editIdx !== null && (
      <EditTpslDialog
        row={editRow}
        open
        onOpenChange={(o) => {
          if (!o) setEditIdx(null);
        }}
        onSave={(next) => {
          onUpdateTpsl(editIdx, next);
          setEditIdx(null);
        }}
      />
    )}
    </>
  );
}

function OrderTable({
  rows,
  onCancel,
}: {
  rows: OrderRowData[];
  onCancel?: (index: number) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <Th>Event</Th>
            <Th>Market</Th>
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
                <OutcomeTag outcome={r.outcome} label={r.outcomeLabel} eventShape={r.eventShape} />
              </Td>
              <Td className="font-mono uppercase text-[10px] tracking-widest text-muted-foreground">{r.type}</Td>
              <Td className="text-right font-mono tabular-nums">{r.price}¢</Td>
              <Td className="text-right font-mono tabular-nums">{r.size}</Td>
              <Td className="text-right font-mono tabular-nums">{r.filled}%</Td>
              <Td className="text-right">
                <CancelOrderDialog row={r} onConfirm={() => onCancel?.(i)} />
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

function HistoryTable({ rows }: { rows: HistoryRowData[] }) {
  if (rows.length === 0) {
    return (
      <div className="p-12 text-center font-mono text-xs text-muted-foreground">
        No historical trades yet.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <Th>Event</Th>
            <Th>Market</Th>
            <Th>Action</Th>
            <Th className="text-right">Price</Th>
            <Th className="text-right">Size</Th>
            <Th className="text-right">PnL</Th>
            <Th className="text-right">When</Th>
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
                <OutcomeTag outcome={r.outcome} label={r.outcomeLabel} eventShape={r.eventShape} />
              </Td>
              <Td className="font-mono uppercase text-[10px] tracking-widest text-muted-foreground">{r.action}</Td>
              <Td className="text-right font-mono tabular-nums">{r.price}¢</Td>
              <Td className="text-right font-mono tabular-nums">{r.size}</Td>
              <Td
                className={cn(
                  "text-right font-mono tabular-nums",
                  r.pnl === undefined
                    ? "text-muted-foreground"
                    : r.pnl >= 0
                      ? "text-win"
                      : "text-loss",
                )}
              >
                {r.pnl === undefined ? "—" : `${r.pnl >= 0 ? "+" : ""}${r.pnl.toFixed(2)}`}
              </Td>
              <Td className="text-right font-mono tabular-nums text-muted-foreground">{r.when}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3", className)}>{children}</td>;
}
/**
 * Renders the user-facing outcome. For team-vs-team markets the label IS the
 * side alias (e.g. "Arsenal" = YES); color carries the yes/no semantic. For
 * neutral markets without sideLabels, the label is literally "Yes" / "No".
 * For 3+ outcome events (`eventShape="multi"`), the side is rendered as a
 * suffix (e.g. "CAN YES") because each outcome is its own binary sub-market.
 */
function OutcomeTag({
  outcome,
  label,
  eventShape = "binary",
}: {
  outcome: "yes" | "no";
  label: string;
  eventShape?: EventShape;
}) {
  const isNeutral = label.toLowerCase() === "yes" || label.toLowerCase() === "no";
  const display = isNeutral
    ? label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()
    : label;
  // Multi-outcome events render `<ALIAS> YES|NO` (skip suffix on neutral
  // labels — "Yes Yes" / "No No" reads as a typo).
  const showSuffix = eventShape === "multi" && !isNeutral;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider",
        outcome === "yes"
          ? "bg-win/15 text-win ring-1 ring-win/25"
          : "bg-loss/15 text-loss ring-1 ring-loss/25",
      )}
    >
      <span>{showSuffix ? display.toUpperCase() : display}</span>
      {showSuffix && (
        <span className="opacity-60">{outcome === "yes" ? "YES" : "NO"}</span>
      )}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  TP / SL column + edit dialog                                              */
/* -------------------------------------------------------------------------- */

function TpSlCell({
  tp,
  sl,
  disabled,
  onClick,
}: {
  tp: number | null;
  sl: number | null;
  disabled?: boolean;
  onClick: () => void;
}) {
  const empty = tp === null && sl === null;
  if (empty) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "inline-flex items-center gap-1 rounded-md border border-dashed border-border bg-transparent px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground transition hover:border-foreground/40 hover:text-foreground",
          disabled && "opacity-50 hover:border-border hover:text-muted-foreground",
        )}
      >
        <Plus className="h-3 w-3" /> TP/SL
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group inline-flex items-center gap-2 rounded-md border border-border bg-white/[0.02] px-2 py-1 text-[10px] font-mono tabular-nums transition hover:bg-white/[0.05]",
        disabled && "opacity-60",
      )}
    >
      <div className="flex flex-col items-end leading-tight">
        <span className={cn(tp !== null ? "text-win" : "text-muted-foreground/50")}>
          TP {tp !== null ? `${tp}¢` : "—"}
        </span>
        <span className={cn(sl !== null ? "text-loss" : "text-muted-foreground/50")}>
          SL {sl !== null ? `${sl}¢` : "—"}
        </span>
      </div>
      <Pencil className="h-3 w-3 text-muted-foreground transition group-hover:text-foreground" />
    </button>
  );
}

function ClosePositionDialog({
  row,
  roe,
  onConfirm,
}: {
  row: PositionRowData;
  roe: number;
  onConfirm: () => void;
}) {
  const isWin = row.pnl >= 0;
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="rounded-md border border-border bg-white/[0.04] px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground transition hover:text-foreground"
        >
          Close
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Close position?</AlertDialogTitle>
          <AlertDialogDescription>
            This closes your position at the current mark. The trade will be
            settled instantly and moved to History.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="rounded-xl border border-border bg-white/[0.02] p-3 font-mono text-[11px]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-foreground">{row.market}</span>
            <OutcomeTag
              outcome={row.outcome}
              label={row.outcomeLabel}
              eventShape={row.eventShape}
            />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-[10px]">
            <Kv k="Size" v={`${row.size}`} />
            <Kv k="Lev" v={`${row.leverage}×`} />
            <Kv k="Entry" v={`${row.entry}¢`} />
            <Kv k="Mark" v={`${row.mark}¢`} />
            <Kv
              k="PnL"
              v={`${isWin ? "+" : ""}${row.pnl.toFixed(2)} USDC`}
              tone={isWin ? "win" : "loss"}
            />
            <Kv
              k="ROE"
              v={`${roe >= 0 ? "+" : ""}${roe.toFixed(1)}%`}
              tone={roe >= 0 ? "win" : "loss"}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep open</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn(
              isWin
                ? "bg-win text-background hover:bg-win/90"
                : "bg-loss text-background hover:bg-loss/90",
            )}
          >
            Close at {row.mark}¢
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function CancelOrderDialog({
  row,
  onConfirm,
}: {
  row: OrderRowData;
  onConfirm: () => void;
}) {
  const partial = row.filled > 0 && row.filled < 100;
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="rounded-md border border-loss/30 bg-loss/10 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-loss transition hover:bg-loss/20"
        >
          Cancel
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
          <AlertDialogDescription>
            {partial
              ? `${row.filled}% has already been filled. Cancelling only removes the unfilled portion — the filled part stays as a position.`
              : "The order will be removed from the book."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="rounded-xl border border-border bg-white/[0.02] p-3 font-mono text-[11px]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-foreground">{row.market}</span>
            <OutcomeTag
              outcome={row.outcome}
              label={row.outcomeLabel}
              eventShape={row.eventShape}
            />
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-[10px]">
            <Kv k="Type" v={row.type.toUpperCase()} />
            <Kv k="Price" v={`${row.price}¢`} />
            <Kv k="Size" v={`${row.size}`} />
            <Kv k="Filled" v={`${row.filled}%`} />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep order</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-loss text-background hover:bg-loss/90"
          >
            Cancel order
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function EditTpslDialog({
  row,
  open,
  onOpenChange,
  onSave,
}: {
  row: PositionRowData;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (next: { tp: number | null; sl: number | null }) => void;
}) {
  const [tp, setTp] = useState(row.tp != null ? String(row.tp) : "");
  const [sl, setSl] = useState(row.sl != null ? String(row.sl) : "");
  const tpNum = tp === "" ? null : Number(tp);
  const slNum = sl === "" ? null : Number(sl);
  const notional = row.margin * row.leverage;
  const fee = notional * 0.002;

  const validation = useMemo(
    () =>
      validateTpSl({
        side: row.outcome,
        entry: row.entry,
        liq: row.liq,
        leverage: row.leverage,
        tp: tpNum,
        sl: slNum,
      }),
    [row, tpNum, slNum],
  );
  const preview = useMemo(
    () =>
      previewTpSlPnl({
        side: row.outcome,
        entry: row.entry,
        liq: row.liq,
        leverage: row.leverage,
        tp: tpNum,
        sl: slNum,
        notional,
        fee,
      }),
    [row, tpNum, slNum, notional, fee],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust TP / SL</DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[10px] uppercase tracking-widest">
            <OutcomeTag
              outcome={row.outcome}
              label={row.outcomeLabel}
              eventShape={row.eventShape}
            />
            <span>entry {row.entry}¢</span>
            <span className="opacity-50">·</span>
            <span>mark {row.mark}¢</span>
            {row.leverage > 1 && (
              <>
                <span className="opacity-50">·</span>
                <span className="text-loss">liq {row.liq}¢</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <TpSlField
              label="TP (¢)"
              value={tp}
              onChange={setTp}
              error={validation.tpError}
              tone="win"
            />
            <TpSlField
              label="SL (¢)"
              value={sl}
              onChange={setSl}
              error={validation.slError}
              tone="loss"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <PreviewBox label="If TP hits" pnl={preview.tpPnl} />
            <PreviewBox label="If SL hits" pnl={preview.slPnl} />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <button
            type="button"
            onClick={() => onSave({ tp: null, sl: null })}
            disabled={row.tp == null && row.sl == null}
            className="mr-auto rounded-md border border-border bg-white/[0.04] px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest text-muted-foreground transition hover:text-foreground disabled:opacity-40"
          >
            Remove
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-md border border-border bg-transparent px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest text-muted-foreground transition hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave({ tp: tpNum, sl: slNum })}
            disabled={validation.hasError}
            className="rounded-md bg-primary px-3 py-1.5 text-[11px] font-display font-semibold uppercase tracking-widest text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
          >
            Save
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TpSlField({
  label,
  value,
  onChange,
  error,
  tone,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error: string | null;
  tone: "win" | "loss";
}) {
  return (
    <div className="space-y-1">
      <label
        className={cn(
          "flex items-center justify-between rounded-xl border bg-white/[0.02] px-3 py-2",
          error ? "border-loss/60" : "border-border",
        )}
      >
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="—"
          inputMode="decimal"
          className={cn(
            "w-20 bg-transparent text-right font-mono text-sm tabular-nums outline-none placeholder:text-muted-foreground",
            error
              ? "text-loss"
              : tone === "win"
                ? "text-win"
                : "text-loss",
          )}
        />
      </label>
      {error && (
        <p className="px-1 text-[10px] font-mono text-loss">{error}</p>
      )}
    </div>
  );
}

function PreviewBox({ label, pnl }: { label: string; pnl: number | null }) {
  return (
    <div className="rounded-lg bg-white/[0.03] px-2.5 py-1.5">
      <div className="text-muted-foreground uppercase tracking-widest">{label}</div>
      <div
        className={cn(
          "mt-0.5 tabular-nums",
          pnl !== null ? (pnl >= 0 ? "text-win" : "text-loss") : "text-muted-foreground/50",
        )}
      >
        {pnl !== null ? `${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} USDC` : "—"}
      </div>
    </div>
  );
}

function Kv({
  k,
  v,
  tone,
}: {
  k: string;
  v: string;
  tone?: "win" | "loss";
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{k}</span>
      <span
        className={cn(
          "tabular-nums",
          tone === "win" ? "text-win" : tone === "loss" ? "text-loss" : "text-foreground",
        )}
      >
        {v}
      </span>
    </div>
  );
}