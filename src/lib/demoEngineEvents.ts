/**
 * Mapping from local SportsMarket ids to the main-site `events` table +
 * hooks that stream live prices and open positions from the OmenX demo
 * engine. See `demoEngine.ts` for the client and boundary contract.
 */
import { useEffect, useMemo, useState } from "react";
import { demoEngine, fetchOpenPositions, type DemoOpenPosition } from "./demoEngine";

export interface DemoEventMapping {
  marketId: string; // local SportsMarket.id
  eventId: string; // main-site events.id
  eventName: string; // main-site events.name (used in trades/positions)
  /** Which local outcome id maps to which main-site option id. */
  outcomes: Record<string, { optionId: string; optionLabel: "Yes" | "No" }>;
}

export const DEMO_EVENT_MAPPINGS: DemoEventMapping[] = [
  {
    marketId: "wc26-semi-fra-esp",
    eventId: "wc26-semi-fra-esp",
    eventName: "World Cup 2026 Semifinal: France vs Spain?",
    outcomes: {
      h: { optionId: "wc26-semi-fra-esp-yes", optionLabel: "Yes" },
      a: { optionId: "wc26-semi-fra-esp-no", optionLabel: "No" },
    },
  },
  {
    marketId: "wc26-semi-arg-eng",
    eventId: "wc26-semi-arg-eng",
    eventName: "World Cup 2026 Semifinal: Argentina vs England?",
    outcomes: {
      h: { optionId: "wc26-semi-arg-eng-yes", optionLabel: "Yes" },
      a: { optionId: "wc26-semi-arg-eng-no", optionLabel: "No" },
    },
  },
];

export function getMappingByMarketId(id: string): DemoEventMapping | null {
  return DEMO_EVENT_MAPPINGS.find((m) => m.marketId === id) ?? null;
}

export function isDemoEngineMarket(id: string): boolean {
  return !!getMappingByMarketId(id);
}

export interface LivePrices {
  loading: boolean;
  /** Map of main-site option id → 0..1 price. */
  byOptionId: Record<string, number>;
  /** Convenience: map of local outcome id → 0..1 price. */
  byOutcomeId: Record<string, number>;
  error: string | null;
}

/**
 * Live prices for a mapped SportsMarket. Uses Supabase Realtime with a
 * 60s polling fallback. Returns loading + prices in both id spaces.
 */
export function useLiveOutcomePrices(marketId: string | null | undefined): LivePrices {
  const mapping = marketId ? getMappingByMarketId(marketId) : null;
  const [state, setState] = useState<LivePrices>({
    loading: !!mapping,
    byOptionId: {},
    byOutcomeId: {},
    error: null,
  });

  useEffect(() => {
    if (!mapping) {
      setState({ loading: false, byOptionId: {}, byOutcomeId: {}, error: null });
      return;
    }

    let cancelled = false;

    const apply = (
      rows: Array<{ id: string; price: number }>,
      partial = false,
    ) => {
      setState((prev) => {
        const byOptionId = partial ? { ...prev.byOptionId } : {};
        for (const r of rows) byOptionId[r.id] = Number(r.price);
        const byOutcomeId: Record<string, number> = {};
        for (const [outcomeId, o] of Object.entries(mapping.outcomes)) {
          if (byOptionId[o.optionId] != null)
            byOutcomeId[outcomeId] = byOptionId[o.optionId];
        }
        return { loading: false, byOptionId, byOutcomeId, error: null };
      });
    };

    const load = async () => {
      const { data, error } = await demoEngine
        .from("event_options")
        .select("id, price")
        .eq("event_id", mapping.eventId);
      if (cancelled) return;
      if (error) {
        setState((s) => ({ ...s, loading: false, error: error.message }));
        return;
      }
      apply((data ?? []) as Array<{ id: string; price: number }>);
    };

    load();
    const poll = window.setInterval(load, 60_000);

    const channel = demoEngine
      .channel(`event_options:${mapping.eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_options",
          filter: `event_id=eq.${mapping.eventId}`,
        },
        (payload) => {
          const row = payload.new as { id: string; price: number } | null;
          if (row && row.id && row.price != null) apply([row], true);
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      window.clearInterval(poll);
      demoEngine.removeChannel(channel);
    };
  }, [mapping]);

  return state;
}

/**
 * Live mark prices for a set of option ids — used by the positions view
 * so PnL updates as prices move.
 */
export function useLiveMarkPrices(optionIds: string[]): Record<string, number> {
  const key = optionIds.slice().sort().join(",");
  const [prices, setPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!optionIds.length) return;
    let cancelled = false;

    const load = async () => {
      const { data, error } = await demoEngine
        .from("event_options")
        .select("id, price")
        .in("id", optionIds);
      if (cancelled || error) return;
      const next: Record<string, number> = {};
      for (const r of data ?? []) next[(r as any).id] = Number((r as any).price);
      setPrices(next);
    };
    load();
    const poll = window.setInterval(load, 60_000);

    const channel = demoEngine
      .channel(`positions-marks:${key}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "event_options" },
        (payload) => {
          const row = payload.new as { id: string; price: number } | null;
          if (!row) return;
          if (!optionIds.includes(row.id)) return;
          setPrices((prev) => ({ ...prev, [row.id]: Number(row.price) }));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      window.clearInterval(poll);
      demoEngine.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return prices;
}

export interface OpenPositionsState {
  loading: boolean;
  error: string | null;
  positions: DemoOpenPosition[];
  refetch: () => Promise<void>;
}

export function useOpenPositions(userId: string | null): OpenPositionsState {
  const [positions, setPositions] = useState<DemoOpenPosition[]>([]);
  const [loading, setLoading] = useState(!!userId);
  const [error, setError] = useState<string | null>(null);

  const load = useMemo(
    () => async () => {
      if (!userId) {
        setPositions([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const rows = await fetchOpenPositions(userId);
        setPositions(rows);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    load();
  }, [load]);

  return { loading, error, positions, refetch: load };
}