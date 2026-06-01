import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/sports/dashboard/AppShell";
import { AppTopBar } from "@/components/sports/dashboard/AppTopBar";
import { LeagueChip } from "@/components/sports/LeagueBadge";
import { TradeForm, type PlacedOrder } from "@/components/sports/TradeForm";
import { deriveTradeFormProps } from "@/components/sports/trade/TradeOutcomePicker";
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
import { ACCOUNT_STATS, getMarketById, type SportsMarket, type Outcome } from "@/data/sports-markets";

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


function getOutcomeLabel(o: Outcome): string {
  return o.team?.name ?? o.label;
}

function getSideLabels(market: SportsMarket): { yes: string; no: string } | undefined {
  if (market.outcomes.length !== 2) return undefined;
  return {
    yes: getOutcomeLabel(market.outcomes[0]),
    no: getOutcomeLabel(market.outcomes[1]),
  };
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 100;
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

  // For OutcomeSelector tone wiring (binary only)
  const binaryTone: "yes" | "no" = selectedIdx === 0 ? "yes" : "no";
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
            selectedIdx={selectedIdx}
            onSelect={setSelectedIdx}
            outcomeId={selected?.id}
          />
          <RelatedMarketsBar
            markets={relatedMarkets}
            activeIdx={activeRelatedIdx}
            onSelect={setActiveRelatedIdx}
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

        <div ref={tradeFormRef} className="lg:sticky lg:top-4 lg:self-start space-y-3">
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

      <div className="px-6 pb-28 md:px-8 lg:pb-12">
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
  selectedIdx,
  onSelect,
  outcomeId,
}: {
  market: SportsMarket;
  selectedIdx: number;
  onSelect: (idx: number) => void;
  outcomeId?: string;
}) {
  const fixture = market.fixture;
  return (
    <header className="relative overflow-hidden rounded-2xl border border-border bg-surface bg-ambient p-6 shadow-card">
      <div className="flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <LeagueChip short={market.league.short} />
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-primary ring-1 ring-primary/30">
            {market.kind === "match" ? "Match" : market.kind === "league-winner" ? "Season winner" : market.kind === "top-scorer" ? "Top scorer" : "Prop"}
          </span>
          <span className="hidden items-center gap-3 pl-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground md:inline-flex">
            <span>Vol <span className="text-foreground tabular-nums">{market.volume}</span></span>
            <span>24h <span className="text-foreground tabular-nums">{market.volume24h}</span></span>
            <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{market.participants.toLocaleString()}</span>
          </span>
        </div>
        <ShareButton outcomeId={outcomeId} />
      </div>

      {/* Two-column body: fixture left · outcomes right */}
      <div className="mt-5 grid items-center gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-8 lg:divide-x lg:divide-border">
        <div className="min-w-0 lg:pr-8">
          {fixture ? (
            <div className="flex items-center justify-center gap-6">
              <CrestBlock name={fixture.home.name} logo={fixture.home.logo} hue={fixture.home.hue} />
              <div className="text-center">
                <div className="font-serif-display italic text-3xl text-muted-foreground">vs</div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Kickoff
                </div>
                <div className="font-mono text-[11px] tracking-wider text-foreground">
                  {fixture.whenLabel} · {fixture.kickoff}
                </div>
              </div>
              <CrestBlock name={fixture.away.name} logo={fixture.away.logo} hue={fixture.away.hue} />
            </div>
          ) : (
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">{market.title}</h1>
              <div className="mt-1 text-sm text-muted-foreground">{market.league.name}</div>
            </div>
          )}
        </div>

        <div className="min-w-0 lg:pl-2">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Markets
          </div>
          <div className="flex flex-col gap-1.5">
            {market.outcomes.map((o, idx) => (
              <HeaderOutcomeRow
                key={o.id}
                outcome={o}
                seed={hashSeed(market.id + ":" + o.id)}
                selected={idx === selectedIdx}
                onClick={() => onSelect(idx)}
              />
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

function CrestBlock({ name, logo, hue }: { name: string; logo: string; hue: number }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="grid h-[72px] w-[72px] place-items-center rounded-full bg-white/[0.05] p-2 ring-1 ring-white/10"
        style={{ boxShadow: `0 0 30px -6px oklch(0.7 0.22 ${hue} / 0.55)` }}
      >
        <img src={logo} alt={name} className="h-full w-full object-contain" />
      </div>
      <div className="font-display text-sm font-semibold text-foreground">{name}</div>
    </div>
  );
}

/**
 * Outcome row used inside the event header right column. Replaces the old
 * standalone OutcomePicker below the header. 56px tall, selected = lavender
 * ring + subtle wash. Click selects the outcome and re-tones the chart /
 * trade form upstream.
 */
function HeaderOutcomeRow({
  outcome,
  seed,
  selected,
  onClick,
}: {
  outcome: Outcome;
  seed: number;
  selected: boolean;
  onClick: () => void;
}) {
  const cents = Math.round(outcome.price * 100);
  const delta = typeof outcome.delta24h === "number" ? Math.round(outcome.delta24h * 100) : 0;
  const up = delta > 0;
  const down = delta < 0;
  const label = outcome.team?.name ?? outcome.label;
  const short =
    outcome.team?.name
      ? (outcome.label || outcome.team.name).slice(0, 3).toUpperCase()
      : label.slice(0, 1).toUpperCase();
  const tone: "win" | "loss" | "draw" | "neutral" =
    !outcome.team && (outcome.label === "Draw" || outcome.meta === "X")
      ? "draw"
      : outcome.label.toUpperCase() === "YES"
        ? "win"
        : outcome.label.toUpperCase() === "NO"
          ? "loss"
          : "neutral";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "group flex h-14 items-center gap-3 rounded-xl px-3 text-left transition",
        selected
          ? "bg-primary/10 ring-1 ring-primary/40"
          : "bg-white/[0.02] ring-1 ring-white/[0.04] hover:bg-white/[0.05]",
      )}
    >
      <Glyph outcome={outcome} short={short} tone={tone} />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        {label}
      </span>
      <Sparkline seed={seed} tone={tone} />
      <span
        className={cn(
          "font-mono text-[10px] tabular-nums",
          up ? "text-win" : down ? "text-loss" : "text-muted-foreground",
        )}
      >
        {up ? `+${delta}¢` : down ? `−${Math.abs(delta)}¢` : "0¢"}
      </span>
      <span
        className={cn(
          "min-w-[44px] text-right font-mono text-lg tabular-nums",
          selected ? "text-foreground" : "text-foreground/90",
        )}
      >
        {cents}
        <span className="text-xs text-muted-foreground">¢</span>
      </span>
    </button>
  );
}

function Glyph({
  outcome,
  short,
  tone,
}: {
  outcome: Outcome;
  short: string;
  tone: "win" | "loss" | "draw" | "neutral";
}) {
  if (outcome.team) {
    return (
      <div
        className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.05] p-0.5 ring-1 ring-white/10"
        style={{ boxShadow: `0 0 12px -4px oklch(0.7 0.22 ${outcome.team.hue} / 0.55)` }}
      >
        <img src={outcome.team.logo} alt="" className="h-full w-full object-contain" />
      </div>
    );
  }
  const cls =
    tone === "win"
      ? "bg-win/15 text-win"
      : tone === "loss"
        ? "bg-loss/15 text-loss"
        : tone === "draw"
          ? "bg-draw/15 text-draw"
          : "bg-white/[0.06] text-muted-foreground";
  return (
    <span
      className={cn(
        "grid h-7 w-7 shrink-0 place-items-center rounded-full font-mono text-[10px] font-bold",
        cls,
      )}
    >
      {short.charAt(0)}
    </span>
  );
}

