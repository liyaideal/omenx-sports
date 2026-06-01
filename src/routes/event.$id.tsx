import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/sports/dashboard/AppShell";
import { AppTopBar } from "@/components/sports/dashboard/AppTopBar";
import { TradeForm, type PlacedOrder } from "@/components/sports/TradeForm";
import {
  deriveTradeFormProps,
  TradeOutcomePicker,
} from "@/components/sports/trade/TradeOutcomePicker";
import { EventOutcomesPanel } from "@/components/sports/event/EventOutcomesPanel";
import { EventLiveStage, useStageOffscreen } from "@/components/sports/event/EventLiveStage";
import { StageTabs, type StageTab } from "@/components/sports/event/StageTabs";
import { MobileTradeBar } from "@/components/sports/event/MobileTradeBar";
import { useLiveStream } from "@/components/sports/live/LiveStreamProvider";
import { RelatedMarketsBar } from "@/components/sports/event/RelatedMarketsBar";
import { LiveTape } from "@/components/sports/event/LiveTape";
import { PreMatchStrip } from "@/components/sports/event/PreMatchStrip";
import { ShareButton } from "@/components/sports/event/ShareButton";
import { getRelatedMarkets } from "@/components/sports/event/related-markets";
import {
  PositionsTable,
  type PositionRowData,
  type OrderRowData,
  type HistoryRowData,
} from "@/components/sports/PositionsTable";
import { ACCOUNT_STATS, getMarketById, type SportsMarket } from "@/data/sports-markets";

export const Route = createFileRoute("/event/$id")({
  loader: ({ params }) => {
    const market = getMarketById(params.id);
    if (!market) throw notFound();
    return { market };
  },
  head: ({ loaderData }) => {
    const m = loaderData?.market;
    const title = m ? `${m.title} — OmenX Sports` : "Event — OmenX Sports";
    const desc = m
      ? `Trade ${m.title}. ${m.league.name} · Volume ${m.volume} · Ends ${m.endsLabel}.`
      : "Trade sports prediction markets on OmenX.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  notFoundComponent: NotFoundComponent,
  errorComponent: EventErrorComponent,
  component: EventTradePage,
});

function NotFoundComponent() {
  return (
    <AppShell>
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Event not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We couldn't find this market. It may have been removed or never existed.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-4 py-2 text-sm font-medium hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
      </div>
    </AppShell>
  );
}

function EventErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <AppShell>
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-loss">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => {
            reset();
            router.invalidate();
          }}
          className="mt-6 rounded-full bg-white/[0.06] px-4 py-2 text-sm font-medium hover:bg-white/10"
        >
          Retry
        </button>
      </div>
    </AppShell>
  );
}


function clampPct(v: number): number {
  return Math.max(1, Math.min(99, v));
}

function leagueKeyFromShort(short: string): PositionRowData["league"] {
  const s = short.toUpperCase();
  if (s === "EPL") return "epl";
  if (s === "LL") return "laliga";
  if (s === "UCL") return "ucl";
  if (s === "SA") return "seriea";
  if (s === "NBA") return "nba";
  return "epl";
}

/**
 * Seed mock positions/orders/history rows tied to the current market so
 * every visitor sees populated tables on first load. These are deterministic
 * by market id (same market → same rows) and live alongside any new orders
 * the user actually places.
 */
