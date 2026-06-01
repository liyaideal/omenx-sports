import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrderBook } from "@/components/sports/OrderBook";
import { DrawIcon, isDrawOutcome } from "@/components/sports/draw";
import {
  CombinedPriceChart,
  outcomeColor,
} from "@/components/sports/event/CombinedPriceChart";
import type { Outcome, SportsMarket } from "@/data/sports-markets";

/**
 * Polymarket-style outcomes panel used at the heart of `/event/$id`.
 *
 * Top: a combined multi-line price chart that overlays every outcome on one
 * canvas. Bottom: a tappable list of outcomes — each row has the outcome
 * glyph, current %, 24h delta, and quick "Buy YES / Buy NO" buttons that
 * preselect the page's right-column sticky TradeForm. Clicking the row body
 * toggles an inline OrderBook accordion underneath (one open at a time).
 *
 * Same data + same downstream logic as the prior chart/orderbook tab
 * layout — only the spatial arrangement changed.
 */
export interface EventOutcomesPanelProps {
  market: SportsMarket;
  selectedIdx: number;
  tradeSide: "yes" | "no";
  onSelect: (idx: number) => void;
  onSideSelect: (idx: number, side: "yes" | "no") => void;
}

export function EventOutcomesPanel({
  market,
  selectedIdx,
  tradeSide,
  onSelect,
  onSideSelect,
}: EventOutcomesPanelProps) {
  const [expandedIdx, setExpandedIdx] = useState<number>(selectedIdx);
  useEffect(() => {
    // When the selected outcome changes upstream (deep link, related market
    // pivot), follow it so the expanded book matches the trade form target.
    setExpandedIdx(selectedIdx);
  }, [selectedIdx]);

  const selected = market.outcomes[selectedIdx] ?? market.outcomes[0];

  return (
    <div className="space-y-4">
      <CombinedPriceChart
        market={market}
        highlightedOutcomeId={selected?.id}
        onLegendSelect={(id) => {
          const idx = market.outcomes.findIndex((o) => o.id === id);
          if (idx >= 0) onSelect(idx);
        }}
      />

      <div className="rounded-2xl border border-border bg-surface shadow-card">
        <div className="flex items-center justify-between px-4 pt-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <span>Markets</span>
          <span>{market.outcomes.length} markets</span>
        </div>
        <div className="divide-y divide-border/70">
          {market.outcomes.map((o, idx) => (
            <OutcomeRow
              key={o.id}
              outcome={o}
              idx={idx}
              selected={idx === selectedIdx}
              expanded={idx === expandedIdx}
              activeSide={idx === selectedIdx ? tradeSide : undefined}
              onToggleExpand={() =>
                setExpandedIdx((prev) => (prev === idx ? -1 : idx))
              }
              onBuy={(side) => onSideSelect(idx, side)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function OutcomeRow({
  outcome,
  idx,
  selected,
  expanded,
  activeSide,
  onToggleExpand,
  onBuy,
}: {
  outcome: Outcome;
  idx: number;
  selected: boolean;
  expanded: boolean;
  activeSide?: "yes" | "no";
  onToggleExpand: () => void;
  onBuy: (side: "yes" | "no") => void;
}) {
  const cents = Math.round(outcome.price * 100);
  const noCents = 100 - cents;
  const delta = typeof outcome.delta24h === "number" ? Math.round(outcome.delta24h * 100) : 0;
  const label = outcome.team?.name ?? outcome.label;
  const color = outcomeColor(outcome, idx);

  return (
    <div className={cn(selected ? "bg-primary/[0.06]" : undefined)}>
      <div
        role="button"
        tabIndex={0}
        onClick={onToggleExpand}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggleExpand();
          }
        }}
        aria-expanded={expanded}
        className={cn(
          "group flex w-full cursor-pointer items-center gap-4 px-4 py-3 text-left transition outline-none",
          "hover:bg-white/[0.03] focus-visible:ring-2 focus-visible:ring-primary/40",
        )}
      >
        {/* Left: glyph + name */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <Glyph outcome={outcome} color={color} />
          <div className="min-w-0">
            <div className="truncate font-display text-sm font-semibold text-foreground">
              {label}
            </div>
            {outcome.meta && (
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {outcome.meta}
              </div>
            )}
          </div>
        </div>

        {/* Middle: big % + Δ24h */}
        <div className="flex w-24 items-baseline justify-end gap-1.5">
          <span className="font-display text-2xl font-bold tabular-nums text-foreground">
            {cents}
            <span className="text-sm text-muted-foreground">¢</span>
          </span>
          <span
            className={cn(
              "inline-block w-10 text-right font-mono text-[10px] tabular-nums",
              delta > 0 && "text-win",
              delta < 0 && "text-loss",
              delta === 0 && "text-muted-foreground",
            )}
          >
            {delta > 0
              ? `▲${delta}¢`
              : delta < 0
                ? `▼${Math.abs(delta)}¢`
                : `—0¢`}
          </span>
        </div>

        {/* Right: Buy YES / Buy NO */}
        <div className="flex shrink-0 items-center gap-2">
          <BuyButton
            side="yes"
            cents={cents}
            active={selected && activeSide === "yes"}
            onClick={(e) => {
              e.stopPropagation();
              onBuy("yes");
            }}
          />
          <BuyButton
            side="no"
            cents={noCents}
            active={selected && activeSide === "no"}
            onClick={(e) => {
              e.stopPropagation();
              onBuy("no");
            }}
          />
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              expanded && "rotate-180 text-foreground",
            )}
          />
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4">
          <OrderBook
            mark={cents}
            sideLabels={{ yes: `${label} YES`, no: `${label} NO` }}
          />
        </div>
      )}
    </div>
  );
}

function Glyph({ outcome, color }: { outcome: Outcome; color: string }) {
  if (outcome.team) {
    return (
      <div
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[0.05] p-1 ring-1 ring-white/10"
        style={{ boxShadow: `0 0 14px -4px ${color}` }}
      >
        <img src={outcome.team.logo} alt="" className="h-full w-full object-contain" />
      </div>
    );
  }
  if (isDrawOutcome(outcome)) {
    return (
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
        style={{
          background: `color-mix(in oklab, ${color} 18%, transparent)`,
          color,
          boxShadow: `0 0 12px -4px ${color}`,
        }}
      >
        <DrawIcon className="h-4 w-4" />
      </span>
    );
  }
  const initial = outcome.label.charAt(0).toUpperCase();
  return (
    <span
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full font-mono text-[11px] font-bold"
      style={{
        background: `color-mix(in oklab, ${color} 18%, transparent)`,
        color,
        boxShadow: `0 0 12px -4px ${color}`,
      }}
    >
      {initial}
    </span>
  );
}

function BuyButton({
  side,
  cents,
  active,
  onClick,
}: {
  side: "yes" | "no";
  cents: number;
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  const isYes = side === "yes";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-w-[68px] rounded-md px-3 py-1.5 text-center font-mono text-[11px] font-semibold uppercase tracking-widest transition",
        isYes
          ? active
            ? "bg-win text-background ring-1 ring-win"
            : "bg-win/15 text-win ring-1 ring-win/30 hover:bg-win/25"
          : active
            ? "bg-loss text-background ring-1 ring-loss"
            : "bg-loss/15 text-loss ring-1 ring-loss/30 hover:bg-loss/25",
      )}
    >
      <span>{isYes ? "YES" : "NO"}</span>
      <span className="ml-1.5 tabular-nums opacity-80">{cents}¢</span>
    </button>
  );
}