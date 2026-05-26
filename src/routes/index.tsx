import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Activity, Layers, Radio } from "lucide-react";
import { NeonRing } from "@/components/sports/NeonRing";
import { TopBar } from "@/components/sports/TopBar";
import { Footer } from "@/components/sports/Footer";
import { StatTile } from "@/components/sports/StatTile";
import { SectionHeader } from "@/components/sports/SectionHeader";
import { EventHeader } from "@/components/sports/EventHeader";
import { MarketCard } from "@/components/sports/MarketCard";
import { MatchCard } from "@/components/sports/MatchCard";
import { teams } from "@/lib/teams";
import { omenxUrl } from "@/lib/omenx";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Stadium Neon — Sports prediction markets on OmenX" },
      {
        name: "description",
        content:
          "Bet the moment. Trade binary sports markets across the EPL, La Liga, UCL, and NBA — settled on OmenX.",
      },
      { property: "og:title", content: "Stadium Neon — A sports zone by OmenX" },
      {
        property: "og:description",
        content:
          "Live sports prediction markets with deep order books and instant settlement, powered by OmenX.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

// ─── Mock data ────────────────────────────────────────────────────────────────
// Replace with OmenX API once the data contract is finalized.

const FEATURED = {
  league: "ucl" as const,
  home: "Real Madrid",
  away: "Man City",
  kickoff: "Sat · 21:00 CET",
  status: "live" as const,
  volume: "$4.82M",
  liquidity: "$1.21M",
  endsIn: "47m",
};

const LIVE_MARKETS = [
  {
    league: "ucl" as const,
    question: "Real Madrid to win vs Man City",
    yes: { team: teams.realMadrid, probability: 58, delta24h: 4.2 },
    no: { team: teams.manCity },
    volume: "$1.24M",
    endsIn: "47m",
    openInterest: "$612K",
    status: "live" as const,
  },
  {
    league: "epl" as const,
    question: "Arsenal & Chelsea — over 2.5 goals",
    yes: { label: "Over", probability: 64, delta24h: -1.8 },
    no: { label: "Under" },
    volume: "$612K",
    endsIn: "1h 12m",
    openInterest: "$284K",
    status: "live" as const,
  },
  {
    league: "nba" as const,
    question: "Lakers to cover -3.5 vs Celtics",
    yes: { team: teams.lakers, probability: 47, delta24h: 2.1 },
    no: { team: teams.celtics },
    volume: "$928K",
    endsIn: "2h 04m",
    openInterest: "$401K",
    status: "live" as const,
  },
];

const TRENDING_MARKETS = [
  {
    league: "laliga" as const,
    question: "Barcelona to win La Liga 2025/26",
    yes: { team: teams.barcelona, probability: 41, delta24h: 5.6 },
    no: { label: "No" },
    volume: "$2.14M",
    endsIn: "182d",
    openInterest: "$1.02M",
  },
  {
    league: "ucl" as const,
    question: "PSG to reach UCL semifinal",
    yes: { team: teams.psg, probability: 72, delta24h: 3.2 },
    no: { label: "No" },
    volume: "$889K",
    endsIn: "44d",
    openInterest: "$340K",
  },
  {
    league: "epl" as const,
    question: "Man City top scorer to be Haaland",
    yes: { label: "Yes", probability: 81, delta24h: -0.6 },
    no: { label: "No" },
    volume: "$1.55M",
    endsIn: "94d",
    openInterest: "$520K",
  },
  {
    league: "nba" as const,
    question: "Celtics to win NBA Finals 2026",
    yes: { team: teams.celtics, probability: 28, delta24h: 1.4 },
    no: { label: "No" },
    volume: "$3.41M",
    endsIn: "210d",
    openInterest: "$1.44M",
  },
  {
    league: "seriea" as const,
    question: "Serie A — 5+ red cards next matchday",
    yes: { label: "Yes", probability: 33, delta24h: -2.7 },
    no: { label: "No" },
    volume: "$214K",
    endsIn: "3d",
    openInterest: "$88K",
  },
  {
    league: "epl" as const,
    question: "Arsenal to finish top 4",
    yes: { team: teams.arsenal, probability: 68, delta24h: 0.9 },
    no: { label: "No" },
    volume: "$742K",
    endsIn: "164d",
    openInterest: "$298K",
  },
];

const FIXTURES = [
  { league: "epl" as const, home: teams.arsenal, away: teams.chelsea, kickoff: "21:00", date: "Sat · May 30" },
  { league: "laliga" as const, home: teams.barcelona, away: teams.realMadrid, kickoff: "21:00", date: "Sun · May 31" },
  { league: "ucl" as const, home: teams.psg, away: teams.manCity, kickoff: "20:45", date: "Tue · Jun 2" },
  { league: "nba" as const, home: teams.lakers, away: teams.celtics, kickoff: "01:30", date: "Wed · Jun 3" },
];

function Index() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <TopBar active="sports" />

      <main className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Hero Strip */}
        <section className="relative overflow-hidden bg-ambient -mx-4 md:-mx-6 px-4 md:px-6 pt-14 pb-12 border-b border-border">
          <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-neon">
                Stadium Neon · a sports zone by OmenX
              </div>
              <h1 className="mt-4 font-display font-bold leading-[1.05] text-5xl md:text-6xl">
                Predict the match,
                <br />
                <span className="font-serif-display italic text-gradient-neon">own the moment.</span>
              </h1>
              <p className="mt-5 max-w-lg text-sm text-muted-foreground leading-relaxed">
                Binary sports markets across the EPL, La Liga, UCL, and NBA. Deep order books,
                live settlement, and on-chain receipts — all clearing through your OmenX wallet.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#live"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-neon px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
                >
                  Browse live markets <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href={omenxUrl.portfolio()}
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Open positions <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
            <div className="hidden md:block">
              <NeonRing size={260} dashed>
                <div className="grid h-44 w-44 place-items-center rounded-full bg-surface font-display font-bold text-5xl">
                  10
                </div>
              </NeonRing>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
            <StatTile label="24h Sports Volume" value="$18.4M" hint="+12.3% vs yesterday" icon={Activity} />
            <StatTile label="Open Markets" value="247" hint="across 5 leagues" icon={Layers} />
            <StatTile label="Live Now" value="14" hint="settling within 3h" icon={Radio} tone="win" />
          </div>
        </section>

        {/* Featured Event */}
        <section className="py-12">
          <SectionHeader
            kicker="Featured"
            title="Tonight's headline event"
            description="Largest open interest on the board. Tap to open the trade surface."
            action={{ label: "All events", href: "#" }}
          />
          <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
            <EventHeader {...FEATURED} />
            <div className="flex flex-col justify-between rounded-2xl border border-border bg-surface bg-ambient p-6 shadow-card">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Why it matters
                </div>
                <p className="mt-3 font-display text-lg leading-snug text-foreground">
                  Three derivative markets settle on this match — moneyline, total goals, and first
                  scorer. Liquidity is concentrated tonight.
                </p>
              </div>
              <a
                href="#"
                className="mt-6 inline-flex items-center gap-2 self-start rounded-full bg-gradient-neon px-4 py-2.5 text-xs font-semibold text-white shadow-glow transition hover:opacity-90"
              >
                Open market <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* Live Now */}
        <section id="live" className="py-12 border-t border-border">
          <SectionHeader
            kicker="Live"
            title="Live now"
            tabs={[
              { label: "All", active: true },
              { label: "EPL" },
              { label: "UCL" },
              { label: "NBA" },
            ]}
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {LIVE_MARKETS.map((m, i) => (
              <MarketCard key={i} {...m} />
            ))}
          </div>
        </section>

        {/* Trending */}
        <section className="py-12 border-t border-border">
          <SectionHeader
            kicker="Trending"
            title="Trending markets"
            description="Highest 24h volume growth across the board."
            action={{ label: "View all", href: "#" }}
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {TRENDING_MARKETS.map((m, i) => (
              <MarketCard key={i} {...m} />
            ))}
          </div>
        </section>

        {/* Upcoming */}
        <section className="py-12 border-t border-border">
          <SectionHeader
            kicker="Upcoming"
            title="Upcoming fixtures"
            description="Markets open as the lineup is confirmed."
          />
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {FIXTURES.map((f, i) => (
              <MatchCard key={i} {...f} />
            ))}
          </div>
        </section>

        {/* Cross-link strip */}
        <section className="py-12 border-t border-border">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface bg-ambient p-6 md:p-8 shadow-card">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-neon">
                  On OmenX
                </div>
                <h3 className="mt-2 font-display font-semibold text-xl">
                  Looking for your positions or settled bets?
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Portfolio, payouts, and account live on the OmenX main site.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={omenxUrl.portfolio()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] ring-1 ring-white/10 px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-white/[0.1]"
                >
                  Open Portfolio <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <a
                  href={omenxUrl.history()}
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Settled history <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