/**
 * Tiny inline sparkline (~44×16) seeded by id so it stays stable across
 * renders. Pure SVG, no deps. Tone maps to win/loss/draw/neutral foreground.
 */
function Sparkline({
  seed,
  tone,
  width = 44,
  height = 16,
  pts = 12,
}: {
  seed: number;
  tone: "win" | "loss" | "draw" | "neutral";
  width?: number;
  height?: number;
  pts?: number;
}) {
  const values = useMemo(() => {
    const out: number[] = [];
    let s = seed || 1;
    for (let i = 0; i < pts; i++) {
      s = (s * 9301 + 49297) % 233280;
      out.push((s / 233280) * 2 - 1);
    }
    return out;
  }, [seed, pts]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = pts > 1 ? width / (pts - 1) : 0;
  const d = values
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  const stroke =
    tone === "win"
      ? "oklch(0.78 0.18 155)"
      : tone === "loss"
        ? "oklch(0.7 0.22 25)"
        : tone === "draw"
          ? "oklch(0.85 0.17 85)"
          : "oklch(0.68 0.025 285)";
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0 opacity-80"
      aria-hidden
    >
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="px-2">
      <div className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 truncate font-mono text-sm font-semibold tabular-nums text-foreground">
        {value}
      </div>
    </div>
  );
}
