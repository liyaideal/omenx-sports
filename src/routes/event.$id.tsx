import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Clock, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { AppShell } from "@/components/sports/dashboard/AppShell";
import { AppTopBar } from "@/components/sports/dashboard/AppTopBar";
import { LeagueChip } from "@/components/sports/LeagueBadge";
import { CountdownPill } from "@/components/sports/CountdownPill";
import { OutcomeSelector } from "@/components/sports/OutcomeSelector";
import { OutcomePill } from "@/components/sports/OutcomePill";
import { PriceChart } from "@/components/sports/PriceChart";
import { OrderBook } from "@/components/sports/OrderBook";
import { TradeForm } from "@/components/sports/TradeForm";
import { PositionsTable } from "@/components/sports/PositionsTable";
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
          <EventDetailHeader market={market} />
          <OutcomePicker
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
          />
        </div>
      </div>

      <div className="px-6 pb-12 md:px-8">
        <PositionsTable />
      </div>
    </AppShell>
  );
}

function EventDetailHeader({ market }: { market: SportsMarket }) {
  const fixture = market.fixture;
  return (
    <header className="relative overflow-hidden rounded-2xl border border-border bg-surface bg-ambient p-6 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <LeagueChip short={market.league.short} />
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-primary ring-1 ring-primary/30">
            {market.kind === "match" ? "Match" : market.kind === "league-winner" ? "Futures" : market.kind === "top-scorer" ? "Top Scorer" : "Prop"}
          </span>
        </div>
        <CountdownPill value={market.endsLabel} tone="muted" />
      </div>

      {fixture ? (
        <div className="mt-6 flex items-center justify-center gap-8">
          <CrestBlock name={fixture.home.name} logo={fixture.home.logo} hue={fixture.home.hue} />
          <div className="text-center">
            <div className="font-serif-display italic text-3xl text-muted-foreground">vs</div>
            <div className="mt-1 font-mono text-xs tracking-wider text-muted-foreground">
              {fixture.whenLabel} · {fixture.kickoff}
            </div>
          </div>
          <CrestBlock name={fixture.away.name} logo={fixture.away.logo} hue={fixture.away.hue} />
        </div>
      ) : (
        <div className="mt-5">
          <h1 className="font-display text-2xl font-bold text-foreground">{market.title}</h1>
          <div className="mt-1 text-sm text-muted-foreground">{market.league.name}</div>
        </div>
      )}

      {fixture && (
        <h1 className="mt-5 text-center font-display text-base font-medium text-foreground">
          {market.title}
        </h1>
      )}

      <div className="mt-6 grid grid-cols-4 divide-x divide-border border-t border-border pt-4 text-center">
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
        className="grid h-20 w-20 place-items-center rounded-full bg-white/[0.05] p-2 ring-1 ring-white/10"
        style={{ boxShadow: `0 0 30px -6px oklch(0.7 0.22 ${hue} / 0.55)` }}
      >
        <img src={logo} alt={name} className="h-full w-full object-contain" />
      </div>
      <div className="font-display text-sm font-semibold text-foreground">{name}</div>
    </div>
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

function OutcomePicker({
  market,
  selectedIdx,
  onSelect,
}: {
  market: SportsMarket;
  selectedIdx: number;
  onSelect: (idx: number) => void;
}) {
  // Binary 2-outcome → use the polished OutcomeSelector with side labels.
  if (market.outcomes.length === 2) {
    const [yes, no] = market.outcomes;
    return (
      <OutcomeSelector
        options={[
          {
            team: yes.team ? toTeam(yes) : undefined,
            label: yes.team ? undefined : yes.label,
            probability: yes.price * 100,
          },
          {
            team: no.team ? toTeam(no) : undefined,
            label: no.team ? undefined : no.label,
            probability: no.price * 100,
          },
        ]}
        value={selectedIdx === 0 ? "yes" : "no"}
        onChange={(v) => onSelect(v === "yes" ? 0 : 1)}
      />
    );
  }
  // Three-way (or more) → simple grid using OutcomePill.
  return (
    <div className={cn("grid gap-3", market.outcomes.length === 3 ? "grid-cols-3" : "grid-cols-2 md:grid-cols-4")}>
      {market.outcomes.map((o, idx) => (
        <OutcomePill
          key={o.id}
          team={o.team ? toTeam(o) : undefined}
          label={o.team ? undefined : o.label}
          probability={o.price * 100}
          delta24h={typeof o.delta24h === "number" ? Math.round(o.delta24h * 100) : undefined}
          tone={idx === selectedIdx ? "yes" : "no"}
          size="lg"
          selected={idx === selectedIdx}
          onClick={() => onSelect(idx)}
        />
      ))}
    </div>
  );
}

function toTeam(o: Outcome) {
  if (!o.team) return undefined;
  return {
    id: o.team.name.toLowerCase().replace(/\s+/g, "-"),
    name: o.team.name,
    short: o.label || o.team.name.slice(0, 3).toUpperCase(),
    logo: o.team.logo,
  };
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