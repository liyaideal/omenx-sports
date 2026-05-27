import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Clock, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/sports/dashboard/AppShell";
import { AppTopBar } from "@/components/sports/dashboard/AppTopBar";
import { LeagueChip } from "@/components/sports/LeagueBadge";
import { CountdownPill } from "@/components/sports/CountdownPill";
import { PriceChart } from "@/components/sports/PriceChart";
import { OrderBook } from "@/components/sports/OrderBook";
import { TradeForm, type PlacedOrder } from "@/components/sports/TradeForm";
import {
  PositionsTable,
  type PositionRowData,
  type OrderRowData,
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

function EventTradePage() {
  const { market } = Route.useLoaderData();
  // For binary 2-outcome markets, treat outcomes[0] = YES, outcomes[1] = NO.
  // For three-way markets, expose all 3 outcomes and let the user pick one;
  // internally we still map the selected one to the YES side of the trade form.
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = market.outcomes[selectedIdx] ?? market.outcomes[0];
  // For OutcomeSelector tone wiring (binary only)
  const binaryTone: "yes" | "no" = selectedIdx === 0 ? "yes" : "no";

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

  const league = leagueKeyFromShort(market.league.short);
  const currentPx = Math.round(selected.price * 100);
  // Apply a tiny live jitter so PnL updates every tick.
  const livePositions = useMemo<PositionRowData[]>(() => {
    return positions.map((p, i) => {
      const jitter = Math.sin((tick + i * 7) / 3) * 1.4;
      const mark = clampPct(p.entry + jitter);
      const sign = p.outcome === "yes" ? 1 : -1;
      const notional = p.margin * p.leverage;
      const pnl = (mark / 100 - p.entry / 100) * notional * sign;
      return { ...p, mark: Math.round(mark * 10) / 10, pnl: Math.round(pnl * 100) / 100 };
    });
  }, [positions, tick]);

  const handlePlaceOrder = (order: PlacedOrder) => {
    if (order.type === "limit" && order.side === "buy" && order.price !== currentPx) {
      // Limit buy below/above mark → resting open order.
      setOrders((prev) => [
        {
          market: market.title,
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
        market: market.title,
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

      <div className="px-6 pt-6 md:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
        </Link>
      </div>

      <div className="grid gap-5 px-6 pb-10 pt-4 md:px-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-5">
          <EventDetailHeader
            market={market}
            selectedIdx={selectedIdx}
            onSelect={setSelectedIdx}
          />
          <PriceChart tone={binaryTone} seed={hashSeed(market.id) + selectedIdx} />
          <OrderBook
            sideLabels={getSideLabels(market)}
            mark={Math.round(selected.price * 100)}
          />
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          <TradeForm
            outcome={binaryTone}
            outcomeLabel={getOutcomeLabel(selected)}
            price={Math.round(selected.price * 100)}
            onPlaceOrder={handlePlaceOrder}
          />
        </div>
      </div>

      <div className="px-6 pb-12 md:px-8">
        <PositionsTable positions={livePositions} orders={orders} />
      </div>
    </AppShell>
  );
}

function EventDetailHeader({
  market,
  selectedIdx,
  onSelect,
}: {
  market: SportsMarket;
  selectedIdx: number;
  onSelect: (idx: number) => void;
}) {
  const fixture = market.fixture;
  return (
    <header className="relative overflow-hidden rounded-2xl border border-border bg-surface bg-ambient p-6 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <LeagueChip short={market.league.short} />
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-primary ring-1 ring-primary/30">
            {market.kind === "match" ? "Match" : market.kind === "league-winner" ? "Season winner" : market.kind === "top-scorer" ? "Top scorer" : "Prop"}
          </span>
        </div>
        <CountdownPill value={market.endsLabel} tone="muted" />
      </div>

      {/* Two-column body: fixture left · outcomes right */}
      <div className="mt-5 grid items-center gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-8 lg:divide-x lg:divide-border">
        <div className="min-w-0 lg:pr-8">
          {fixture ? (
            <div className="flex items-center justify-center gap-6">
              <CrestBlock name={fixture.home.name} logo={fixture.home.logo} hue={fixture.home.hue} />
              <div className="text-center">
                <div className="font-serif-display italic text-3xl text-muted-foreground">vs</div>
                <div className="mt-1 font-mono text-[11px] tracking-wider text-muted-foreground">
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
            Outcomes
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

      <div className="mt-6 grid grid-cols-2 divide-x divide-border border-t border-border pt-4 text-center md:grid-cols-4">
        <Stat label="Volume" value={market.volume} />
        <Stat label="24h Vol" value={market.volume24h} />
        <Stat label="Traders" value={market.participants.toLocaleString()} icon={<Users className="h-3 w-3" />} />
        <Stat label="Ends" value={market.endsLabel} icon={<Clock className="h-3 w-3" />} />
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