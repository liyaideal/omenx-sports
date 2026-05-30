import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { TradeDrawer } from "./TradeDrawer";
import { getMarketById } from "@/data/sports-markets";

/**
 * Selection contract — minimal so any caller can fire `openTrade` with
 * just a market id and optional pre-selected outcome.
 */
export interface TradeSelection {
  marketId: string;
  /** Pre-selected outcome id (matches `Outcome.id`). If omitted, the drawer
   *  opens on the highest-priced outcome. */
  outcomeId?: string;
}

interface TradeDrawerCtx {
  open: boolean;
  selection: TradeSelection | null;
  openTrade: (sel: TradeSelection) => void;
  closeTrade: () => void;
  setOutcome: (outcomeId: string) => void;
}

const Ctx = createContext<TradeDrawerCtx | null>(null);

/**
 * Wrap any subtree (typically the app root) to expose a global sticky
 * trade drawer. Components call `useTradeDrawer().openTrade({ marketId })`
 * to slide it in; the drawer persists across route navigation because the
 * provider lives above `<Outlet />`.
 */
export function TradeDrawerProvider({ children }: { children: React.ReactNode }) {
  const [selection, setSelection] = useState<TradeSelection | null>(null);
  const [open, setOpen] = useState(false);

  const openTrade = useCallback((sel: TradeSelection) => {
    setSelection(sel);
    setOpen(true);
  }, []);

  const closeTrade = useCallback(() => {
    setOpen(false);
    // Keep the last selection around for a moment so the closing animation
    // doesn't flicker the panel to empty.
    window.setTimeout(() => setSelection(null), 250);
  }, []);

  const setOutcome = useCallback((outcomeId: string) => {
    setSelection((s) => (s ? { ...s, outcomeId } : s));
  }, []);

  const value = useMemo<TradeDrawerCtx>(
    () => ({ open, selection, openTrade, closeTrade, setOutcome }),
    [open, selection, openTrade, closeTrade, setOutcome],
  );

  const market = selection ? getMarketById(selection.marketId) ?? null : null;

  return (
    <Ctx.Provider value={value}>
      {children}
      <TradeDrawer
        open={open}
        market={market}
        outcomeId={selection?.outcomeId}
        onOpenChange={(o) => (o ? setOpen(true) : closeTrade())}
        onOutcomeChange={setOutcome}
      />
    </Ctx.Provider>
  );
}

export function useTradeDrawer(): TradeDrawerCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Soft fallback so component trees rendered outside the provider (e.g.
    // isolated stories) still mount without crashing.
    return {
      open: false,
      selection: null,
      openTrade: () => {},
      closeTrade: () => {},
      setOutcome: () => {},
    };
  }
  return ctx;
}