function buildSeed(
  market: SportsMarket,
  league: PositionRowData["league"],
): {
  positions: PositionRowData[];
  orders: OrderRowData[];
  history: HistoryRowData[];
} {
  const first = market.outcomes[0];
  const second = market.outcomes[1] ?? market.outcomes[0];
  const firstPx = Math.round(first.price * 100);
  const secondPx = Math.round(second.price * 100);
  const firstLabel = first.team?.name ?? first.label;
  const secondLabel = second.team?.name ?? second.label;

  const positions: PositionRowData[] = [
    {
      market: market.title,
      league,
      outcome: "yes",
      outcomeLabel: firstLabel,
      size: 180,
      entry: clampPct(firstPx - 4),
      mark: firstPx,
      leverage: 3,
      mode: "cross",
      margin: 60,
      liq: clampPct(firstPx - 18),
      pnl: 0,
    },
    {
      market: market.title,
      league,
      outcome: "no",
      outcomeLabel: secondLabel,
      size: 90,
      entry: clampPct(secondPx + 3),
      mark: secondPx,
      leverage: 1,
      mode: "isolated",
      margin: 27,
      liq: 99,
      pnl: 0,
    },
  ];

  const orders: OrderRowData[] = [
    {
      market: market.title,
      league,
      outcome: "yes",
      outcomeLabel: firstLabel,
      type: "limit",
      price: clampPct(firstPx - 6),
      size: 120,
      filled: 25,
    },
    {
      market: market.title,
      league,
      outcome: "no",
      outcomeLabel: secondLabel,
      type: "limit",
      price: clampPct(secondPx - 4),
      size: 80,
      filled: 0,
    },
  ];

  const history: HistoryRowData[] = [
    {
      market: market.title,
      league,
      outcome: "yes",
      outcomeLabel: firstLabel,
      action: "fill",
      price: clampPct(firstPx - 4),
      size: 180,
      when: "1h ago",
    },
    {
      market: market.title,
      league,
      outcome: "no",
      outcomeLabel: secondLabel,
      action: "close",
      price: clampPct(secondPx + 5),
      size: 60,
      pnl: 8.4,
      when: "Yesterday",
    },
    {
      market: market.title,
      league,
      outcome: "yes",
      outcomeLabel: firstLabel,
      action: "close",
      price: clampPct(firstPx - 9),
      size: 75,
      pnl: -5.2,
      when: "2d ago",
    },
  ];

  return { positions, orders, history };
}
function EventTradePage() {
  const { market } = Route.useLoaderData();
  // Related markets for the same fixture (BTTS, O/U, scorer, cards). Chip
  // index 0 is always the originally loaded market; other indexes swap the
  // chart / order book / trade form in-page without navigation.
  const relatedMarkets = useMemo(() => getRelatedMarkets(market), [market]);
  const [activeRelatedIdx, setActiveRelatedIdx] = useState(0);
  const active = relatedMarkets[activeRelatedIdx] ?? market;
  // For binary 2-outcome markets, treat outcomes[0] = YES, outcomes[1] = NO.
  // For three-way markets, expose all 3 outcomes and let the user pick one;
  // internally we still map the selected one to the YES side of the trade form.
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = active.outcomes[selectedIdx] ?? active.outcomes[0];

  // Honor deep-link ?outcome=…: when the URL carries an outcome id that
  // exists on the active market, pre-select it on mount and after market
  // switches.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const want = sp.get("outcome");
    if (!want) return;
    const idx = active.outcomes.findIndex((o) => o.id === want);
    if (idx >= 0) setSelectedIdx(idx);
  }, [active]);

  // Reset outcome selection when the user pivots to a different related
  // market — outcome ids don't carry across markets.
  useEffect(() => {
    setSelectedIdx(0);
  }, [activeRelatedIdx]);

  // YES/NO side toggle for 3+ outcome markets — mirrors the drawer.
  const [tradeSide, setTradeSide] = useState<"yes" | "no">("yes");
  useEffect(() => {
    setTradeSide("yes");
  }, [selected?.id]);
  const { formOutcome, formLabel, formPrice } = deriveTradeFormProps({
    market: active,
    outcomeId: selected?.id,
    side: tradeSide,
  });

  // Persist positions/orders placed from this trade form for the lifetime of
  // the page. PnL recomputes from a live "mark" that jitters around the
  // selected outcome's price every second so the user sees motion.
  const [positions, setPositions] = useState<PositionRowData[]>([]);
  const [orders, setOrders] = useState<OrderRowData[]>([]);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const league = leagueKeyFromShort(active.league.short);
  const currentPx = Math.round(selected.price * 100);

  // Seed a couple of mock positions/orders/history rows for this market so
  // every visitor sees the table styling on first load, even before placing
  // a trade.
  const seeded = useMemo(() => buildSeed(active, league), [active, league]);
  const [seedPositions] = useState<PositionRowData[]>(seeded.positions);
  const [seedOrders] = useState<OrderRowData[]>(seeded.orders);
  const history = seeded.history;

  // Apply a tiny live jitter so PnL updates every tick.
  const livePositions = useMemo<PositionRowData[]>(() => {
    return [...positions, ...seedPositions].map((p, i) => {
      const jitter = Math.sin((tick + i * 7) / 3) * 1.4;
      const mark = clampPct(p.entry + jitter);
      const sign = p.outcome === "yes" ? 1 : -1;
      const notional = p.margin * p.leverage;
      const pnl = (mark / 100 - p.entry / 100) * notional * sign;
      return { ...p, mark: Math.round(mark * 10) / 10, pnl: Math.round(pnl * 100) / 100 };
    });
  }, [positions, seedPositions, tick]);

  const allOrders = useMemo<OrderRowData[]>(
    () => [...orders, ...seedOrders],
    [orders, seedOrders],
  );

  // Live-stream wiring — only the streaming events get the broadcast
  // stage + sticky floating mini player.
  const isLive = Boolean(market.isLiveStream && market.fixture && market.liveScore);
  const isPreMatch = !isLive && Boolean(market.fixture);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const tradeFormRef = useRef<HTMLDivElement | null>(null);
  const offscreen = useStageOffscreen(stageRef);
  const scrollToTradeForm = useCallback(() => {
    tradeFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  // Pulse the right-column TradeForm once whenever a row-level Buy button is
  // pressed, so the eye is drawn to the now-preselected ticket. Also scrolls
  // into view on mobile/below-lg where the form is not sticky beside it.
  const [pulseKey, setPulseKey] = useState(0);
  const handleBuyFromRow = useCallback(
    (idx: number, side: "yes" | "no") => {
      setSelectedIdx(idx);
      setTradeSide(side);
      setPulseKey((k) => k + 1);
      if (typeof window !== "undefined") {
        const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
        if (!isDesktop) scrollToTradeForm();
      }
    },
    [scrollToTradeForm],
  );
  useEffect(() => {
    if (pulseKey === 0) return;
    const t = setTimeout(() => setPulseKey(0), 700);
    return () => clearTimeout(t);
  }, [pulseKey]);

  // Global live-stream session — keeps the floating player + fullscreen
  // overlay alive across route navigation.
  const live = useLiveStream();
  // Start watching whenever we land on a live event page.
  useEffect(() => {
    if (isLive) {
      live.startWatching(market.id, selected?.id);
    }
    // We intentionally don't stop on unmount — the mini player should keep
    // following the user. Users dismiss it explicitly from the player UI.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive, market.id]);
  // Keep outcome selection synced both ways.
  useEffect(() => {
    if (isLive && selected?.id) live.setOutcome(selected.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id, isLive]);
  // Mirror Stage visibility into the provider's `minimized` flag so the
  // mini player only shows once the Stage has scrolled out of view.
  useEffect(() => {
    if (!isLive) return;
    live.setMinimized(offscreen);
  }, [offscreen, isLive, live]);

  const handlePlaceOrder = (order: PlacedOrder) => {
    if (order.type === "limit" && order.side === "buy" && order.price !== currentPx) {
      // Limit buy below/above mark → resting open order.
      setOrders((prev) => [
        {
          market: active.title,
          league,
          outcome: order.outcome,
          outcomeLabel: order.outcomeLabel,
          type: "limit",
          price: order.price,
          size: Math.round(order.shares),
          filled: 0,
        },
        ...prev,
      ]);
      return;
    }
    setPositions((prev) => [
      {
        market: active.title,
        league,
        outcome: order.outcome,
        outcomeLabel: order.outcomeLabel,
        size: Math.round(order.shares),
        entry: order.price,
        mark: order.price,
        leverage: order.leverage,
        mode: "cross",
        margin: order.margin,
        liq: order.liq,
        pnl: 0,
      },
      ...prev,
    ]);
  };

  return (
    <AppShell>
      <AppTopBar
        userName="Jeremy"
        userAvatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces&q=80"
        equity={ACCOUNT_STATS.available}
      />

      <div className="grid gap-5 px-6 pb-10 pt-6 md:px-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-5">
          <EventDetailHeader
            market={active}
            outcomeId={selected?.id}
          />
          {isPreMatch && <PreMatchStrip market={market} />}
          {isLive ? (
            <StageTabs
              defaultTabId="stream"
              tabs={[
                {
                  id: "stream",
                  label: "Stream",
                  badge: (
                    <span className="ml-1 inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--accent)] shadow-[0_0_8px_var(--accent)]" />
                  ),
                  content: (
                    <EventLiveStage
                      market={market}
                      selected={selected}
                      stageRef={stageRef}
                      onFullscreen={live.openFullscreen}
                    />
                  ),
                },
                {
                  id: "markets",
                  label: "Markets",
                  content: (
                    <EventOutcomesPanel
                      market={active}
                      selectedIdx={selectedIdx}
                      tradeSide={tradeSide}
                      onSelect={setSelectedIdx}
                      onSideSelect={handleBuyFromRow}
                    />
                  ),
                },
              ] satisfies StageTab[]}
            />
          ) : (
            <EventOutcomesPanel
              market={active}
              selectedIdx={selectedIdx}
              tradeSide={tradeSide}
              onSelect={setSelectedIdx}
              onSideSelect={handleBuyFromRow}
            />
          )}
          <LiveTape market={active} />
        </div>

        <div
          ref={tradeFormRef}
          className="space-y-3 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-1 lg:[scrollbar-gutter:stable]"
        >
          <div className="rounded-2xl border border-border bg-surface p-3 shadow-card lg:sticky lg:top-0 lg:z-10">
            <TradeOutcomePicker
              market={active}
              outcomeId={selected?.id}
              onOutcomeChange={(id) => {
                const idx = active.outcomes.findIndex((o) => o.id === id);
                if (idx >= 0) setSelectedIdx(idx);
              }}
              side={tradeSide}
              onSideChange={setTradeSide}
            />
          </div>
          <TradeForm
            key={`${active.id}-${selected?.id}-${tradeSide}`}
            className={cn(pulseKey > 0 && "animate-trade-pulse")}
            outcome={formOutcome}
            outcomeLabel={formLabel}
            price={formPrice}
            onPlaceOrder={handlePlaceOrder}
          />
        </div>
      </div>

      <div className="space-y-5 px-6 pb-28 md:px-8 lg:pb-12">
        <RelatedMarketsBar
          markets={relatedMarkets}
          activeIdx={activeRelatedIdx}
          onSelect={setActiveRelatedIdx}
        />
        <PositionsTable positions={livePositions} orders={allOrders} history={history} />
      </div>

      {/* Mobile-only sticky trade bar — desktop already has the
          right-column sticky TradeForm. */}
      <MobileTradeBar market={active} selected={selected} onOpenForm={scrollToTradeForm} />
    </AppShell>
  );
}

function EventDetailHeader({
  market,
  outcomeId,
}: {
  market: SportsMarket;
  outcomeId?: string;
}) {
  const fixture = market.fixture;
  return (
    <header className="relative overflow-hidden rounded-3xl border border-border bg-surface bg-ambient shadow-card">
      {/* Ambient orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/15 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary/10 blur-[100px]"
      />

      {/* Top-right share */}
      <div className="absolute right-4 top-4 z-10">
        <ShareButton outcomeId={outcomeId} />
      </div>

      <div className="relative flex flex-col items-stretch md:flex-row">
        {/* Left: fixture + share */}
        <div className="flex flex-1 flex-col">
          {fixture ? (
            <div className="flex min-h-[176px] items-center justify-around gap-6 px-8 py-8 md:px-12 md:py-10">
              <CrestBlock name={fixture.home.name} logo={fixture.home.logo} />
              <div className="flex flex-col items-center">
                <div className="relative py-1">
                  <span className="select-none font-serif-display text-5xl italic leading-none tracking-tighter text-foreground/[0.06]">
                    vs
                  </span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-10 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />
                  </div>
                </div>
                <div className="mt-3 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5">
                  <span className="whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                    {fixture.kickoff} · {fixture.whenLabel}
                  </span>
                </div>
              </div>
              <CrestBlock name={fixture.away.name} logo={fixture.away.logo} />
            </div>
          ) : (
            <div className="flex min-h-[176px] flex-col items-center justify-center px-8 py-8 text-center md:px-12 md:py-10">
              <h1 className="font-display text-2xl font-bold text-foreground">{market.title}</h1>
              <div className="mt-1 text-sm text-muted-foreground">{market.league.name}</div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          aria-hidden
          className="hidden w-px bg-gradient-to-b from-transparent via-white/10 to-transparent md:my-8 md:block"
        />

        {/* Right: stats panel */}
        <div className="flex w-full flex-row justify-around gap-6 border-t border-white/5 bg-white/[0.01] px-8 py-5 md:w-52 md:flex-col md:justify-center md:gap-5 md:border-t-0 md:px-7 md:py-8">
          <StatBlock label="Total Volume" value={market.volume} />
          <StatBlock
            label="Live Players"
            value={market.participants.toLocaleString()}
            pulse
          />
        </div>
      </div>

      {/* Bottom accent trim */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </header>
  );
}

function StatBlock({
  label,
  value,
  pulse,
}: {
  label: string;
  value: string;
  pulse?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {pulse ? (
          <span
            aria-hidden
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-win shadow-[0_0_10px_currentColor]"
          />
        ) : null}
        <p className="font-mono text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/70">
          {label}
        </p>
      </div>
      <p className="font-mono text-lg font-medium tracking-tight text-foreground tabular-nums">
        {value}
      </p>
    </div>
  );
}

function CrestBlock({ name, logo }: { name: string; logo: string }) {
  return (
    <div className="group flex flex-col items-center gap-4">
      <div className="relative">
        <div className="absolute inset-0 scale-125 rounded-full bg-primary/30 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
        <div className="relative grid h-20 w-28 place-items-center overflow-hidden rounded-xl bg-white/[0.04] p-3 shadow-2xl ring-1 ring-white/15 transition-transform duration-300 group-hover:scale-105">
          <img src={logo} alt={name} className="h-full w-full object-contain" />
        </div>
      </div>
      <div className="max-w-[140px] text-center font-display text-[12px] font-black uppercase tracking-[0.22em] text-foreground/90">
        {name}
      </div>
    </div>
  );
}

