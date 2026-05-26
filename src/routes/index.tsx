import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { TopBar } from "@/components/sports/TopBar";
import { Footer } from "@/components/sports/Footer";
import { SectionHeader } from "@/components/sports/SectionHeader";
import { MarketCard } from "@/components/sports/MarketCard";
import { MatchCard } from "@/components/sports/MatchCard";
import { HeroMarketCard } from "@/components/sports/HeroMarketCard";
import { FanPulseCard } from "@/components/sports/FanPulseCard";
import { LiveTicker } from "@/components/sports/LiveTicker";
import { TopTradersCard } from "@/components/sports/TopTradersCard";
import { MiniEventCard } from "@/components/sports/MiniEventCard";
import { StandingsPreview } from "@/components/sports/StandingsPreview";
import { PlayerSpotlightHero } from "@/components/sports/PlayerSpotlightHero";
import { TopMoverCard } from "@/components/sports/TopMoverCard";
import { SentimentCard } from "@/components/sports/SentimentCard";
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

// ─── Bento data ──────────────────────────────────────────────────────────────

const TODAYS_MATCHES = [
  { league: "ucl" as const, home: teams.realMadrid, away: teams.manCity, kickoff: "21:00", whenLabel: "Today" },
  { league: "epl" as const, home: teams.arsenal, away: teams.chelsea, kickoff: "19:30", whenLabel: "Today" },
  { league: "nba" as const, home: teams.lakers, away: teams.celtics, kickoff: "01:30", whenLabel: "Tonight" },
];

const TICKER_ROWS = [
  { short: "RMA", market: "to win vs MCI", price: 58, delta: 4.2 },
  { short: "OVER", market: "ARS/CHE goals 2.5", price: 64, delta: -1.8 },
  { short: "LAL", market: "cover -3.5 vs BOS", price: 47, delta: 2.1 },
  { short: "PSG", market: "reach UCL semi", price: 72, delta: 3.2 },
  { short: "BAR", market: "win La Liga 25/26", price: 41, delta: 5.6 },
  { short: "HAA", market: "MCI top scorer", price: 81, delta: -0.6 },
  { short: "ARS", market: "finish top 4", price: 68, delta: 0.9 },
  { short: "BOS", market: "win NBA Finals", price: 28, delta: 1.4 },
];

const TOP_TRADERS = [
  { handle: "matchday_max", pnl24h: 8420, hue: 340 },
  { handle: "stoploss_sam", pnl24h: 5210, hue: 250 },
  { handle: "neon_bettor", pnl24h: 3180, hue: 155 },
  { handle: "halftime_hero", pnl24h: -1450, hue: 25 },
];

const STANDINGS = [
  { team: "Man City", played: 8, wins: 7, draws: 1, losses: 0, points: 22 },
  { team: "Arsenal", played: 8, wins: 6, draws: 2, losses: 0, points: 20 },
  { team: "Liverpool", played: 8, wins: 5, draws: 2, losses: 1, points: 17 },
  { team: "Chelsea", played: 8, wins: 4, draws: 2, losses: 2, points: 14 },
  { team: "Newcastle", played: 8, wins: 3, draws: 3, losses: 2, points: 12 },
];

const SPOTLIGHT_PLAYER = {
  handle: "kil_sebgey_b",
  name: "Kylian Mbappé",
  position: "Forward · PSG",
  jersey: 10,
  monogram: "KM",
  stats: [
    { label: "Goals", value: 132 },
    { label: "Assists", value: 47 },
    { label: "Matches", value: 189 },
  ],
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
        <section className="relative overflow-hidden bg-ambient -mx-4 md:-mx-6 px-4 md:px-6 pt-12 pb-10 border-b border-border">
          <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-neon">
                Stadium Neon · a sports zone by OmenX
              </div>
              <h1 className="mt-4 font-display font-bold leading-[1.05] text-4xl md:text-5xl lg:text-[3.5rem]">
                Predict the match,
                <br />
                <span className="font-serif-display italic text-gradient-neon">own the moment.</span>
              </h1>
              <p className="mt-4 max-w-md text-sm text-muted-foreground leading-relaxed">
                Binary sports markets across EPL, La Liga, UCL, and NBA — deep order books,
                live settlement, clearing through your OmenX wallet.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="#bento"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-neon px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
                >
                  Trade tonight's match <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href={omenxUrl.portfolio()}
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Open positions <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
            <div className="hidden lg:block">
              <HeroMarketCard
                league="ucl"
                home={teams.realMadrid}
                away={teams.manCity}
                score="1 – 0"
                minute="67'"
                endsIn="47m"
                yesProbability={58}
                yesDelta={4.2}
                href="#bento"
              />
            </div>
          </div>
        </section>

        {/* ─── BENTO ────────────────────────────────────────────────── */}
        <section id="bento" className="py-10 scroll-mt-20">
          <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)_320px]">
            {/* LEFT RAIL */}
            <div className="flex h-full flex-col gap-4">
              <FanPulseCard
                question="Who wins tonight's UCL final?"
                home={teams.realMadrid}
                away={teams.manCity}
                homePct={62}
                totalVotes={4821}
                likes={1240}
                comments={318}
                href="#bento"
              />
              <LiveTicker rows={TICKER_ROWS} className="flex-1 min-h-0" />
              <SentimentCard
                league="ucl"
                question="Real Madrid to win vs Man City"
                home="Real Madrid"
                away="Man City"
                kickoff="Sat · 21:00 CET"
                yesNotional={812000}
                noNotional={398000}
                sideLabels={{ yes: "RMA", no: "MCI" }}
                openInterest="$1.21M"
                oiDelta24h={12.4}
              />
            </div>

            {/* CENTER COLUMN */}
            <div className="flex h-full flex-col gap-4">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neon">
                    Today's matches
                  </span>
                  <a href="#" className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground">
                    All events →
                  </a>
                </div>
                <div className="flex flex-col gap-2">
                  {TODAYS_MATCHES.map((m, i) => (
                    <MiniEventCard key={i} {...m} />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neon">
                    ● Top movers
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Live
                  </span>
                </div>
                <div className="grid gap-2 grid-cols-3">
                  {LIVE_MARKETS.map((m, i) => (
                    <TopMoverCard key={i} {...m} />
                  ))}
                </div>
              </div>

              <StandingsPreview league="EPL" rows={STANDINGS} className="flex-1 min-h-0" />
            </div>

            {/* RIGHT BIG */}
            <div className="flex h-full flex-col gap-4">
              <PlayerSpotlightHero
                handle={SPOTLIGHT_PLAYER.handle}
                monogram={SPOTLIGHT_PLAYER.monogram}
                jersey={SPOTLIGHT_PLAYER.jersey}
                className="flex-1 min-h-0"
              />
              <TopTradersCard rows={TOP_TRADERS} />
            </div>
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
