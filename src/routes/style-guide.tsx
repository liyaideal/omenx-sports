import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  Search,
  Home,
  Compass,
  Trophy,
  ListChecks,
  Wallet as WalletIcon,
  Settings as SettingsIcon,
  Plus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { MatchCard } from "@/components/sports/MatchCard";
import { SentimentCard } from "@/components/sports/SentimentCard";
import { PlayerSpotlightCard } from "@/components/sports/PlayerSpotlightCard";
import { LeaderboardRow, LeaderboardHeader } from "@/components/sports/LeaderboardRow";
import { StatChip } from "@/components/sports/StatChip";
import { RatioBar } from "@/components/sports/RatioBar";
import { NeonRing } from "@/components/sports/NeonRing";
import { TeamCrest } from "@/components/sports/TeamCrest";
import { LeagueBadge, LeagueChip, LEAGUE_KEYS } from "@/components/sports/LeagueBadge";
import { CardHeader, TypeChip } from "@/components/sports/CardChip";
import { Flame, Trophy as TrophyIcon, Users as UsersIcon } from "lucide-react";
import { PricePill } from "@/components/sports/dashboard/PricePill";
import { OutcomePill } from "@/components/sports/OutcomePill";
import { CountdownPill } from "@/components/sports/CountdownPill";
import { StatTile } from "@/components/sports/StatTile";
import { SectionHeader } from "@/components/sports/SectionHeader";
import { MarketCard } from "@/components/sports/MarketCard";
import { EventHeader } from "@/components/sports/EventHeader";
import { EventQuestionHeading } from "@/components/sports/event/EventQuestionHeading";
import { OutcomeSelector } from "@/components/sports/OutcomeSelector";
import { TeamName } from "@/components/sports/TeamName";
import { teams } from "@/lib/teams";
import { LiveStreamCard } from "@/components/sports/dashboard/LiveStreamCard";
import { EventLiveStage } from "@/components/sports/event/EventLiveStage";
import { useLiveStream } from "@/components/sports/live/LiveStreamProvider";
import { LiveDelayInfo } from "@/components/sports/live/LiveDelayInfo";
import { RegulationTimeNotice } from "@/components/sports/RegulationTimeNotice";
import { AudioTrackToggle } from "@/components/sports/live/AudioTrackToggle";
import { StageTabs } from "@/components/sports/event/StageTabs";
import { MobileTradeBar } from "@/components/sports/event/MobileTradeBar";
import { RelatedMarketsBar } from "@/components/sports/event/RelatedMarketsBar";
import { LiveTape } from "@/components/sports/event/LiveTape";
import { DepthBar } from "@/components/sports/event/DepthBar";
import { PreMatchStrip } from "@/components/sports/event/PreMatchStrip";
import { ShareButton } from "@/components/sports/event/ShareButton";
import {
  ShareTrigger,
  shareEvent,
  shareLeague,
  sharePlayer,
  shareCombo,
  shareLuckyBox,
  sharePromo,
} from "@/components/sports/share";
import { ShareCardPreview } from "@/components/sports/promo/ComboChallengeSection";
import { getRelatedMarkets } from "@/components/sports/event/related-markets";
import { MATCH_MARKETS, FEATURED_MATCH } from "@/data/sports-markets";
import { MobileTopBar } from "@/components/sports/mobile/MobileTopBar";
import omenxLogo from "@/assets/omenx-logo.svg";
import { MobileBottomNav } from "@/components/sports/mobile/MobileBottomNav";
import { MobileFansSection } from "@/components/sports/mobile/MobileFansSection";
import { MobileLiveHero } from "@/components/sports/mobile/MobileLiveHero";
import { MeSheet } from "@/components/sports/mobile/MeSheet";
import { ACCOUNT_STATS } from "@/data/sports-markets";
import { LEAGUES, getMatchMarketsByLeagueSlug } from "@/data/leagues";
import { LeagueEntryCard } from "@/components/sports/league/LeagueEntryCard";
import { LeagueSpotlightCard } from "@/components/sports/league/LeagueSpotlightCard";
import { LeagueComingSoonCard } from "@/components/sports/league/LeagueComingSoonCard";
import { LeagueHubHero } from "@/components/sports/league/LeagueHubHero";
import { HubTabs } from "@/components/sports/league/HubTabs";
import { WorldCupBackdrop } from "@/components/sports/league/WorldCupAmbience";
import { GroupWinnerCard } from "@/components/sports/league/GroupWinnerCard";
import { BinaryQuestionCard } from "@/components/sports/league/BinaryQuestionCard";
import { BracketView } from "@/components/sports/league/BracketView";
import { PropsGrid } from "@/components/sports/league/PropsGrid";
import { SpotlightPropsCardHorizontal } from "@/components/sports/league/SpotlightPropsCardHorizontal";
import { EventMarketTileCard } from "@/components/sports/dashboard/EventMarketTileCard";
import { useTradeDrawer } from "@/components/sports/trade/TradeDrawerProvider";
import { TradeOutcomePicker } from "@/components/sports/trade/TradeOutcomePicker";
import { EventOutcomesPanel } from "@/components/sports/event/EventOutcomesPanel";
import type { ChartPosition } from "@/components/sports/event/CombinedPriceChart";
import type { SportsMarket } from "@/data/sports-markets";
import {
  WC26_GROUPS,
  WC26_BRACKET,
  WC26_BRACKET_PARTIAL,
  getGroupsByLeagueSlug,
  getBracketByLeagueSlug,
} from "@/data/tournament";
import {
  getBinaryQuestionsByLeagueSlug,
  getSeasonGroupByLeagueSlug,
  getSpotlightsByLeagueSlug,
} from "@/data/leagues";
import { PriceChart } from "@/components/sports/PriceChart";
import { OrderBook } from "@/components/sports/OrderBook";
import { TradeForm } from "@/components/sports/TradeForm";
import { PositionsTable } from "@/components/sports/PositionsTable";
import { Wallet, TrendingUp, LineChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScoreboardHero } from "@/components/sports/promo/ScoreboardHero";
import { ScoreboardTicker } from "@/components/sports/promo/ScoreboardTicker";
import { CarnivalTabs } from "@/components/sports/promo/CarnivalTabs";
import { CarnivalPromoCard } from "@/components/sports/promo/CarnivalPromoCard";
import { CarnivalFlagsMarquee } from "@/components/sports/promo/CarnivalFlagsMarquee";
import { ConfettiLayer, TwinkleField } from "@/components/sports/promo/ConfettiLayer";
import { OverviewSection } from "@/components/sports/promo/OverviewSection";
import { ComboChallengeSection } from "@/components/sports/promo/ComboChallengeSection";
import { LuckyBoxSection } from "@/components/sports/promo/LuckyBoxSection";
import { NewbieRewardsSection, TaskCard } from "@/components/sports/promo/NewbieRewardsSection";
import type { NewbieTask, LegendRound, LegendRoundStatus } from "@/data/world-cup-carnival";
import {
  LEGEND_ROUNDS,
  LEGEND_COUNTRIES,
  LEGEND_SIGNED_IMAGES,
  LEGEND_MYSTERY_PORTRAIT,
  type LegendCountryCode,
} from "@/data/world-cup-carnival";
import signedCivAsset from "@/assets/legend-reveal/signed-civ.jpg";
import * as FlatFlags from "country-flag-icons/react/3x2";
import {
  ScoreboardChassis,
  RoundProgressHud,
  ActiveRoundBay,
  CandidateBoard,
  SignedArchiveStrip,
  MissionBrief,
} from "@/components/sports/promo/GuessTheLegendTab";
import {
  LegendRevealOverlay,
  type RevealOutcome,
} from "@/components/sports/promo/LegendRevealOverlay";

export const Route = createFileRoute("/style-guide")({
  head: () => ({
    meta: [
      { title: "Stadium Neon — Design System" },
      { name: "description", content: "Visual language and component library for the sports prediction product." },
    ],
  }),
  component: StyleGuide,
});

const SECTIONS = [
  ["brand", "Brand & Tone"],
  ["colors", "Color Tokens"],
  ["typography", "Typography"],
  ["buttons", "Buttons"],
  ["chips", "Chips & Badges"],
  ["bars", "Ratio & Progress"],
  ["decor", "Decorative Elements"],
  ["cards", "Sport Cards"],
  ["leaderboard", "Leaderboard"],
  ["primitives", "Market Primitives"],
  ["market", "Binary Event (2 outcomes)"],
  ["multi", "Multi-Outcome Event (3+ outcomes)"],
  ["question-header", "Event Header — Question"],
  ["live-event-header", "Event Header — Live Score"],
  ["trade", "Trade Surface"],
  ["language", "Trading Language"],
  ["spacing", "Spacing & Radius"],
  ["fans", "Personalized Zone"],
  ["events-grid", "Events Grid"],
  ["mobile-shell", "Mobile Shell"],
  ["league-hub", "League Hub"],
  ["hub-props", "Hub · Props"],
  ["hub-bracket", "Hub · Bracket"],
  ["world-cup-carnival", "World Cup Carnival"],
  ["trade-drawer", "Sticky Trade Drawer"],
  ["trade-outcome-picker", "Trade Outcome Picker"],
  ["event-outcomes-panel", "Event Outcomes Panel"],
  ["event-live-stage", "Event Live Stage"],
  ["global-live-stream", "Global Live Stream"],
  ["live-delay-info", "Live Delay Disclosure"],
  ["regulation-time-notice", "Regulation Time Notice"],
  ["event-trade-bar", "Mobile Sticky Trade Bar"],
  ["event-extras", "Event Detail Extras"],
  ["share", "Share Dialog"],
  ["production-inventory", "Production Inventory"],
] as const;

function Section({ id, title, kicker, children }: { id: string; title: string; kicker?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 py-12 border-t border-border first:border-t-0 first:pt-0">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground">{kicker ?? id}</div>
          <h2 className="mt-1 text-3xl font-display font-bold">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

/**
 * MobileFrame — renders any component inside a 390-wide framed surface so a
 * desktop reviewer can see the mobile layout without resizing the window.
 * Used in the World Cup Carnival "Mobile behavior" subsection.
 */
function MobileFrame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.02] px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        {label}
      </div>
      <div className="overflow-hidden rounded-2xl border border-dashed border-white/15 bg-black/30 p-3">
        <div className="mx-auto w-full max-w-[390px]">{children}</div>
      </div>
    </div>
  );
}

function TokenSwatch({ name, varName, hint }: { name: string; varName: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <div
        className="h-20 w-full rounded-xl ring-1 ring-white/5"
        style={{ background: `var(${varName})` }}
      />
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{name}</span>
        <code className="font-mono text-[10px] text-muted-foreground">{varName}</code>
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-[360px] overflow-hidden rounded-[40px] border border-border bg-background shadow-card ring-1 ring-white/5">
      <div className="relative h-[720px] overflow-y-auto bg-background bg-ambient">
        {children}
      </div>
    </div>
  );
}

function MeSheetPreviewLauncher() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-medium text-foreground transition hover:bg-primary/15"
      >
        Preview MeSheet
      </button>
      <MeSheet
        open={open}
        onOpenChange={setOpen}
        userName="Jeremy"
        userAvatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces&q=80"
        equity={ACCOUNT_STATS.available}
        openPositions={ACCOUNT_STATS.openPositions}
        pnlToday={ACCOUNT_STATS.pnlToday}
        toClaim={ACCOUNT_STATS.toClaim}
      />
    </>
  );
}

function StyleGuide() {
  const [activeNav, setActiveNav] = useState<string>("home");
  const navItems = [
    { id: "home", icon: Home },
    { id: "compass", icon: Compass },
    { id: "trophy", icon: Trophy },
    { id: "list", icon: ListChecks },
    { id: "wallet", icon: WalletIcon },
  ];

  return (
    <div className="min-h-screen bg-background bg-ambient text-foreground">
      {/* Top chrome — also serves as a live nav-button reference */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-neon shadow-glow">
              <span className="font-display font-bold text-sm text-white">S</span>
            </div>
            <span className="font-display font-bold text-lg">Stadium Neon</span>
          </div>

          <div className="ml-2 hidden flex-1 max-w-sm md:block">
            <div className="flex items-center gap-2 rounded-full bg-white/[0.04] px-4 py-2 ring-1 ring-white/5">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                placeholder="Search components, tokens…"
                className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>

          <nav className="mx-auto flex items-center gap-1.5">
            {navItems.map(({ id, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveNav(id)}
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-xl transition-all",
                  activeNav === id
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "bg-white/[0.04] text-muted-foreground hover:text-foreground hover:bg-white/[0.08]",
                )}
                aria-label={id}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:block text-right leading-tight">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Hi,</div>
              <div className="text-sm font-display font-semibold">Jeremy</div>
            </div>
            <TeamCrest name="Jeremy" size="md" />
            <button className="relative grid h-10 w-10 place-items-center rounded-xl bg-white/[0.04] text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-neon" />
            </button>
            <button className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.04] text-muted-foreground hover:text-foreground">
              <SettingsIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-[200px_minmax(0,1fr)] gap-10 px-6 py-10">
        {/* Section nav */}
        <aside className="sticky top-24 hidden max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 md:block">
          <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground mb-3">Contents</div>
          <Link
            to="/style-guide-homepage"
            className="mb-3 block rounded-lg border border-dashed border-neon/40 bg-neon/[0.06] px-3 py-2 text-sm font-medium text-foreground transition hover:bg-neon/[0.12]"
          >
            → Homepage Playground
          </Link>
          <ul className="space-y-1.5">
            {SECTIONS.map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <main>
          {/* BRAND */}
          <Section id="brand" title="Stadium Neon" kicker="01 — Brand & Tone">
            <div className="mb-6 rounded-3xl border border-border bg-surface p-8 shadow-card">
              <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-muted-foreground">Official wordmark</div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="grid place-items-center rounded-2xl bg-[#050505] p-8">
                  <img src={omenxLogo} alt="OMENX" className="h-10 w-auto" />
                </div>
                <div className="grid place-items-center rounded-2xl border border-border bg-white p-8">
                  <img src={omenxLogo} alt="OMENX" className="h-10 w-auto" style={{ filter: "invert(1)" }} />
                </div>
              </div>
              <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                Always import <code className="font-mono text-foreground">@/assets/omenx-logo.svg</code> wherever the OMENX wordmark appears
                (top bars, share posters, promo headers, OG cards). Never re-type "OMENX" in Audiowide / Orbitron / any display font —
                that's not the brand mark.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-10 shadow-card bg-ambient">
              <div className="max-w-xl">
                <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-neon">design system</div>
                <h1 className="mt-3 text-5xl font-display font-bold leading-[1.05]">
                  Match-day energy,
                  <br />
                  <span className="text-gradient-neon font-serif-display italic">distilled into pixels.</span>
                </h1>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  A dark-first visual language for fan-driven sports prediction. Lavender hush over
                  deep arena black, magenta neon for the moment of decision, mono-set numbers for
                  the trust of a scoreboard.
                </p>
                <div className="mt-6 flex gap-3">
                  <Button className="bg-gradient-neon text-white shadow-glow hover:opacity-90">Primary CTA</Button>
                  <Button variant="outline" className="border-white/10 bg-white/[0.03]">
                    Secondary
                  </Button>
                </div>
              </div>
              <div className="absolute -right-12 -top-12 hidden md:block">
                <NeonRing size={320} dashed>
                  <div className="grid h-56 w-56 place-items-center rounded-full bg-surface text-6xl font-display font-bold text-foreground">
                    10
                  </div>
                </NeonRing>
              </div>
            </div>
          </Section>

          {/* COLORS */}
          <Section id="colors" title="Color Tokens" kicker="02 — Palette">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <TokenSwatch name="Background" varName="--background" hint="Page base" />
              <TokenSwatch name="Surface" varName="--surface" hint="Cards" />
              <TokenSwatch name="Surface Elevated" varName="--surface-elevated" hint="Hover" />
              <TokenSwatch name="Foreground" varName="--foreground" hint="Primary text" />
              <TokenSwatch name="Primary" varName="--primary" hint="Lavender — actions" />
              <TokenSwatch name="Neon" varName="--neon" hint="Magenta — emphasis" />
              <TokenSwatch name="Win" varName="--win" />
              <TokenSwatch name="Loss" varName="--loss" />
              <TokenSwatch name="Draw" varName="--draw" />
              <TokenSwatch name="Muted" varName="--muted" />
              <TokenSwatch name="Muted FG" varName="--muted-foreground" />
              <TokenSwatch name="Border" varName="--border" />
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="h-24 rounded-2xl bg-gradient-neon shadow-glow flex items-end p-4">
                <span className="font-mono text-xs text-white">--gradient-neon</span>
              </div>
              <div className="h-24 rounded-2xl bg-gradient-vote flex items-end p-4">
                <span className="font-mono text-xs text-white">--gradient-vote</span>
              </div>
            </div>
          </Section>

          {/* TYPOGRAPHY */}
          <Section id="typography" title="Typography" kicker="03 — Type">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Display — Sora</div>
                <div className="mt-2 font-display font-bold text-5xl">Dashboard</div>
                <div className="mt-1 font-display font-semibold text-xl text-muted-foreground">Upcoming event</div>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Atmospheric — Instrument Serif</div>
                <div className="mt-2 font-serif-display italic text-5xl">Mbappé</div>
                <div className="mt-1 font-serif-display italic text-xl text-muted-foreground">vs · season ‘26</div>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Body — Inter</div>
                <p className="mt-2 text-base">
                  Predict outcomes, climb the leaderboard, share calls with the fan zone.
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Used for descriptions and UI copy.</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Data — JetBrains Mono</div>
                <div className="mt-2 font-mono text-3xl tabular-nums">2 : 1</div>
                <div className="mt-1 font-mono text-xs text-muted-foreground">23 Aug 4:30pm · La Liga</div>
              </div>
            </div>
          </Section>

          {/* BUTTONS */}
          <Section id="buttons" title="Buttons" kicker="04 — Actions">
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-6 shadow-card">
              <Button className="bg-primary text-primary-foreground hover:opacity-90">Place Pick</Button>
              <Button className="bg-gradient-neon text-white shadow-glow hover:opacity-90">
                <Plus className="h-4 w-4" /> Create Prediction
              </Button>
              <Button variant="outline" className="border-white/10 bg-white/[0.03]">Cancel</Button>
              <Button variant="ghost">Skip</Button>
              <Button size="icon" className="bg-white/[0.04] text-muted-foreground hover:text-foreground rounded-xl">
                <Bell className="h-4 w-4" />
              </Button>
              <Button size="icon" className="bg-primary text-primary-foreground rounded-xl shadow-glow">
                <Home className="h-4 w-4" />
              </Button>
            </div>
          </Section>

          {/* CHIPS */}
          <Section id="chips" title="Chips & Badges" kicker="05 — Tags">
            <div className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-card">
              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">League chip — card header (canonical)</div>
                <div className="flex flex-wrap items-center gap-2">
                  {LEAGUE_KEYS.map((k) => (
                    <LeagueChip key={k} league={k} />
                  ))}
                  <LeagueChip short="MLS" />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <LeagueChip league="epl" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">· MATCH</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <LeagueChip league="epl" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">· SEASON WINNER</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <LeagueChip league="ucl" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">· TOP SCORER</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <LeagueChip league="nba" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">· EVENT</span>
                </div>
              </div>
              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">League badge — inline (rows / sentiment)</div>
              <div className="flex flex-wrap gap-2">
                {LEAGUE_KEYS.map((k) => (
                  <LeagueBadge key={k} league={k} />
                ))}
              </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-neon/10 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-neon ring-1 ring-neon/30">Live</span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-primary ring-1 ring-primary/30">Upcoming</span>
                <span className="rounded-full bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">Final</span>
                <span className="rounded-full bg-win/10 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-win ring-1 ring-win/30">Win</span>
                <span className="rounded-full bg-loss/10 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-loss ring-1 ring-loss/30">Loss</span>
                <span className="rounded-full bg-draw/10 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-draw ring-1 ring-draw/30">Draw</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5 text-xs font-medium text-primary ring-1 ring-primary/30">
                  📅 Newest
                </button>
                <button className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-4 py-1.5 text-xs text-muted-foreground hover:text-foreground">
                  Trending
                </button>
                <button className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-4 py-1.5 text-xs text-muted-foreground hover:text-foreground">
                  Following
                </button>
              </div>
              <div>
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Price pill — signed delta with ¢ unit</div>
                <div className="flex flex-wrap items-center gap-3">
                  <PricePill price={0.42} delta={0.03} />
                  <PricePill price={0.21} delta={-0.01} />
                  <PricePill price={0.37} delta={0} />
                  <PricePill price={0.58} delta={0.04} showTimeframe />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Prices are in cents (0–100). Delta is signed (<code className="font-mono text-foreground">+3¢</code> / <code className="font-mono text-foreground">−1¢</code> / <code className="font-mono text-foreground">0¢</code>) and represents the 24h change. Arrow + color are redundant cues — the number alone must still read correctly.
                </p>
              </div>
            </div>
          </Section>

          {/* BARS */}
          <Section id="bars" title="Ratio & Progress" kicker="06 — Data Bars">
            <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
              <code className="font-mono text-foreground">RatioBar</code> shows continuous zero-sum splits — Long/Short notional, order-flow imbalance, sentiment. Never a poll or vote.
            </p>
            <div className="grid gap-4 rounded-2xl border border-border bg-surface p-6 shadow-card md:grid-cols-2">
              <RatioBar value={64} leftLabel="Long 1.2M" rightLabel="Short 680K" />
              <RatioBar value={38} leftTone="primary" rightTone="neon" leftLabel="YES flow" rightLabel="NO flow" />
            </div>
          </Section>

          {/* DECOR */}
          <Section id="decor" title="Decorative Elements" kicker="07 — Signature">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid place-items-center rounded-2xl border border-border bg-surface p-8 shadow-card bg-ambient">
                <NeonRing size={180}>
                  <div className="grid h-32 w-32 place-items-center rounded-full bg-surface-elevated font-display font-bold text-3xl">10</div>
                </NeonRing>
                <span className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Neon Halo</span>
              </div>
              <div className="grid place-items-center rounded-2xl border border-border bg-surface p-8 shadow-card">
                <div className="relative grid h-36 w-36 place-items-center">
                  <div className="absolute inset-0 rounded-full border border-dashed border-white/20" />
                  <div className="absolute inset-3 rounded-full border border-dashed border-white/10" />
                  <span className="font-display font-bold text-4xl">17</span>
                </div>
                <span className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Dashed Aura</span>
              </div>
              <div className="grid place-items-center rounded-2xl border border-border bg-surface p-8 shadow-card">
                <div className="h-1 w-40 rounded-full bg-gradient-neon shadow-glow" />
                <div className="mt-3 h-px w-40 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Dividers</span>
              </div>
            </div>
          </Section>

          {/* CARDS */}
          <Section id="cards" title="Sport Cards" kicker="08 — Composites">
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-1">
                <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Match Card</h3>
                <MatchCard home={teams.manCity} away={teams.arsenal} kickoff="5:30pm" date="Today 6:00pm" league="epl" status="live" />
                <MatchCard home={teams.chelsea} away={teams.psg} kickoff="5:30pm" date="23 Aug 4:30pm" league="ucl" />
                <MatchCard home={teams.barcelona} away={teams.realMadrid} kickoff="9:00pm" date="28 Aug 9:00pm" league="laliga" status="upcoming" />
              </div>

              <div className="lg:col-span-1">
                <h3 className="mb-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">Sentiment Card</h3>
                <SentimentCard
                  league="ucl"
                  question="Chelsea vs PSG — who advances?"
                  home="Chelsea"
                  away="PSG"
                  kickoff="Today 8:00pm"
                  yesNotional={1240000}
                  noNotional={680000}
                  sideLabels={{ yes: "Chelsea", no: "PSG" }}
                  openInterest="$1.92M"
                  oiDelta24h={12}
                />
              </div>

              <div className="lg:col-span-1">
                <h3 className="mb-4 text-xs font-mono uppercase tracking-widest text-muted-foreground">Event Spotlight</h3>
                <PlayerSpotlightCard
                  handle="KIL_SEBGEY_B"
                  name="Kylian Mbappé"
                  position="Forward"
                  jersey={10}
                  stats={[
                    { label: "Goals", value: 132 },
                    { label: "Assist", value: 320 },
                    { label: "Matches", value: 89 },
                  ]}
                />
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <StatChip player="Lionel Messi" firstName="Lionel" metric="21" metricLabel="Goals" number={10} />
              <StatChip player="Erling Haaland" firstName="Erling" metric="16" metricLabel="Goals" number={17} />
            </div>
          </Section>

          {/* LEADERBOARD */}
          <Section id="leaderboard" title="Leaderboard" kicker="09 — Data Density">
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="font-display font-semibold">Premier League</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Top 4</div>
              </div>
              <LeaderboardHeader />
              <div className="mt-1 space-y-0.5">
                <LeaderboardRow rank={1} team="Man City" played={8} wins={2} draws={0} losses={0} points={82} />
                <LeaderboardRow rank={2} team="Arsenal" played={8} wins={2} draws={0} losses={0} points={82} />
                <LeaderboardRow rank={3} team="Newcastle" played={6} wins={2} draws={0} losses={0} points={62} />
                <LeaderboardRow rank={4} team="Liverpool" played={3} wins={4} draws={0} losses={0} points={22} />
              </div>
            </div>
          </Section>

          {/* SPACING */}
          {/* MARKET PRIMITIVES */}
          <Section id="primitives" title="Market Primitives" kicker="10 — Atoms">
            <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
              Atomic pieces that compose every market list and trade surface. <code className="font-mono text-foreground">OutcomePill</code> renders team-vs-team or neutral Yes/No selections; <code className="font-mono text-foreground">StatTile</code> handles balance / PnL grids; <code className="font-mono text-foreground">CountdownPill</code> animates the "ends in" state.
            </p>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
                <div className="mb-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">OutcomePill — sizes & states</div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <OutcomePill team={teams.realMadrid} probability={62} tone="yes" selected />
                    <OutcomePill team={teams.barcelona} probability={38} tone="no" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <OutcomePill team={teams.yes} probability={73} tone="yes" size="sm" showCrest={false} />
                    <OutcomePill team={teams.no} probability={27} tone="no" size="sm" showCrest={false} />
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
                <div className="mb-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Countdowns & section header</div>
                <div className="flex flex-wrap gap-2">
                  <CountdownPill value="2d 14h 32m" />
                  <CountdownPill value="04:12" tone="live" />
                  <CountdownPill value="Ends in 6h" />
                </div>
                <div className="mt-6">
                  <SectionHeader
                    kicker="trending"
                    title="Hot markets"
                    description="Highest 24h volume across all leagues."
                    action={{ label: "See all" }}
                    tabs={[
                      { label: "All", active: true },
                      { label: "Soccer" },
                      { label: "NBA" },
                    ]}
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <StatTile label="Balance" value="$5,240.50" hint="USDC" icon={Wallet} />
              <StatTile label="Open positions" value="3" hint="2 Yes · 1 No" icon={LineChart} />
              <StatTile label="Today PnL" value="+$184.20" tone="win" icon={TrendingUp} />
              <StatTile label="Total volume" value="$28.4k" hint="last 30d" />
            </div>
            <div className="mt-4 rounded-2xl border border-border bg-surface p-6 shadow-card">
              <div className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                TeamName — hover (desktop) / tap (mobile) reveals full name
              </div>
              <p className="mb-4 max-w-2xl text-xs text-muted-foreground">
                Wrap any standalone <code className="font-mono text-foreground">team.short</code>
                render. Desktop shows a tooltip on hover; mobile triggers a sonner toast on tap.
                Click propagation is stopped so taps inside clickable cards don&apos;t navigate.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <TeamName short="MCI" full="Manchester City" className="text-base font-semibold" />
                <span className="text-muted-foreground">vs</span>
                <TeamName short="LIV" full="Liverpool" className="text-base font-semibold" />
                <span className="text-muted-foreground">·</span>
                <TeamName short="RMA" full="Real Madrid" className="text-base font-semibold" />
                <span className="text-muted-foreground">vs</span>
                <TeamName short="BAR" full="Barcelona" className="text-base font-semibold" />
              </div>
            </div>
          </Section>

          {/* BINARY EVENT */}
          <Section id="market" title="Binary Event (2 outcomes)" kicker="11 — 2-outcome event">
            <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
              A <strong className="text-foreground">binary event</strong> has exactly two outcomes that mirror each other:
              <code className="font-mono text-foreground"> p(outcome A) + p(outcome B) = 100</code>. The two outcomes ARE the two
              tradable sides — there is <strong className="text-foreground">no nested YES/NO</strong> per outcome and no per-outcome
              order book. The variants below cover both surfaces: list-level cards (aliased team labels vs neutral Yes/No fallback)
              and the shared order book that uses the two outcome labels as its column headers.
            </p>

            {/* 11a — Team-vs-team (aliased) */}
            <div className="mb-4 flex items-baseline justify-between">
              <h3 className="font-display font-semibold text-lg">11a · Team-vs-team <span className="text-muted-foreground font-normal">— aliased</span></h3>
              <code className="font-mono text-[10px] text-muted-foreground">sideLabels: {`{ yes: "Chelsea", no: "PSG" }`}</code>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <MarketCard
                league="laliga"
                question="El Clásico — who lifts the trophy?"
                yes={{ team: teams.realMadrid, probability: 54, delta24h: 3 }}
                no={{ team: teams.barcelona }}
                volume="$182k"
                endsIn="2d 14h"
                openInterest="412K"
              />
              <SentimentCard
                league="ucl"
                question="Chelsea vs PSG — who advances?"
                home="Chelsea"
                away="PSG"
                kickoff="Today 8:00pm"
                yesNotional={1240000}
                noNotional={680000}
                sideLabels={{ yes: "Chelsea", no: "PSG" }}
                openInterest="$1.92M"
                oiDelta24h={12}
              />
              <OrderBook sideLabels={{ yes: "Man City", no: "Real Madrid" }} />
            </div>
            <div className="mt-3 rounded-xl border border-loss/30 bg-loss/10 px-4 py-2.5 text-xs text-loss">
              When <code className="font-mono">sideLabels</code> exist, user-facing text is the alias (team/player name) — never the literal "YES/NO". Color carries the semantic: primary/green = first side, neon/red = second side.
            </div>

            {/* 11b — Neutral */}
            <div className="mt-10 mb-4 flex items-baseline justify-between">
              <h3 className="font-display font-semibold text-lg">11b · Neutral <span className="text-muted-foreground font-normal">— no alias</span></h3>
              <code className="font-mono text-[10px] text-muted-foreground">sideLabels: undefined</code>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <MarketCard
                league="epl"
                question="Will it rain at kickoff in Manchester?"
                yes={{ team: teams.yes, probability: 38 }}
                no={{ team: teams.no }}
                volume="$24k"
                endsIn="6h 12m"
                openInterest="48K"
              />
              <SentimentCard
                league="nba"
                question="Will tonight's game go to overtime?"
                home="Yes"
                away="No"
                kickoff="Tip-off 7:30pm"
                yesNotional={210000}
                noNotional={540000}
                openInterest="$0.75M"
                oiDelta24h={-4}
              />
              <OrderBook />
            </div>
            <div className="mt-3 rounded-xl border border-border bg-white/[0.02] px-4 py-2.5 text-xs text-muted-foreground">
              Only when the event provides no <code className="font-mono text-foreground">sideLabels</code> do literal "Yes" / "No" appear as user text — and even then it's a single market with one Trade button per side, not two nested binaries.
            </div>
          </Section>

          {/* MULTI-OUTCOME EVENT */}
          <Section id="multi" title="Multi-Outcome Event (3+ outcomes)" kicker="12 — N-outcome event">
            <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
              When an event has <strong className="text-foreground">3 or more outcomes</strong> (tournament winner, top scorer,
              group winner, 1X2 with Draw, …) each outcome becomes its own independent binary sub-market with its own
              <code className="font-mono text-foreground"> YES / NO</code> sides and its own order book — prices do <em>not</em>
              sum across outcomes (Man City reaching the final does not preclude Real Madrid from also reaching it). This is
              the <strong className="text-foreground">only</strong> case where per-outcome YES/NO appears. Binary (2-outcome)
              events follow Section 11 instead.
            </p>
            <EventHeader
              league="ucl"
              home="UCL Semis"
              away="4 Markets"
              kickoff="Tonight · 20:00 BST"
              status="upcoming"
              volume="$1.4M"
              liquidity="$420k"
              endsIn="6h 30m"
            />
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MarketCard
                league="ucl"
                question="Man City reach the final?"
                yes={{ team: teams.manCity, probability: 64, delta24h: 5 }}
                no={{ label: "—" }}
                volume="$480k"
                endsIn="6h 30m"
                openInterest="180K"
              />
              <MarketCard
                league="ucl"
                question="Real Madrid reach the final?"
                yes={{ team: teams.realMadrid, probability: 58, delta24h: -2 }}
                no={{ label: "—" }}
                volume="$390k"
                endsIn="6h 30m"
                openInterest="142K"
              />
              <MarketCard
                league="ucl"
                question="Chelsea reach the final?"
                yes={{ team: teams.chelsea, probability: 41, delta24h: 3 }}
                no={{ label: "—" }}
                volume="$310k"
                endsIn="6h 30m"
                openInterest="98K"
              />
              <MarketCard
                league="ucl"
                question="PSG reach the final?"
                yes={{ team: teams.psg, probability: 37, delta24h: -1 }}
                no={{ label: "—" }}
                volume="$260k"
                endsIn="6h 30m"
                openInterest="86K"
              />
            </div>
            <div className="mt-3 rounded-xl border border-border bg-white/[0.02] px-4 py-2.5 text-xs text-muted-foreground">
              4 outcomes · 4 independent YES/NO sub-markets · probabilities sum to <span className="text-foreground tabular-nums">200%</span>, not 100% — each YES is judged on its own.
            </div>
          </Section>

          {/* QUESTION-MODE EVENT HEADER */}
          <Section id="question-header" title="Event Header — Question Mode" kicker="12b — Text-First Events">
            <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
              When an event has no two-team fixture (tournament winners, top-scorer races, group winners, prop questions), the header drops the <code className="font-mono text-foreground">vs</code> crest pair and becomes a left-aligned text block: league badge + kind chip → declarative title → meta row. Works even when outcomes can't be mapped to a single team or player.
            </p>
            <div className="space-y-5">
              <QuestionHeaderDemo
                market={{
                  id: "demo-wc-champion",
                  kind: "league-winner",
                  shape: "three-way",
                  title: "World Cup 2026 — Champion",
                  kindLabel: "Tournament winner · 48 nations",
                  league: { name: "World Cup 2026", short: "WC" },
                  endsLabel: "Settles Jul 19, 2026",
                  volume: "$8.95M",
                  volume24h: "$1.18M",
                  participants: 25070,
                  outcomes: [],
                  tradeHref: "#",
                }}
              />
              <QuestionHeaderDemo
                market={{
                  id: "demo-epl-top-scorer",
                  kind: "top-scorer",
                  shape: "three-way",
                  title: "Premier League — Top scorer 25/26",
                  league: { name: "Premier League", short: "EPL" },
                  endsLabel: "Settles May 24, 2026",
                  volume: "$3.6M",
                  volume24h: "$420K",
                  participants: 6210,
                  outcomes: [],
                  tradeHref: "#",
                }}
              />
              <QuestionHeaderDemo
                market={{
                  id: "demo-wc-grpf-winner",
                  kind: "league-winner",
                  shape: "three-way",
                  title: "Group F — Winner",
                  kindLabel: "Group winner",
                  league: { name: "World Cup 2026", short: "WC" },
                  endsLabel: "Settles Jun 24, 2026",
                  volume: "$640K",
                  volume24h: "$72K",
                  participants: 1820,
                  outcomes: [],
                  tradeHref: "#",
                }}
              />
            </div>
          </Section>

          {/* LIVE EVENT HEADER (fixture mode) */}
          <Section id="live-event-header" title="Event Header — Live Score" kicker="12c — Live Fixture Mode">
            <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
              When a fixture event is live, the center column of <code className="font-mono text-foreground">EventDetailHeader</code> swaps the serif <code className="font-mono text-foreground">vs</code> + kickoff chip for a broadcast-style score: a pulsing <span className="text-primary">● LIVE</span> pill, big tabular-nums <code className="font-mono text-foreground">{`{home} – {away}`}</code>, and a muted <code className="font-mono text-foreground">Official scoring</code> line with the shared <code className="font-mono text-foreground">LiveDelayInfo</code> ⓘ trigger. Score in the header beats the 30–60s stream delay — users see the truth on landing.
            </p>
            <div className="rounded-3xl border border-border bg-surface p-8 shadow-card">
              <div className="flex items-center justify-around gap-6">
                <div className="flex flex-col items-center gap-2">
                  <div className="grid h-20 w-20 place-items-center rounded-2xl bg-white/[0.04] ring-1 ring-white/10 text-2xl">🇲🇽</div>
                  <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/80">Mexico</div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary ring-1 ring-primary/30">
                    <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary shadow-[0_0_8px_currentColor]" />
                    Live
                  </span>
                  <div className="flex items-baseline gap-3 font-display text-5xl font-semibold leading-none tabular-nums text-foreground md:text-6xl">
                    <span>1</span>
                    <span className="text-foreground/30">–</span>
                    <span>0</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">
                    <span>Official scoring</span>
                    <LiveDelayInfo variant="score" tone="muted" />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="grid h-20 w-20 place-items-center rounded-2xl bg-white/[0.04] ring-1 ring-white/10 text-2xl">🇿🇦</div>
                  <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-foreground/80">South Africa</div>
                </div>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-border bg-white/[0.02] px-4 py-2.5 text-xs text-muted-foreground">
              Falls back to the serif <code className="font-mono text-foreground">vs</code> + <code className="font-mono text-foreground">3:00PM · TODAY</code> pill when the match isn't live or has no <code className="font-mono text-foreground">liveScore</code>.
            </div>
          </Section>

          {/* TRADE SURFACE */}
          <Section id="trade" title="Trade Surface" kicker="13 — Detail">
            <p className="mb-2 max-w-2xl text-sm text-muted-foreground">
              Perpetual-contract buying on binary outcomes. <span className="text-foreground">Leverage is a first-class control</span> — exposed by default alongside Margin, not hidden. The <code className="font-mono text-foreground">PRO</code> switch only reveals truly advanced extras: margin mode, TP/SL, and the liquidation-price visualizer.
            </p>
            <p className="mb-6 max-w-2xl text-xs text-muted-foreground/80">
              This event has <code className="font-mono text-foreground">sideLabels: {`{ yes: "Man City", no: "Real Madrid" }`}</code> — YES/NO never shown to users.
            </p>
            <p className="mb-6 max-w-2xl text-xs text-muted-foreground/70">
              Isolated margin — coming soon. Cross is the only mode at launch.
            </p>

            <EventHeader
              league="ucl"
              home="Man City"
              away="Real Madrid"
              kickoff="Wed · 21:00 BST"
              status="upcoming"
              volume="$182k"
              liquidity="$54k"
              endsIn="2d 14h"
            />

            <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
              <div className="space-y-5">
                <OutcomeSelector
                  options={[
                    { team: teams.manCity, probability: 38 },
                    { team: teams.realMadrid, probability: 62 },
                  ]}
                  value="no"
                  onChange={() => {}}
                />
                <PriceChart tone="no" />
                <OrderBook sideLabels={{ yes: "Man City", no: "Real Madrid" }} />
              </div>
              <TradeForm outcome="no" outcomeLabel="Real Madrid" price={62} />
            </div>

            <div className="mt-6">
              <PositionsTable />
            </div>
            <p className="mt-6 mb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              PositionsTable · interaction contract
            </p>
            <ul className="mb-3 list-disc space-y-1 pl-5 text-xs text-muted-foreground">
              <li>
                <span className="text-foreground">Market pill</span>:
                binary events show just the team alias (color = side). Multi
                outcomes show <code className="font-mono text-foreground">{`<ALIAS> YES|NO`}</code> — pass{" "}
                <code className="font-mono text-foreground">eventShape: "multi"</code> on each row.
              </li>
              <li>
                <span className="text-foreground">TP / SL column</span>: per-row
                inline status with click-to-edit. Pass{" "}
                <code className="font-mono text-foreground">onUpdateTpsl(idx, {`{tp, sl}`})</code>;
                validation rules are shared with <code className="font-mono text-foreground">TradeForm</code> via{" "}
                <code className="font-mono text-foreground">@/lib/tpsl</code>.
              </li>
              <li>
                <span className="text-foreground">Close / Cancel</span> always
                require a two-step confirm (shadcn AlertDialog) showing the
                full row context before mutating.
              </li>
              <li>
                <span className="text-foreground">Airdrop variant</span>: rows
                with <code className="font-mono text-foreground">isAirdrop: true</code> show
                a purple <code className="font-mono text-foreground">AIRDROP</code> badge,
                lock the TP/SL cell (hover tooltip explains why), and are
                capped at 5× leverage upstream.
              </li>
            </ul>
            <PositionsTable
              positions={[
                {
                  market: "Canada vs Bosnia-Herzegovina",
                  league: "ucl",
                  outcome: "yes",
                  outcomeLabel: "CAN",
                  eventShape: "multi",
                  size: 90,
                  entry: 29,
                  mark: 31,
                  leverage: 1,
                  mode: "cross",
                  margin: 27,
                  liq: 99,
                  pnl: 0.36,
                  tp: 40,
                  sl: 20,
                },
                {
                  market: "Canada vs Bosnia-Herzegovina",
                  league: "ucl",
                  outcome: "no",
                  outcomeLabel: "BIH",
                  eventShape: "multi",
                  size: 60,
                  entry: 25,
                  mark: 22,
                  leverage: 1,
                  mode: "cross",
                  margin: 15,
                  liq: 99,
                  pnl: 1.8,
                  tp: null,
                  sl: null,
                },
              ]}
              orders={[
                {
                  market: "Canada vs Bosnia-Herzegovina",
                  league: "ucl",
                  outcome: "yes",
                  outcomeLabel: "DRAW",
                  eventShape: "multi",
                  type: "limit",
                  price: 22,
                  size: 200,
                  filled: 40,
                },
              ]}
              history={[]}
              onClosePosition={() => {}}
              onCancelOrder={() => {}}
              onUpdateTpsl={() => {}}
            />
          </Section>

          {/* TRADING LANGUAGE */}
          <Section id="language" title="Trading Language" kicker="14 — Rules">
            <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
              OmenX is a perpetual-contract market on binary outcomes. Price = probability. Never frame it as gambling.
            </p>

            {/* Event types table — top-of-section because it governs the whole product */}
            <div className="mb-6 rounded-2xl border border-border bg-surface p-6 shadow-card">
              <div className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Event types</div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      <th className="py-1.5 pr-4">Type</th>
                      <th className="py-1.5 pr-4">Markets</th>
                      <th className="py-1.5 pr-4">Prices sum to</th>
                      <th className="py-1.5">UI rule</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-2 pr-4 font-medium">Binary event <span className="text-muted-foreground">(aliased)</span></td>
                      <td className="py-2 pr-4 font-mono tabular-nums">2 outcomes</td>
                      <td className="py-2 pr-4 font-mono tabular-nums">100 across the 2 outcomes</td>
                      <td className="py-2">Outcome labels everywhere (team/player) · 1 Trade button per outcome · shared order book · no nested YES/NO</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">Binary event <span className="text-muted-foreground">(neutral)</span></td>
                      <td className="py-2 pr-4 font-mono tabular-nums">2 outcomes</td>
                      <td className="py-2 pr-4 font-mono tabular-nums">100 across the 2 outcomes</td>
                      <td className="py-2">Literal "Yes" / "No" labels · still 1 Trade button per outcome · shared order book · no nested YES/NO</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">Multi-outcome event <span className="text-muted-foreground">(3+ outcomes)</span></td>
                      <td className="py-2 pr-4 font-mono tabular-nums">N outcomes</td>
                      <td className="py-2 pr-4 font-mono">each outcome independent (sums &gt; 100)</td>
                      <td className="py-2">Per-outcome YES/NO buttons · per-outcome order book · only place YES/NO is exposed</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                <li>1. Vocabulary: <strong className="text-foreground">event</strong> = the question/contest. <strong className="text-foreground">market</strong> = one outcome inside it. Binary event = 2 outcomes = 2 sides of one market. Multi-outcome event = N outcomes = N independent YES/NO sub-markets.</li>
                <li>2. <strong className="text-foreground">Binary events never render nested YES/NO.</strong> One Trade button per outcome, one shared order book. The two outcome labels are the two column headers.</li>
                <li>3. <code className="font-mono text-foreground">Yes/No</code> is the underlying technical label. Whenever a market provides <code className="font-mono text-foreground">sideLabels</code>, user-facing text uses the alias.</li>
                <li>4. <span className="text-win">Green = first / YES side</span> · <span className="text-loss">Red = second / NO side</span>. Color is the only signal that carries the side semantic.</li>
                <li>5. <span className="text-foreground">Leverage is a first-class control</span>, not a PRO feature. The trade form always shows the leverage slider next to Margin. <code className="font-mono text-foreground">PRO</code> only gates Cross/Iso, TP/SL, and liq visualization.</li>
              </ul>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
                <div className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Vocabulary</div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      <th className="py-1.5">Never</th>
                      <th className="py-1.5">Use instead</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      ["odds", "price (¢) · probability"],
                      ["bet · wager · stake", "position · order · margin"],
                      ["bookmaker · house", "orderbook · counterparty"],
                      ["payout · win amount", "settlement value · PnL"],
                      ["中奖 / 输掉", "settle / liquidate"],
                    ].map(([bad, good]) => (
                      <tr key={bad}>
                        <td className="py-2 font-mono text-loss line-through">{bad}</td>
                        <td className="py-2 font-mono text-win">{good}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
                  <div className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Color usage</div>
                  <ul className="space-y-2 text-xs">
                    <li><span className="inline-block h-2 w-2 rounded-full bg-primary mr-2" /><code className="font-mono text-primary">primary</code> — YES side (pill, orderbook, chart)</li>
                    <li><span className="inline-block h-2 w-2 rounded-full bg-neon mr-2" /><code className="font-mono text-neon">neon</code> — NO side (pill, orderbook, chart)</li>
                    <li><span className="inline-block h-2 w-2 rounded-full bg-win mr-2" /><code className="font-mono text-win">win</code> — YES side tags & sentiment fill</li>
                    <li><span className="inline-block h-2 w-2 rounded-full bg-loss mr-2" /><code className="font-mono text-loss">loss</code> — NO side tags & sentiment fill</li>
                    <li><span className="inline-block h-2 w-2 rounded-full bg-win mr-2" /><code className="font-mono text-win">win / loss</code> — PnL, ROE, liquidation, order status</li>
                    <li><span className="inline-block h-2 w-2 rounded-full bg-draw mr-2" /><code className="font-mono text-draw">draw</code> — neutral / pending</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
                  <div className="mb-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Formulas</div>
                  <dl className="space-y-1.5 font-mono text-xs">
                    <div className="flex justify-between"><dt className="text-muted-foreground">Notional</dt><dd>Margin × Leverage</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">PnL</dt><dd>(mark − entry)/100 × notional</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">NO price</dt><dd>100 − YES price (mirror)</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">ROE</dt><dd>PnL / Margin</dd></div>
                    <div className="flex justify-between"><dt className="text-muted-foreground">Liq (mock)</dt><dd>entry ∓ 100/lev</dd></div>
                  </dl>
                </div>
              </div>
            </div>
          </Section>

          <Section id="spacing" title="Spacing & Radius" kicker="15 — Geometry">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Spacing scale</div>
                <div className="flex items-end gap-2">
                  {[4, 8, 12, 16, 24, 32, 48].map((n) => (
                    <div key={n} className="flex flex-col items-center gap-2">
                      <div className="rounded bg-primary/40" style={{ width: 28, height: n }} />
                      <span className="font-mono text-[10px] text-muted-foreground">{n}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
                <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Radius scale</div>
                <div className="flex items-center gap-3">
                  {[
                    ["sm", "rounded-sm"],
                    ["md", "rounded-md"],
                    ["lg", "rounded-lg"],
                    ["xl", "rounded-xl"],
                    ["2xl", "rounded-2xl"],
                    ["3xl", "rounded-3xl"],
                  ].map(([name, cls]) => (
                    <div key={name} className="flex flex-col items-center gap-2">
                      <div className={cn("h-14 w-14 bg-primary/30 ring-1 ring-primary/40", cls)} />
                      <span className="font-mono text-[10px] text-muted-foreground">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-surface p-6 shadow-card">
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Page rhythm</div>
              <p className="mb-5 text-xs text-muted-foreground">
                Vertical spacing rules for every route. Apply at the page shell, not inside individual cards.
              </p>
              <div className="grid gap-5 md:grid-cols-[260px_1fr]">
                {/* Visual */}
                <div className="rounded-xl border border-border bg-background/40 p-3">
                  <div className="h-7 rounded-md bg-white/[0.06] ring-1 ring-white/10 grid place-items-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground">TopBar</div>
                  <div className="my-2 flex items-center justify-center">
                    <span className="font-mono text-[10px] text-primary">↕ pt-8 / md:pt-10</span>
                  </div>
                  <div className="h-5 rounded-md bg-gradient-neon/40 ring-1 ring-white/10 grid place-items-center text-[10px] font-mono uppercase tracking-widest text-foreground">Section H1</div>
                  <div className="my-1.5 flex items-center justify-center">
                    <span className="font-mono text-[10px] text-primary">↕ gap-4</span>
                  </div>
                  <div className="h-12 rounded-lg bg-white/[0.04] ring-1 ring-white/10" />
                  <div className="my-2 flex items-center justify-center">
                    <span className="font-mono text-[10px] text-primary">↕ gap-5</span>
                  </div>
                  <div className="h-5 rounded-md bg-gradient-neon/40 ring-1 ring-white/10 grid place-items-center text-[10px] font-mono uppercase tracking-widest text-foreground">Section H2</div>
                  <div className="my-1.5 flex items-center justify-center">
                    <span className="font-mono text-[10px] text-primary">↕ gap-4</span>
                  </div>
                  <div className="h-12 rounded-lg bg-white/[0.04] ring-1 ring-white/10" />
                </div>
                {/* Table */}
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      <th className="py-2 pr-4">Gap</th>
                      <th className="py-2 pr-4">Tailwind</th>
                      <th className="py-2 pr-4">px</th>
                      <th className="py-2">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="py-2 pr-4 font-medium">TopBar → first H1</td>
                      <td className="py-2 pr-4 font-mono text-primary">pt-8 / md:pt-10</td>
                      <td className="py-2 pr-4 font-mono tabular-nums">32 / 40</td>
                      <td className="py-2 text-muted-foreground">Page shell — never 0. Without this, the bar collides with the H1.</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">H1/H2 → first card</td>
                      <td className="py-2 pr-4 font-mono text-primary">gap-4</td>
                      <td className="py-2 pr-4 font-mono tabular-nums">16</td>
                      <td className="py-2 text-muted-foreground">Inside a section's flex column.</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">Sibling sections</td>
                      <td className="py-2 pr-4 font-mono text-primary">gap-5</td>
                      <td className="py-2 pr-4 font-mono tabular-nums">20</td>
                      <td className="py-2 text-muted-foreground">Vertical stack inside the main grid.</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">Card padding</td>
                      <td className="py-2 pr-4 font-mono text-primary">p-5 · p-6</td>
                      <td className="py-2 pr-4 font-mono tabular-nums">20 · 24</td>
                      <td className="py-2 text-muted-foreground">p-5 default · p-6 for hero/dense.</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 font-medium">Page horizontal</td>
                      <td className="py-2 pr-4 font-mono text-primary">px-6 / md:px-8</td>
                      <td className="py-2 pr-4 font-mono tabular-nums">24 / 32</td>
                      <td className="py-2 text-muted-foreground">Outer gutter; matches TopBar gutter.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </Section>

          <Section id="fans" title="Personalized Zone" kicker="16 — Fans Zone">
            <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
              The left column of the home page is a personalized zone, not an editorial slot.
              Content is keyed off the user's <code className="font-mono text-foreground">followedTeams</code>
              and mixes one trading surface with social surfaces. The stack order is fixed
              so users learn where to look.
            </p>

            <div className="grid gap-4 lg:grid-cols-2">
              {/* Filled state */}
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Filled state</div>
                  <span className="rounded-full bg-win/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-win">followedTeams.length &gt; 0</span>
                </div>
                <ol className="space-y-2.5 text-xs">
                  <li className="flex items-start gap-3">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/20 font-mono text-[10px] text-primary">1</span>
                    <div>
                      <div className="font-medium text-foreground">Followed-team match card</div>
                      <div className="text-muted-foreground">Next fixture of any followed team · full <code className="font-mono">MatchMarketCard</code></div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/20 font-mono text-[10px] text-primary">2</span>
                    <div>
                      <div className="font-medium text-foreground">Fan post</div>
                      <div className="text-muted-foreground">Latest editorial / community post tagged to a followed team</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/20 font-mono text-[10px] text-primary">3</span>
                    <div>
                      <div className="font-medium text-foreground">Live activity</div>
                      <div className="text-muted-foreground">Trades on followed teams · social proof, never aggregated stats</div>
                    </div>
                  </li>
                </ol>
                <p className="mt-4 text-[11px] text-muted-foreground">
                  Order is fixed: trade → post → live activity. Never reshuffle by recency.
                </p>
              </div>

              {/* Empty state */}
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Empty state</div>
                  <span className="rounded-full bg-loss/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-loss">followedTeams.length === 0</span>
                </div>
                <ol className="space-y-2.5 text-xs">
                  <li className="flex items-start gap-3">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-neon/20 font-mono text-[10px] text-neon">1</span>
                    <div>
                      <div className="font-medium text-foreground">Editor's pick kicker</div>
                      <div className="text-muted-foreground">Dashed strip · `Editor's pick · follow your team to personalize`</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-neon/20 font-mono text-[10px] text-neon">2</span>
                    <div>
                      <div className="font-medium text-foreground">Editorial match card</div>
                      <div className="text-muted-foreground">Same `MatchMarketCard`, real content — never an empty illustration</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-neon/20 font-mono text-[10px] text-neon">3</span>
                    <div>
                      <div className="font-medium text-foreground">Follow chips · 5 suggested clubs</div>
                      <div className="text-muted-foreground">One-tap follow with check/plus state · local until `Save preferences`</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-neon/20 font-mono text-[10px] text-neon">4</span>
                    <div>
                      <div className="font-medium text-foreground">Live activity</div>
                      <div className="text-muted-foreground">Trades across all markets · same component, unfiltered</div>
                    </div>
                  </li>
                </ol>
                <p className="mt-4 text-[11px] text-muted-foreground">
                  Never show a blank or illustration-only state — real content + onboarding side-by-side.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-xs">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Rules</div>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>• Header is single-line at every column width: title <code className="font-mono text-foreground">Fans zone</code> (text-2xl, matches other section titles, no decorative suffix) + pill <code className="font-mono text-foreground">N teams</code> with <code className="font-mono text-foreground">Users</code> icon. Empty-state pill reads <code className="font-mono text-foreground">Add team</code>. Neither side wraps.</li>
                <li>• Post never appears without a paired trade card above it.</li>
                <li>• Live activity sits last in the stack — never above trade or post. Rows are specific (avatar + handle + side + outcome + price + event + time), never "N people are betting" aggregates. Sides use semantic tokens: <code className="font-mono text-foreground">bought=win</code>, <code className="font-mono text-foreground">sold=loss</code>. If the filtered set is empty, the card hides entirely — no in-card empty state.</li>
                <li>• Empty-state chips toggle locally; persistence happens on `Save preferences`, not per-tap.</li>
                <li>• The column is always present — never collapsed even at the 3-col → 2-col breakpoint; it just reflows under the main grid.</li>
              </ul>
            </div>
          </Section>

          <Section id="events-grid" title="Events Grid" kicker="17 — Live & Upcoming">
            <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
              The middle-column events grid is a responsive card grid with a fixed default
              height, so the modules below it (Season markets, Fans zone tail) keep first-screen
              exposure as the event count grows.
            </p>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
                <div className="mb-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">Equal-height cards</div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li>• Every <code className="font-mono text-foreground">EventMarketTileCard</code> stretches to the tallest sibling in its row. The card uses <code className="font-mono text-foreground">h-full flex flex-col</code>, the outcomes block uses <code className="font-mono text-foreground">flex-1</code>, and the footer uses <code className="font-mono text-foreground">mt-auto</code>.</li>
                  <li>• Any wrapper between the grid and the card MUST pass <code className="font-mono text-foreground">h-full</code> through, or the anchor collapses to content height and the row goes ragged.</li>
                  <li>• Never set a fixed pixel height on the card itself — three-way (1·X·2) and binary cards have different intrinsic content, and the row-stretch is what unifies them.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
                <div className="mb-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">Default = one row</div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li>• Grid columns: <code className="font-mono text-foreground">1 (base) · 2 (md) · 3 (xl)</code>. Default collapsed view shows exactly the first row at each breakpoint — extra cards use <code className="font-mono text-foreground">hidden md:block</code> / <code className="font-mono text-foreground">hidden xl:block</code> / <code className="font-mono text-foreground">hidden</code>.</li>
                  <li>• A dashed full-width <code className="font-mono text-foreground">ShowMoreEventsButton</code> sits below the grid only when <code className="font-mono text-foreground">visibleMarkets.length &gt; 1</code>. Labels: <code className="font-mono text-foreground">Show all {`{N}`} events</code> / <code className="font-mono text-foreground">Show less</code>.</li>
                  <li>• Switching day strip selection (incl. ALL) auto-resets to collapsed. Never persist expanded state across filters.</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-xs">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Rules</div>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>• Equal card height is non-negotiable — the row reads as a single comparable shelf, not a staircase. If a new card variant breaks the row, fix the variant (footer pinning, flex-1 fill), not the grid.</li>
                <li>• Empty state for a selected day is a dashed surface (matches <code className="font-mono text-foreground">Section 15 / Section 16</code>): <code className="font-mono text-foreground">No events scheduled for {`{dayLabel}`}.</code></li>
                <li>• Section header keeps the live dot + open-positions + today-PnL meta. No <code className="font-mono text-foreground">Browse all</code> link — this page IS the sport's full events page.</li>
                <li>• All section headers (Fans zone / Live &amp; upcoming / Season) share <code className="font-mono text-foreground">min-h-9 leading-9</code> so titles align on the same baseline across columns. Never set <code className="font-mono text-foreground">leading-none</code> on a section h2 — it breaks cross-column alignment.</li>
              </ul>
            </div>

            <div className="mt-6 rounded-2xl border border-[color:var(--accent)]/30 bg-surface p-5 text-xs ring-1 ring-[color:var(--accent)]/15">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-[color:var(--accent)]">Live Stream Card</div>
              {(() => {
                const live = MATCH_MARKETS.find((m) => m.isLiveStream);
                return live ? (
                  <div className="mb-4 max-w-xl">
                    <LiveStreamCard market={live} />
                  </div>
                ) : null;
              })()}
              <ul className="space-y-1.5 text-muted-foreground">
                <li>• Driven by <code className="font-mono text-foreground">market.isLiveStream === true</code>. One card per active stream, stacked vertically <em>above</em> the regular event tile grid; never mixed inline with them.</li>
                <li>• Card spans the full width of the events column at every breakpoint — it is intentionally heavier than <code className="font-mono text-foreground">EventMarketTileCard</code> (poster image, lime LIVE pill, accent ring) so the user can't miss that we're broadcasting.</li>
                <li>• Anatomy top → bottom: <code className="font-mono text-foreground">LIVE pill + league + CC/cast icons</code> → <code className="font-mono text-foreground">16:9 poster with play overlay</code> → <code className="font-mono text-foreground">team crests + live score + match clock</code> → <code className="font-mono text-foreground">progress bar (clock vs 90′)</code> → <code className="font-mono text-foreground">2 headline outcomes + Trade CTA</code> → meta footer.</li>
                <li>• Draw outcomes are filtered out of the headline strip — only the two team sides surface, to keep the bar compact.</li>
                <li>• Trade CTA links to <code className="font-mono text-foreground">/event/$id</code>. Captions / cast buttons are visual placeholders today; promote to real handlers when streaming lands.</li>
              </ul>
            </div>
          </Section>

          <Section id="mobile-shell" title="Mobile Shell" kicker="18 — Mobile homepage">
            <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
              Mobile has no Home tab. <code className="font-mono text-foreground">/</code> redirects
              to <code className="font-mono text-foreground">/events</code> on mobile viewports;
              account data lives only in <code className="font-mono text-foreground">MeSheet</code> to
              avoid duplication. Three tabs, zero content overlap:
              <b className="text-foreground"> Events</b> (default) = live hero + day strip + upcoming
              grid + "Explore tournaments" hub entries;
              <b className="text-foreground"> Fans</b> = social feed (follow, trades, posts);
              <b className="text-foreground"> Me</b> = bottom sheet with account + OmenX shortcuts.
            </p>

            <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
              <PhoneFrame>
                <MobileTopBar
                  userName="Jeremy"
                  userAvatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces&q=80"
                  onAvatarClick={() => {}}
                />
                <div className="space-y-5 px-4 py-5">
                  <div className="rounded-2xl border border-dashed border-border bg-surface/40 px-4 py-6 text-center text-xs text-muted-foreground">
                    /events page preview — see MobileEventsSection
                  </div>
                </div>
                <div className="pointer-events-none sticky bottom-0">
                  <MobileBottomNav onMeClick={() => {}} />
                </div>
              </PhoneFrame>

              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
                  <div className="mb-3 text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    Anatomy
                  </div>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li>• <code className="font-mono text-foreground">MobileTopBar</code> — OmenX logo + Sports lockup (left), bell + avatar (right). Hidden ≥ md.</li>
                    <li>• <code className="font-mono text-foreground">MobileLiveHero</code> — full live-stream card stack. Lives only on /events.</li>
                    <li>• <code className="font-mono text-foreground">MobileBottomNav</code> — fixed bottom, 3 tabs (Events / Fans / Me), safe-area aware. Tabs are real routes via TanStack `Link`; Me opens the sheet.</li>
                    <li>• <code className="font-mono text-foreground">MeSheet</code> — bottom sheet: user + Equity → 3 stats (BridgeStrip) → Open Portfolio CTA → 2×2 Explore OmenX grid → menu → Sign out. All routes that left the sports zone live in here.</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-xs">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Rules
                  </div>
                  <ul className="space-y-1.5 text-muted-foreground">
                    <li>• `/` is desktop-only. On mobile viewports, `/` redirects to `/events` in a useEffect (no Home tab in bottom nav).</li>
                    <li>• Zero overlap across tabs: live hero + spotlight live ONLY on /events, FanZoneHeader ONLY on /fans. No teaser/SeeMore cards between tabs.</li>
                    <li>• Account data (equity / positions / PnL) appears ONLY in `MeSheet` on mobile; `BridgeStrip` is desktop-only.</li>
                    <li>• Bottom tabs never include cross-OmenX destinations — those belong in `MeSheet`.</li>
                    <li>• Mobile event grid collapses to single column; live cards become the dedicated `MobileLiveHero`, not `LiveStreamCard`.</li>
                    <li>• <b>Promo / campaign pages</b> (e.g. <code className="font-mono text-foreground">/promo/world-cup</code>) render <code className="font-mono text-foreground">{'<MobileChrome hideBottomNav>'}</code>: top bar stays (avatar still opens MeSheet), bottom tab bar is hidden, and main bottom padding shrinks from <code className="font-mono text-foreground">pb-24</code> to <code className="font-mono text-foreground">pb-8</code>. Use for self-contained campaign flows that have their own in-page tabs and shouldn't compete with the global nav.</li>
                  </ul>
                </div>
                <MeSheetPreviewLauncher />
              </div>
            </div>
          </Section>

          <Section id="mobile-fans" title="Mobile Fans Zone" kicker="18b — /fans (mobile, Figma 1:10216)">
            <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
              Mobile rebuild of the Fans tab. Header + Editor's pick match card +
              Follow your team grid + Live activity feed. Desktop and data /
              interaction logic are unchanged — this is a presentation-only
              mobile UI matching the Figma frame.
            </p>
            <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
              <PhoneFrame>
                <MobileTopBar
                  userName="Jeremy"
                  userAvatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces&q=80"
                  onAvatarClick={() => {}}
                />
                <div className="px-4 py-4">
                  <MobileFansSection />
                </div>
                <div className="pointer-events-none sticky bottom-0">
                  <MobileBottomNav onMeClick={() => {}} />
                </div>
              </PhoneFrame>
              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-surface p-5 shadow-card text-xs text-muted-foreground">
                  <div className="mb-2 font-mono text-[10px] uppercase tracking-widest">Composition</div>
                  <ul className="space-y-1.5">
                    <li>• Section header: green 3px bar + "FANS ZONE" + Add Teams pill → opens <code className="font-mono text-foreground">TeamPickerSheet</code></li>
                    <li>• Editor's pick card: three-way market (CAN / Draw / BIH) with tri-segment probability bar, trend pills, and footer meta</li>
                    <li>• Follow your team: 5 crests with toggle + green Save (toast)</li>
                    <li>• Live activity: handle + Bought/Sold + colored outcome pill + event title + relative time</li>
                  </ul>
                </div>
              </div>
            </div>
          </Section>

          <Section id="league-hub" title="League Hub" kicker="19 — /league/$slug">
            <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
              Each league has its own hub at <code className="font-mono text-foreground">/league/$slug</code>
              with sub-tabs driven by the <code className="font-mono text-foreground">?view=</code> search param:
              <b className="text-foreground"> Games</b> (1X2 cards),
              <b className="text-foreground"> Props</b> (futures, group winners, player props — P1),
              <b className="text-foreground"> Bracket</b> (knockout tree, tournament-kind leagues only — P2).
              <code className="font-mono text-foreground">/events</code> is the cross-league time-based lobby;
              hub is the single-tournament depth view. Zero overlap.
            </p>

            <div className="mb-8 rounded-2xl border border-amber-300/30 bg-amber-300/[0.04] p-5">
              <div className="mb-1 font-mono text-[10px] uppercase tracking-widest text-amber-200">
                Brand assets — source of truth
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                League logos · do not regenerate or replace
              </h3>
              <p className="mt-1.5 max-w-3xl text-sm text-muted-foreground">
                The FIFA World Cup 2026 mark is the <b className="text-foreground">real brand asset</b> shipped at
                {" "}<code className="font-mono text-foreground">@/assets/leagues/world-cup-2026.png</code>.
                Never overlay a `Trophy` icon on top, never swap for a generated placeholder, never re-import a
                similarly named SVG. Every consumer reads from{" "}
                <code className="font-mono text-foreground">LEAGUES[].logo</code> /{" "}
                <code className="font-mono text-foreground">LeagueBadge</code> presets — fix the source, not the
                call site. Same rule applies to EPL / UCL / La Liga crests below.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-5 md:grid-cols-4">
                {LEAGUES.map((league) => (
                  <div
                    key={league.slug}
                    className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4"
                  >
                    <span
                      className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl bg-white/[0.06] p-2 ring-1 ring-white/10"
                      style={{ boxShadow: `0 0 24px -8px oklch(${league.accent} / 0.6)` }}
                    >
                      <img src={league.logo} alt={league.name} className="h-full w-full object-contain" />
                    </span>
                    <div className="text-center">
                      <div className="font-display text-xs font-semibold text-foreground">{league.name}</div>
                      <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                        {league.short}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-end gap-6 rounded-xl border border-border bg-surface p-4">
                <div className="flex flex-col items-center gap-1.5">
                  <LeagueBadge league="wc" size="sm" showLabel={false} />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">crest 20px</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <LeagueBadge league="wc" size="md" showLabel={false} />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">crest 28px</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-white/[0.04] p-1.5 ring-1 ring-white/10">
                    <img src={LEAGUES[0].logo} alt="" className="h-full w-full object-contain" />
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">coming-soon 40px</span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    className="grid h-20 w-20 place-items-center overflow-hidden rounded-2xl bg-white/[0.06] p-2 ring-1 ring-white/15"
                    style={{ boxShadow: `0 0 32px -8px oklch(${LEAGUES[0].accent} / 0.6)` }}
                  >
                    <img src={LEAGUES[0].logo} alt="" className="h-full w-full object-contain" />
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">hero 80px</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  LeagueEntryCard — `/events` row + desktop home grid
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {LEAGUES.map((league) => (
                    <LeagueEntryCard
                      key={league.slug}
                      league={league}
                      matchCount={getMatchMarketsByLeagueSlug(league.slug).length}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  LeagueSpotlightCard + LeagueComingSoonCard — homepage "Explore Tournaments" rollout layout
                </div>
                <div className="flex flex-col gap-4">
                  {LEAGUES.filter((l) => l.status === "featured").map((league) => {
                    const matches = getMatchMarketsByLeagueSlug(league.slug);
                    const spotlights = getSpotlightsByLeagueSlug(league.slug);
                    const binaries = getBinaryQuestionsByLeagueSlug(league.slug);
                    const highlights = [
                      ...spotlights
                        .slice(0, 3)
                        .map((s) => s.tagline ?? `${s.firstName} ${s.lastName}`),
                      ...binaries.slice(0, 3).map((b) => b.title),
                    ]
                      .filter(Boolean)
                      .slice(0, 4) as string[];
                    return (
                      <LeagueSpotlightCard
                        key={league.slug}
                        league={league}
                        eventCount={matches.length + spotlights.length + binaries.length}
                        highlights={highlights}
                        kickoffLabel="Kicks off June 11"
                      />
                    );
                  })}
                  <div className="grid gap-2.5 md:grid-cols-3">
                    {LEAGUES.filter((l) => l.status === "coming-soon").map(
                      (league) => (
                        <LeagueComingSoonCard key={league.slug} league={league} />
                      ),
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  LeagueHubHero — accent gradient driven by `league.accent` (OKLCH triplet)
                </div>
                <LeagueHubHero
                  league={LEAGUES[0]}
                  kickoffLabel="Jun 11, 2026"
                  hostFlags={[
                    { code: "us", name: "USA" },
                    { code: "ca", name: "Canada" },
                    { code: "mx", name: "Mexico" },
                  ]}
                  stats={[
                    { label: "Nations", value: "48" },
                    { label: "Matches", value: "104" },
                    { label: "Groups", value: "12" },
                    { label: "Host cities", value: "16" },
                  ]}
                />
              </div>

              <div>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Card chip taxonomy — league chip (cross-league) vs TypeChip (inside hub)
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="mb-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      Default — homepage / cross-league lobby (LeagueChip)
                    </div>
                    {getMatchMarketsByLeagueSlug("world-cup-2026")
                      .slice(0, 1)
                      .map((m) => (
                        <EventMarketTileCard key={m.id} market={m} />
                      ))}
                  </div>
                  <div>
                    <div className="mb-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      hubContext — inside `/league/$slug` (TypeChip stage)
                    </div>
                    {getMatchMarketsByLeagueSlug("world-cup-2026")
                      .slice(0, 1)
                      .map((m) => (
                        <EventMarketTileCard key={m.id} market={m} hubContext />
                      ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Card header anatomy — single source of truth via &lt;CardHeader /&gt;
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <div className="mb-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      ✓ kicker chip + title
                    </div>
                    <CardHeader
                      chip={<TypeChip icon={UsersIcon} label="Group winner" tone="amber" />}
                      title="Group I · Winner"
                    />
                  </div>
                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <div className="mb-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      ✓ chip + status + title
                    </div>
                    <CardHeader
                      chip={<TypeChip icon={TrophyIcon} label="Round of 32" tone="amber" />}
                      status={
                        <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.7_0.22_25_/_0.12)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[oklch(0.78_0.18_45)] ring-1 ring-[oklch(0.7_0.22_25_/_0.25)]">
                          <Flame className="h-3 w-3" /> Hot
                        </span>
                      }
                      title="Mexico vs Canada"
                    />
                  </div>
                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <div className="mb-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                      ✓ title only (no chip)
                    </div>
                    <CardHeader title="Will Messi play in WC26?" />
                  </div>
                  <div className="rounded-2xl border border-dashed border-[oklch(0.7_0.22_25_/_0.35)] bg-surface p-4 opacity-70">
                    <div className="mb-2 font-mono text-[9px] uppercase tracking-widest text-[oklch(0.82_0.16_25)]">
                      ✗ chip on the right
                    </div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-base font-semibold text-foreground">Group I · Winner</h3>
                      <TypeChip icon={UsersIcon} label="Group winner" tone="amber" />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-dashed border-[oklch(0.7_0.22_25_/_0.35)] bg-surface p-4 opacity-70">
                    <div className="mb-2 font-mono text-[9px] uppercase tracking-widest text-[oklch(0.82_0.16_25)]">
                      ✗ chip centered above title
                    </div>
                    <div className="grid place-items-center">
                      <TypeChip icon={Flame} label="Featured props" tone="violet" />
                      <h3 className="mt-1 font-display text-base font-semibold text-foreground">Group A Winner</h3>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-dashed border-[oklch(0.7_0.22_25_/_0.35)] bg-surface p-4 opacity-70">
                    <div className="mb-2 font-mono text-[9px] uppercase tracking-widest text-[oklch(0.82_0.16_25)]">
                      ✗ left glyph block competing with chip
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.05] font-display text-lg font-bold text-foreground ring-1 ring-white/10">I</span>
                        <h3 className="font-display text-sm font-semibold text-foreground">Group I — Winner</h3>
                      </div>
                      <TypeChip icon={UsersIcon} label="Group winner" tone="amber" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  WorldCupBackdrop — fixed page atmosphere (framed preview)
                </div>
                <div className="relative h-40 overflow-hidden rounded-2xl border border-border bg-background">
                  <div className="absolute inset-0">
                    <WorldCupBackdrop />
                  </div>
                  <div className="relative z-10 grid h-full place-items-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    Page content sits above this layer
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  HubTabs — tournament (Games / Props / Bracket) vs season league (Games / Props)
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Tournament
                    </div>
                    <HubTabs
                      slug="world-cup-2026"
                      current="games"
                      tabs={[
                        { view: "games", label: "Games", count: 64 },
                        { view: "props", label: "Props" },
                        { view: "bracket", label: "Bracket" },
                      ]}
                    />
                  </div>
                  <div className="rounded-2xl border border-border bg-surface p-4">
                    <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Season league (no Bracket)
                    </div>
                    <HubTabs
                      slug="epl"
                      current="props"
                      tabs={[
                        { view: "games", label: "Games", count: 5 },
                        { view: "props", label: "Props" },
                      ]}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Mobile behavior — every Carnival component rendered inside a 390w frame
                </div>
                <div className="space-y-6">
                  <MobileFrame label="ScoreboardHero · 390w">
                    <ScoreboardHero />
                  </MobileFrame>
                  <MobileFrame label="CarnivalTabs · horizontal snap row (swipe →)">
                    <CarnivalTabs current="overview" />
                  </MobileFrame>
                  <MobileFrame label="LuckyBoxSection · State B 1,240 U (default)">
                    <LuckyBoxSection volumeOverride={1240} />
                  </MobileFrame>
                  <MobileFrame label="NewbieRewardsSection · invite CTA full-width">
                    <NewbieRewardsSection />
                  </MobileFrame>
                  <MobileFrame label="ComboChallengeSection · stacked filters + sticky bar">
                    <ComboChallengeSection />
                  </MobileFrame>
                </div>

                <ul className="mt-4 space-y-1.5 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-xs text-muted-foreground">
                  <li className="text-foreground">Mobile rules (mirror of `/promo/world-cup` mobile pass)</li>
                  <li>• <b>ScoreboardHero</b>: big number drops to <code className="font-mono text-foreground">text-[2.5rem]</code>, countdown collapses to <code className="font-mono text-foreground">HH:MM:SS</code>, header strip wraps. Trophy pill wraps instead of clipping.</li>
                  <li>• <b>CarnivalTabs</b>: mobile becomes a horizontal snap row (each cell <code className="font-mono text-foreground">min-w-[44%]</code>); from <code className="font-mono text-foreground">md:</code> up reverts to the 5-col grid. Active-cell underline + selected color identical to desktop.</li>
                  <li>• <b>LuckyBox VolumeLadder</b>: track inset <code className="font-mono text-foreground">px-5</code>, node labels alternate above/below to avoid 100U vs 1,000U collision, last node anchors label flush-right, token hex anchors to right when <code className="font-mono text-foreground">tokenPct &gt; 92</code>. Caption breaks into 3 lines on mobile.</li>
                  <li>• <b>LuckyBox TierCard</b>: header row wraps; pool label stays <code className="font-mono text-foreground">whitespace-nowrap</code>, title truncates. Reel, spin button, prize list, share — identical to desktop.</li>
                  <li>• <b>ComboChallengeSection.FilterBar</b>: mobile stacks (stage chips · matchday chips horizontal-scroll · toggle + search 50/50). Search input goes full-width.</li>
                  <li>• <b>CampaignHero</b>: "ENTRIES LEFT" block flips to <code className="font-mono text-foreground">text-left</code> on mobile.</li>
                  <li>• <b>MatchCard</b>: matchup title truncates on mobile; locked pill never shrinks. LineStepper button text drops to <code className="font-mono text-foreground">text-[10px]</code>.</li>
                  <li>• <b>MobileStickyBar</b>: on routes with the tab bar use <code className="font-mono text-foreground">bottom-16</code> + spacer <code className="font-mono text-foreground">h-28</code>. On <code className="font-mono text-foreground">hideBottomNav</code> pages (e.g. <code className="font-mono text-foreground">/promo/world-cup</code>) it sits flush at <code className="font-mono text-foreground">bottom-0</code> with spacer <code className="font-mono text-foreground">h-20</code>. Single-row layout, CTA <code className="font-mono text-foreground">shrink-0 whitespace-nowrap</code>.</li>
                  <li>• <b>Confirm / Requote / Ticket-accepted surfaces</b>: bottom <code className="font-mono text-foreground">Sheet</code> on mobile, centered <code className="font-mono text-foreground">Dialog</code> on md+ via the <code className="font-mono text-foreground">ResponsiveModal</code> helper. Global rule — mobile has NO center modals; mirror the <code className="font-mono text-foreground">ShareDialog</code> pattern when adding new dialogs.</li>
                  <li>• <b>InvitePanel</b>: Copy button is <code className="font-mono text-foreground">w-full sm:w-auto</code>.</li>
                  <li className="text-foreground">Interactions identical to desktop (do not diverge): spin, share triggers, modal flows (Confirm / Requote / TicketAccepted), prize draw RNG, countdown ticking.</li>
                  <li className="text-foreground">Rule: every Carnival component MUST have desktop AND mobile (390w) coverage in this style guide. If a mobile rule isn't shown here, it doesn't exist.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-xs">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Rules
                </div>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li>• `/events` answers "when can I trade?" — time-based, cross-league lobby. `/league/$slug` answers "what's the whole picture of this tournament?" — single-league depth.</li>
                  <li>• Sub-tab state lives in `?view=` so URLs are shareable. Default is `games`. Unknown values fall back to `games` via `validateSearch`.</li>
                  <li>• `Bracket` tab only renders for `league.kind === "tournament"`. Season leagues get Games + Props only.</li>
                  <li>• Props + Bracket are intentional `ComingSoon` placeholders in P0 — Props ships P1 (futures, group winners, player props, binary gauges), Bracket ships P2.</li>
                  <li>• Season Futures + Player Spotlight no longer live on `/events` or the desktop home Season block — they are migrating into each hub's Props tab in P1.</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section id="hub-props" title="Hub · Props" kicker="20 — P1 / ?view=props">
            <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
              The <b className="text-foreground">Props</b> tab orchestrates every non-1X2 market for a league: group winners (tournament only),
              season futures (winner + top scorer), player spotlights, and standalone YES/NO binary questions.
              All bundled by <code className="font-mono text-foreground">PropsGrid</code>.
            </p>

            <div className="space-y-8">
              <div>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  GroupWinnerCard — single tournament group, ranked by implied prob
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {WC26_GROUPS.map((g) => (
                    <GroupWinnerCard key={g.id} market={g} />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  BinaryQuestionCard — YES/NO gauge + dual buy buttons
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {getBinaryQuestionsByLeagueSlug("epl")
                    .slice(0, 3)
                    .map((m) => (
                      <BinaryQuestionCard key={m.id} market={m} />
                    ))}
                </div>
              </div>

              <div>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  SpotlightPropsCardHorizontal — featured player/team prop bundle (horizontal)
                </div>
                <div className="grid gap-3 md:grid-cols-1 xl:grid-cols-2">
                  {getSpotlightsByLeagueSlug("world-cup-2026").slice(0, 2).map((s) => (
                    <SpotlightPropsCardHorizontal key={s.handle} player={s} />
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  PropsGrid — full Props tab composition (World Cup 2026)
                </div>
                <PropsGrid
                  league={LEAGUES[0]}
                  groups={getGroupsByLeagueSlug("world-cup-2026")}
                  winner={getSeasonGroupByLeagueSlug("world-cup-2026")?.winner}
                  topScorer={getSeasonGroupByLeagueSlug("world-cup-2026")?.topScorer}
                  spotlights={getSpotlightsByLeagueSlug("world-cup-2026")}
                  binaryQuestions={getBinaryQuestionsByLeagueSlug("world-cup-2026")}
                />
              </div>

              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-xs">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Rules
                </div>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li>• Group winners only render for <code className="font-mono text-foreground">kind === "tournament"</code> leagues that have group-stage data.</li>
                  <li>• Season futures pull from <code className="font-mono text-foreground">SEASON_LEAGUE_GROUPS</code> via slug match — keeps the legacy winner / top-scorer cards reusable.</li>
                  <li>• Binary questions are auto-collected: any <code className="font-mono text-foreground">shape: "binary"</code> non-match market or spotlight prop tagged for this league shows up.</li>
                  <li>• PropsGrid hides each section when its source array is empty — no placeholder noise.</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section id="hub-bracket" title="Hub · Bracket" kicker="21 — P2 / ?view=bracket">
            <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
              Knockout tree for tournament-kind leagues. Columns are rounds; each matchup is a vertical "versus" card
              — flags on top, full team names + advance-probability stacked below. Desktop fills the container width;
              mobile falls back to a horizontally-scrolling linear list (bracket integrity beats wrapping).
            </p>

            <div className="space-y-6">
              <div>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  BracketView — QF → SF → F (World Cup 2026 mock)
                </div>
                <BracketView rounds={WC26_BRACKET} />
              </div>

              <div>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Partial TBD — mid-tournament, later rounds unseeded
                </div>
                <BracketView rounds={WC26_BRACKET_PARTIAL} />
              </div>

              <div>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Empty state — season leagues / pre-seed
                </div>
                <BracketView rounds={[]} />
              </div>

              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-xs">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Rules
                </div>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li>• Only rendered when <code className="font-mono text-foreground">league.kind === "tournament"</code>.</li>
                  <li>• Matchups deep-link to <code className="font-mono text-foreground">/event/$id</code> using the matchup id as the market id. The bracket card shows only the two teams, but the detail page is a full <strong className="text-foreground">1X2</strong> market (home / draw / away) — never add a Draw row inside the bracket card itself.</li>
                  <li>• TBD slots render as a dashed circle — bracket is always a complete tree, never collapsed rows.</li>
                  <li>• Each column past the first gets progressively larger vertical gaps to visually converge toward the final.</li>
                  <li>• Card layout is <strong className="text-foreground">vertical</strong>: row 1 = two flags + serif "vs"; row 2 = two full team names (no country codes — names alone are enough); row 3 = the two advance prices, or a green ✓ won badge for the winner once decided.</li>
                  <li>• Columns use <code className="font-mono text-foreground">flex-1 min-w-0</code> so the bracket stretches to fill its container at desktop widths (≥ 880px). Final column uses <code className="font-mono text-foreground">flex-[1.3]</code> + purple glow + 🏆 title for emphasis.</li>
                  <li>• Loser side: flag dimmed + grayscaled, name muted. Winner side: green name + ✓ replacing price. No country-code abbreviations anywhere.</li>
                  <li>• <strong className="text-foreground">TBD appearance</strong>: when a matchup side is still unknown, its flag slot shows a <code className="font-mono text-foreground">border-dashed</code> empty circle; the name slot shows "TBD" in muted text; no price is rendered. The card is still fully clickable (leads to the same /event/$id page, which renders a not-found state until the fixture is set). Bracket maintains a complete symmetric tree even when half the matchups are TBD.</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section id="world-cup-carnival" title="World Cup Carnival" kicker="Promo · /promo/world-cup">
            <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
              Stadium LED scoreboard visual language for the World Cup
              Carnival hub. Black slab + dot-matrix backdrop +
              <code className="font-mono text-foreground"> Orbitron</code> numerals +
              <code className="font-mono text-foreground"> Chakra Petch</code> body. Accent green
              <code className="font-mono text-foreground"> oklch(0.7 0.18 145)</code> drives the
              primary glow; amber (Combo) and blue (Lucky Box) are the per-series accents. Only used inside the
              promo hub and the WC2026 league hero promo slot — does not leak into general dashboard surfaces.
            </p>

            <div className="space-y-6">
              <div>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  ScoreboardHero — full
                </div>
                <ScoreboardHero />
              </div>

              <div>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  CarnivalFlagsMarquee — host nation flag track
                </div>
                <div className="overflow-hidden rounded border border-zinc-900 bg-black/60 p-1">
                  <CarnivalFlagsMarquee />
                </div>
              </div>

              <div>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  ConfettiLayer + TwinkleField — decorative overlays (pointer-events-none)
                </div>
                <div className="relative h-40 overflow-hidden rounded border border-zinc-900 bg-black">
                  <TwinkleField />
                  <ConfettiLayer count={18} />
                </div>
              </div>

              <div>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  ScoreboardHero — compact (used above non-overview tabs)
                </div>
                <ScoreboardHero compact />
              </div>

              <div>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  CarnivalTabs — 5 LED cells, accent underline on active
                </div>
                <CarnivalTabs current="overview" />
              </div>

              <div>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  CarnivalPromoCard — slotted into LeagueHubHero on world-cup-2026
                </div>
                <div className="max-w-sm">
                  <CarnivalPromoCard />
                </div>
              </div>

              <div>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  ScoreboardTicker — bottom-of-page LED marquee
                </div>
                <ScoreboardTicker />
              </div>

              <div>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  OverviewSection — full composition (hero + 3 series cards + fan status + ticker)
                </div>
                <OverviewSection />
              </div>

              <div className="space-y-3">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Newbie TaskCard — 4-state playground (locked · in-progress · claimable · claimed)
                </div>
                <div className="rounded-md border border-amber-400/30 bg-amber-400/5 p-3 text-[11px] text-amber-200/90">
                  CRITICAL — rewards are NEVER auto-credited. Even when the threshold is met the
                  task moves to <code className="font-mono text-foreground">claimable</code> and the
                  user MUST click <b>Claim</b> to receive the voucher. Implementing "complete →
                  auto-grant" is a bug.
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {(
                    [
                      {
                        id: "first-deposit",
                        code: "T-02",
                        title: "First deposit ≥ 20 U",
                        description: "Locked — waiting on T-01 registration to clear KYC first.",
                        rewardLabel: "20 U Position Voucher",
                        progress: 0,
                        status: "locked",
                        cta: "Locked",
                        newOnly: true,
                      },
                      {
                        id: "first-deposit",
                        code: "T-02",
                        title: "First deposit ≥ 20 U",
                        description: "In progress — Deposit now opens the OmenX Wallet in a new tab.",
                        rewardLabel: "20 U Position Voucher",
                        progress: 0.4,
                        status: "in-progress",
                        cta: "Deposit now",
                        ctaHref: "https://omenx.lovable.app/wallet",
                        ctaExternal: true,
                        newOnly: true,
                      },
                      {
                        id: "first-deposit",
                        code: "T-02",
                        title: "First deposit ≥ 20 U",
                        description: "Threshold reached — user must click Claim. Voucher does NOT auto-drop.",
                        rewardLabel: "20 U Position Voucher",
                        progress: 1,
                        status: "claimable",
                        cta: "Claim",
                        newOnly: true,
                      },
                      {
                        id: "first-deposit",
                        code: "T-02",
                        title: "First deposit ≥ 20 U",
                        description: "Claimed — voucher dispatched to Wallet, button disabled.",
                        rewardLabel: "20 U Position Voucher",
                        progress: 1,
                        status: "claimed",
                        cta: "Claimed",
                        newOnly: true,
                      },
                    ] satisfies NewbieTask[]
                  ).map((t, i) => (
                    <TaskCard key={`${t.status}-${i}`} task={t} />
                  ))}
                </div>
                <div className="rounded-md border border-white/10 bg-white/[0.02] p-3 text-[11px] text-muted-foreground">
                  CTA jump map: <b>T-02 Deposit now</b> →{" "}
                  <code className="font-mono text-foreground">https://omenx.lovable.app/wallet</code>{" "}
                  (external, new tab). <b>T-03 Open events</b> →{" "}
                  <code className="font-mono text-foreground">/league/world-cup-2026?view=games</code>{" "}
                  (internal sports sub-domain). External links always carry the{" "}
                  <code className="font-mono text-foreground">ArrowUpRight</code> icon so users
                  know the tab will leave the carnival.
                </div>
              </div>

              <div>
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  ComboChallengeSection — 3-leg activity page: hero · filters · match selector · sticky builder · quote preview · submit/requote/success modals · ticket list · share card preview
                </div>
                <ComboChallengeSection />
              </div>

              <div className="space-y-6">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  LuckyBoxSection — daily vault: volume ladder links your today's U to the one tier that applies; surpassed/locked tiers dim out, only the active card spins
                </div>
                <div className="space-y-3">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-blue-400/70">
                    State A · todayVolume = 80 U — no tier reached yet (NEXT UP on Basic)
                  </div>
                  <LuckyBoxSection volumeOverride={80} />
                </div>
                <div className="space-y-3">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-amber-400/80">
                    State B · todayVolume = 1,240 U — Premium active, Basic surpassed, Grand locked (production default)
                  </div>
                  <LuckyBoxSection volumeOverride={1240} />
                </div>
                <div className="space-y-3">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-emerald-400/80">
                    State C · todayVolume = 6,000 U — Grand active, two lower tiers surpassed
                  </div>
                  <LuckyBoxSection volumeOverride={6000} />
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-xs">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Rules
                </div>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li>• LED visual language is scoped to <code className="font-mono text-foreground">/promo/world-cup</code> and the WC2026 league hero promo slot — never spill into events, fans zone, or other leagues.</li>
                  <li>• Numerics use <code className="font-mono text-foreground">font-scoreboard</code> (Orbitron, tabular-nums); body uses <code className="font-mono text-foreground">font-pitch</code> (Chakra Petch).</li>
                  <li>• Series accent green = SEC-01 (Welcome Pack), amber = SEC-02 (Combo Challenge), blue = SEC-03 (Lucky Box). Pin one accent per series, never mix.</li>
                  <li>• Every interactive card has a bottom 1px LED bar that lights with the card's accent on hover/active.</li>
                  <li>• Countdown ticks against <code className="font-mono text-foreground">CARNIVAL_ENDS_AT</code> (2026-07-19). Live red dot uses <code className="font-mono text-foreground">animate-ping</code>, never a solid red.</li>
                  <li>• <b>Odds cap disclosure</b>: when a 3-leg combo's fair odds exceed <code className="font-mono text-foreground">COMBO_MAX_ODDS</code> (50×), <code className="font-mono text-foreground">QuotePreviewPanel</code> shows the raw odds/payout struck through under the capped values, an amber explanation strip ("Activity caps payout at 50× / 500U… See rules"), and the PLACE button gets a small "Activity cap applied · fair odds 177.71×" caption above it. Empty preview state preemptively states the cap. Never silently clip — users must see why their 3-leg ≠ what they multiplied in their head.</li>
                  <li>• <b>Post-submit ticket reveal</b>: after a combo is accepted, <code className="font-mono text-foreground">TicketAcceptedModal</code> footer is fixed at 2 rows — row 1 is the amber Share my combo primary CTA (<code className="font-mono text-foreground">ShareTrigger variant="wide" accent="amber" size="sm"</code> → amber border + amber/10 fill + amber label + amber arrow chip), row 2 is a <code className="font-mono text-foreground">grid-cols-2</code> of two zinc-outline secondary buttons (<b>View ticket</b> + <b>Build another</b>) that share an identical token: <code className="font-mono text-foreground">border border-zinc-700 bg-zinc-900/60 rounded-2xl py-3</code>, icon-left, same font/tracking. All three buttons share the same height (<code className="font-mono text-foreground">py-3</code>) — main CTA is signaled only by amber color, not by extra height. Closing the modal by any path (View, Build another, click-outside, Esc) auto-smooth-scrolls to <code className="font-mono text-foreground">#combo-my-tickets</code> and applies a 2.5s amber ring + glow + pulse to the newest <code className="font-mono text-foreground">TicketRow</code>. Respects <code className="font-mono text-foreground">prefers-reduced-motion</code>. <code className="font-mono text-foreground">capReached</code> disables Build another in place and shows a small caption below — never collapses the 2-row structure. Modal-footer rule for the whole app: max 1 amber primary CTA + 1 row of zinc-outline secondaries; same height across the row; never stack 3 full-width buttons; never mix amber/zinc outlines on secondaries.</li>
                  <li>• <b>Wallet trail on tickets</b>: every settled or open ticket explicitly surfaces where the money goes. <code className="font-mono text-foreground">WalletLine</code> sits at the bottom of each <code className="font-mono text-foreground">TicketRow</code> and links to <code className="font-mono text-foreground">omenxUrl.wallet()</code> in a new tab. Three tones by status: <span className="text-emerald-300">SETTLED_WON</span> = "+N U credited to your Wallet" (emerald, strong), <span className="text-zinc-300">SETTLED_LOST</span> = "−N U from stake · View in Wallet" (zinc, medium), <span className="text-zinc-400">ACCEPTED</span> = "−N U held · settles on result · Wallet" (zinc, faint). <code className="font-mono text-foreground">TicketAcceptedModal</code> also shows an amber "Payouts settle automatically to your Wallet" hint right below the locked-odds row. No duplicate section-header link — per-ticket entry points are enough, and Wallet on OmenX is view-only (not actually "manageable"), so the redundant "Manage in Wallet" CTA was removed.</li>
                  <li>• <b>Welcome / quest tasks never auto-credit</b>. <code className="font-mono text-foreground">NewbieTask.status</code> is a 4-state machine: <code className="font-mono text-foreground">locked → in-progress → claimable → claimed</code>. Reaching the threshold moves a task to <code className="font-mono text-foreground">claimable</code> and shows a pulsing green <b>Ready to claim</b> pill + filled <b>Claim</b> button — the user MUST click to receive the voucher. Action CTAs on <code className="font-mono text-foreground">in-progress</code> use real links: T-02 <b>Deposit now</b> → <code className="font-mono text-foreground">omenxUrl.wallet()</code> (external, new tab, ArrowUpRight icon), T-03 <b>Open events</b> → <code className="font-mono text-foreground">/league/world-cup-2026?view=games</code> (internal). Implementing "complete → auto-grant" is a bug — see the 4-state playground above.</li>
                  <li>• <b>Guess the Legend — country-by-country, never 8-in-1</b>. Each round shows ONE country flag + 4 retired-legend candidates (real names from that country's retired pool; distractors are frontend fiction, not actual signees). 3 progressive clues unlock via community vote thresholds — never via wall-clock countdown. Reveal cadence is INTENTIONALLY random because each player signs on his own availability — UI must show <code className="font-mono text-foreground">next reveal · TBA</code>, never a numeric timer. Correct guess on reveal day grants <b>1× Tier-01 Basic Vault spin</b> — never the signed jersey itself. Pre-warm strip surfaces already-signed memorabilia (Vieira in main pool, Y.Touré as bonus outside the 8) — bonus pre-warm legends never enter the round queue.</li>
                </ul>
              </div>

              <div className="mt-10 space-y-10">
                <div className="space-y-3">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Assets & Tokens inventory (atoms used by HUD · bay · archive)
                  </div>
                  <LegendAssetsInventory />
                </div>

                <div className="space-y-3">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Guess the Legend — scoreboard chassis (HUD · bay · board · archive)
                  </div>
                  <LegendScoreboardDemo />
                </div>

                <div className="space-y-3">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    ActiveRoundBay 3-state playground (voting · revealed-hit · revealed-miss)
                  </div>
                  <LegendBayPlayground />
                </div>
              </div>
            </div>
          </Section>

          <Section id="trade-drawer" title="Sticky Trade Drawer" kicker="22 — P3 / global">
            <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
              A global right-edge sliding sheet that opens via the <code className="font-mono text-foreground">useTradeDrawer()</code> hook
              from anywhere in the app. Picks an outcome and renders the full <code className="font-mono text-foreground">TradeForm</code>
              without navigating away from the current page — so users can keep browsing markets while a trade ticket stays in context.
              Wired into <code className="font-mono text-foreground">__root.tsx</code>, so it persists across route changes.
            </p>

            <div className="space-y-6">
              <TradeDrawerDemo />

              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-xs">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Rules
                </div>
                <ul className="space-y-1.5 text-muted-foreground">
                  <li>• Open via <code className="font-mono text-foreground">openTrade({"{ marketId, outcomeId? }"})</code> from the hook.</li>
                  <li>• <code className="font-mono text-foreground">BinaryQuestionCard</code>'s YES / NO buy buttons trigger the drawer with the matching outcome pre-selected.</li>
                  <li>• <code className="font-mono text-foreground">EventMarketTileCard</code> uses a two-step interaction: the card itself links to <code className="font-mono text-foreground">/event/$id</code>, while each outcome block / row opens the drawer with that outcome pre-selected (inner buttons <code className="font-mono text-foreground">preventDefault</code> the parent link).</li>
                  <li>• <code className="font-mono text-foreground">LiveStreamCard</code>'s segmented odds bar follows the same pattern — poster/score area goes to the event page, each segment fires <code className="font-mono text-foreground">openTrade</code>.</li>
                  <li>• Marker for "drawer is sticky": closing it preserves nothing — every open call replaces the selection, but the drawer DOM survives navigation so animations don't flash.</li>
                  <li>• Outcomes are rendered as a 2- or 3-column chooser depending on the market shape; deep-link to <code className="font-mono text-foreground">/event/$id</code> is always available in the header for the full market page.</li>
                  <li>• Always reuses the shared <code className="font-mono text-foreground">TradeForm</code> — leverage, PRO toggle, TP/SL all work identically to <code className="font-mono text-foreground">/event/$id</code>.</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section id="trade-outcome-picker" title="Trade Outcome Picker" kicker="22b — shared by drawer + event page">
            <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
              Shared "Pick outcome (+ Pick side)" selector used by both the global
              <code className="font-mono text-foreground"> TradeDrawer</code> and the in-page trade column on
              <code className="font-mono text-foreground"> /event/$id</code>. Pills are intentionally compact so they don't
              outweigh the actual order form below. 2–3 outcomes flex-fill the row; 4+ overflow into a single horizontal
              scroller (never wraps to a second line).
            </p>

            <TradeOutcomePickerDemo />

            <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-xs">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Rules
              </div>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>• Always single-row. ≤3 outcomes: each pill <code className="font-mono text-foreground">flex-1</code> fills the row. ≥4 outcomes: horizontal scroll with right-edge fade mask.</li>
                <li>• Pills are compact (<code className="font-mono text-foreground">py-1.5</code>, <code className="font-mono text-foreground">text-sm</code> price) so the trade form below stays the visual focus — not the picker.</li>
                <li>• When market has ≥3 outcomes, a YES/NO side toggle appears below — each outcome is its own binary sub-market.</li>
                <li>• Fully controlled — caller owns <code className="font-mono text-foreground">outcomeId</code> + <code className="font-mono text-foreground">side</code> state. Selected outcome auto-scrolls into view.</li>
              </ul>
            </div>
          </Section>

          <Section id="event-outcomes-panel" title="Event outcomes panel" kicker="22c — P0 / event detail">
            <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
              The Polymarket-style heart of <code className="font-mono text-foreground">/event/$id</code>. A single combined multi-line
              <code className="font-mono text-foreground"> CombinedPriceChart</code> at the top overlays every outcome on one canvas, and the
              outcomes list below adapts to the event's shape: <strong className="text-foreground">binary events</strong> (2 outcomes) render
              the two sides flat with a single <em>Trade</em> button per row and one shared order book underneath — never nested YES/NO
              sub-buttons; <strong className="text-foreground">multi-outcome events</strong> (3+) render each outcome as its own sub-market
              with Buy YES / Buy NO buttons and a per-outcome order-book accordion.
            </p>

            <EventOutcomesPanelDemo />

            <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-xs">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Rules
              </div>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>• Used for <em>all</em> events. The panel branches on <code className="font-mono text-foreground">outcomes.length === 2</code> to pick the binary vs multi-outcome layout.</li>
                <li>• <strong className="text-foreground">Binary</strong>: each outcome IS one of the two tradable sides. No per-row YES/NO. The shared OrderBook uses the two outcome labels as headers (e.g. <code className="font-mono text-foreground">Yes Book / No Book</code>, <code className="font-mono text-foreground">Liverpool Book / Newcastle Book</code>).</li>
                <li>• <strong className="text-foreground">Multi-outcome</strong>: each outcome is its own independent binary sub-market — per-outcome YES/NO buttons + accordion order book labeled <code className="font-mono text-foreground">{`${"{outcome}"} YES / ${"{outcome}"} NO`}</code>.</li>
                <li>• Combined chart highlights the currently selected outcome (thicker + opaque); other lines dim to 0.45 opacity.</li>
                <li>• Buy buttons set <code className="font-mono text-foreground">selectedIdx + tradeSide</code> upstream; the page pulses the TradeForm container for 700ms (and scroll-into-view on viewports &lt;1024px). On binary, <code className="font-mono text-foreground">tradeSide</code> is derived from <code className="font-mono text-foreground">selectedIdx</code>, not a separate toggle.</li>
                <li>• Legend dots in the chart are also clickable — they call <code className="font-mono text-foreground">onLegendSelect</code> so users can change selection from the chart itself.</li>
              </ul>
            </div>
          </Section>

          <Section id="event-live-stage" title="Event live stage" kicker="23 — P0 / event detail">
            <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
              16:9 broadcast surface used at the top of <code className="font-mono text-foreground">/event/$id</code> when the underlying
              market is being streamed (<code className="font-mono text-foreground">market.isLiveStream</code>). Combines the live poster,
              LIVE pill, broadcast scoreboard, match clock and player controls with an inline market ticker so the user keeps the selected
              outcome price in view while watching. Lives inside <code className="font-mono text-foreground">StageTabs</code> below so the
              page shares one vertical slot between Stream · Chart · Order book.
            </p>

            <EventLiveStageDemo />

            <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-xs">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Rules
              </div>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>• Only rendered when the market has <code className="font-mono text-foreground">isLiveStream</code> + <code className="font-mono text-foreground">liveScore</code>; otherwise the StageTabs default to <code className="font-mono text-foreground">chart</code>.</li>
                <li>• Stream tab is always the default when present — users land on the broadcast, not the chart.</li>
                <li>• Stage exposes a <code className="font-mono text-foreground">stageRef</code>; once it scrolls out of view the page calls <code className="font-mono text-foreground">useLiveStream().setMinimized(true)</code> and the global <code className="font-mono text-foreground">GlobalStreamMiniPlayer</code> takes over — including across route navigation.</li>
                <li>• Stage's Fullscreen control calls <code className="font-mono text-foreground">openFullscreen()</code> on the provider; same overlay can be triggered from the mini player.</li>
                <li>• Selected outcome label + cents + Δ24h appear in the ticker bar so the user always sees the price for the side they're about to trade.</li>
              </ul>
            </div>
          </Section>

          <Section id="global-live-stream" title="Global live stream session" kicker="23b — P0 / cross-route">
            <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
              <code className="font-mono text-foreground">LiveStreamProvider</code> holds one global live-watching session
              and renders the bottom-right <code className="font-mono text-foreground">GlobalStreamMiniPlayer</code> + the
              full-viewport <code className="font-mono text-foreground">FullscreenStreamOverlay</code>. The mini player
              persists across route navigation so users can keep an eye on the match while browsing other pages, and the
              action bar surfaces both outcomes plus a neutral <strong>Trade</strong> CTA (not a one-sided Buy).
            </p>

            <GlobalLiveStreamDemo />

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                AudioTrackToggle — EN / CN
              </div>
              <p className="mb-4 max-w-2xl text-xs text-muted-foreground">
                Shared segmented pill embedded in all three playable surfaces:
                <code className="mx-1 font-mono text-foreground">GlobalStreamMiniPlayer</code>(sm),
                <code className="mx-1 font-mono text-foreground">EventLiveStage</code>(md),
                <code className="mx-1 font-mono text-foreground">FullscreenStreamOverlay</code>(lg).
                Selection is global (persisted to localStorage) so the language follows the user across surfaces.
              </p>
              <div className="flex flex-wrap items-center gap-6 rounded-xl bg-black/40 p-4">
                <div className="flex flex-col items-start gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">sm — mini player</span>
                  <AudioTrackToggle size="sm" />
                </div>
                <div className="flex flex-col items-start gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">md — event stage</span>
                  <AudioTrackToggle size="md" />
                </div>
                <div className="flex flex-col items-start gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">lg — fullscreen</span>
                  <AudioTrackToggle size="lg" />
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-xs">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Rules
              </div>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>• Auto-starts when the user lands on a live <code className="font-mono text-foreground">/event/$id</code>. Stays alive when they navigate away; only an explicit ✕ stops it (per session).</li>
                <li>• On the event page, the mini player is suppressed while the in-page Stage is in view; navigating to any other route force-minimizes immediately.</li>
                <li>• Three exits: ⛶ fullscreen, ↗ back to the event detail page, <strong>Trade</strong> opens the global <code className="font-mono text-foreground">TradeDrawer</code> pre-selected on the chip the user picked.</li>
                <li>• Outcome chips are mirrored into provider state so selecting a side here syncs with the event page's selection and vice versa.</li>
                <li>• Hidden on <code className="font-mono text-foreground">&lt;sm</code> to avoid colliding with <code className="font-mono text-foreground">MobileTradeBar</code>; mobile users hit Fullscreen from the in-page Stage instead.</li>
              </ul>
            </div>
          </Section>

          <Section id="live-delay-info" title="Live delay disclosure" kicker="23c — P0 / live data">
            <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
              Shared <code className="font-mono text-foreground">LiveDelayInfo</code> ⓘ affordance, plus the persistent
              "Stream delayed · reference only" caption on video surfaces and the amber notice that appears inside the
              <code className="mx-1 font-mono text-foreground">TradeDrawer</code> when the underlying market
              <code className="mx-1 font-mono text-foreground">isLiveStream</code>. Inspired by Polymarket's
              <code className="mx-1 font-mono text-foreground">• HT ⓘ</code> pattern — long disclaimer copy lives behind
              the icon, never in the chip itself.
            </p>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Score chip — over media
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 font-mono text-[11px] tabular-nums text-white ring-1 ring-white/20 backdrop-blur">
                  62′
                  <LiveDelayInfo variant="score" tone="onMedia" />
                </span>
                <div className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Persistent stream caption
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded bg-black/55 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-white/55 ring-1 ring-white/10 backdrop-blur">
                  Stream delayed · reference only
                  <LiveDelayInfo variant="stream" tone="onMedia" />
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-5">
                <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Trade drawer — live market notice
                </div>
                <div className="flex items-start gap-2 rounded-lg border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-3 py-2 text-[11px] leading-relaxed text-[#fbbf24]">
                  <span className="mt-[1px] inline-grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full">ⓘ</span>
                  <span>
                    Live scores and stream may lag the venue by{" "}
                    <span className="font-semibold">30–60 seconds</span>. Trade
                    accordingly — settlement uses the official result.
                  </span>
                </div>
                <div className="mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Muted chip (in-content)
                </div>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] tabular-nums text-foreground ring-1 ring-white/10">
                  Live · 62′
                  <LiveDelayInfo variant="score" tone="muted" />
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-xs">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Rules
              </div>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>• Every visible <code className="font-mono text-foreground">liveClock</code> chip carries a <code className="font-mono text-foreground">LiveDelayInfo variant="score"</code> — no exceptions (EventLiveStage, FullscreenStreamOverlay, GlobalStreamMiniPlayer, LiveStreamCard).</li>
                <li>• Video surfaces (Stage + Fullscreen) carry the persistent caption <code className="font-mono text-foreground">"Stream delayed · reference only"</code> with the icon at the end. Mini player is too small — chip ⓘ only.</li>
                <li>• <code className="font-mono text-foreground">TradeDrawer</code> shows the amber notice whenever <code className="font-mono text-foreground">market.isLiveStream</code>. Not dismissible — this is the strongest touchpoint before money moves.</li>
                <li>• Never replace the icon with full-sentence copy in the chip. Copy lives inside the popover. We do not toast.</li>
              </ul>
            </div>
          </Section>

          <Section id="event-trade-bar" title="Mobile sticky trade bar" kicker="24 — P0 / event detail mobile">
            <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
              Fixed bottom action bar shown on <code className="font-mono text-foreground">&lt;lg</code> screens of the event detail page.
              Desktop already has the sticky right-column <code className="font-mono text-foreground">TradeForm</code>; on mobile the form
              falls below the fold, so this bar gives a one-thumb path to either pop the global <code className="font-mono text-foreground">TradeDrawer</code>
              (Quick buy) or scroll to the full form (tap the price block).
            </p>

            <div className="relative h-32 overflow-hidden rounded-2xl border border-border bg-background/40 p-0">
              <div className="pointer-events-none absolute inset-x-0 top-0 px-4 py-4 text-xs text-muted-foreground">
                Mocked content above the bar…
              </div>
              <div className="absolute inset-x-0 bottom-0">
                <MobileTradeBarDemo />
              </div>
            </div>
          </Section>

          <Section id="event-extras" title="Event detail extras" kicker="25 — P1 / event detail">
            <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
              The remaining P1 modules on <code className="font-mono text-foreground">/event/$id</code>: chip row that
              pivots between markets on the same fixture, a compact YES/NO depth bar that replaces the full order book when
              vertical space matters, a live tape of recent fills for social proof, a pre-match countdown strip with
              projected lineups + weather, and a share button that deep-links the currently selected outcome.
            </p>

            <EventExtrasDemo />

            <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-xs">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Rules
              </div>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>• <code className="font-mono text-foreground">RelatedMarketsBar</code> chips are other real events tied to the current one by shared team / fixture; each chip routes to that event's detail page. The whole module hides when nothing relates.</li>
                <li>• <code className="font-mono text-foreground">DepthBar</code> lives at the top of the Chart tab so liquidity stays visible even when the user isn't on Order book.</li>
                <li>• <code className="font-mono text-foreground">LiveTape</code> injects a fresh mocked fill every ~4s; pause / virtualise if we ever wire it to a real WS feed.</li>
                <li>• <code className="font-mono text-foreground">PreMatchStrip</code> only renders when the market has a fixture and is not currently streaming.</li>
                <li>• <code className="font-mono text-foreground">ShareButton</code> copies the current URL with <code className="font-mono text-foreground">?outcome=…</code> appended — the page reads it on mount and pre-selects.</li>
              </ul>
            </div>
          </Section>

          <Section id="share" title="Share dialog" kicker="25b — global share system">
            <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
              One global share surface for every shareable object on the site (events, leagues, players, combo tickets,
              lucky-box prizes, promos). Desktop renders a centred <code className="font-mono text-foreground">Dialog</code>,
              mobile slides up a <code className="font-mono text-foreground">Sheet</code>. Triggers come in four variants
              — drop them anywhere and they all open the same dialog through the <code className="font-mono text-foreground">useShare()</code> provider.
            </p>
            <ShareDemo />
            <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-xs">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Rules</div>
              <ul className="space-y-1.5 text-muted-foreground">
                <li>• Wrap the app in <code className="font-mono text-foreground">&lt;ShareProvider&gt;</code> once (root layout). All triggers go through it.</li>
                <li>• Imperative API: <code className="font-mono text-foreground">const &#123; share &#125; = useShare(); share(shareEvent(...))</code>.</li>
                <li>• Declarative API: <code className="font-mono text-foreground">&lt;ShareTrigger target=&#123;shareCombo(&#123; ticket &#125;)&#125; variant="chip" /&gt;</code>.</li>
                <li>• Channels: Copy link, Post on X, system Native share (mobile only), Download poster (only when the target ships one).</li>
                <li>• Poster slot — pass any JSX in the target's <code className="font-mono text-foreground">poster</code> field; the combo flow reuses <code className="font-mono text-foreground">ShareCardPreview</code>. Artwork is owned per target, not by the dialog.</li>
              </ul>
            </div>
          </Section>

          <Section id="production-inventory" title="Production Inventory" kicker="26 — playground ↔ product sync">
            <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
              Components below are shipping in real routes but don't yet have a self-contained demo on this page.
              They're listed with their canonical live location so contributors can see them in context. If you
              touch any of these and the behavior is new, lift a focused demo up into the matching section above
              instead of letting the inventory grow.
            </p>

            <div className="grid gap-4 lg:grid-cols-2">
              <InventoryGroup
                title="Dashboard shell & cards"
                liveAt={[{ label: "/", href: "/" }, { label: "/events", href: "/events" }]}
                items={[
                  ["AppShell", "Page shell — top bar + main + footer composition"],
                  ["AppTopBar", "Product top nav (logo, search, user menu)"],
                  ["BridgeStrip", "Cross-product strip below the top bar"],
                  ["DayStripCalendar", "Horizontal day filter on the events grid"],
                  ["PageSectionHeader", "Section header on dashboard / events pages"],
                  ["ShowMoreEventsButton", "Dashed ghost button that expands a 1-row shelf"],
                  ["MatchMarketCard", "Fixture-style market card (used by events grid)"],
                  ["UpcomingEventCard", "Compact upcoming-event tile"],
                  ["LeagueTableCard", "Standings strip embedded inside a league module"],
                  ["LeagueWinnerMarketCard", "Season-winner market card"],
                  ["TopScorerMarketCard", "Top-scorer market card"],
                  ["PlayerScorerCard", "Per-player scorer prop card"],
                  ["PlayerPropsSpotlight", "Player-props spotlight row"],
                  ["dashboard/PlayerSpotlightCard", "Dashboard variant of the player spotlight (different from the root one shown in §primitives)"],
                  ["LiveActivityCard", "Specific-row activity feed (handle + side + outcome + price + event + time)"],
                ]}
              />
              <InventoryGroup
                title="Fans zone"
                liveAt={[{ label: "/fans", href: "/fans" }]}
                items={[
                  ["FanZoneHeader", "Fans-zone hero header"],
                  ["FansZoneEmpty", "Empty-state for a fan with no follows yet"],
                  ["FollowTeamsCompact", "Inline follow-teams control"],
                  ["FollowTeamsPanel", "Side-panel follow-teams editor"],
                  ["TeamPickerSheet", "Sheet for picking teams to follow"],
                ]}
              />
              <InventoryGroup
                title="Mobile homepage"
                liveAt={[{ label: "/", href: "/" }]}
                items={[
                  ["MobileChrome", "Outer mobile chrome wrapper (top bar + bottom nav)"],
                  ["MobileEventsSection", "Mobile events shelf"],
                  ["MobileFansSection", "Mobile fans-zone shelf"],
                  ["MobileSeeMoreCard", "Dashed mobile see-more tile"],
                ]}
              />
              <InventoryGroup
                title="Event detail extras"
                liveAt={[{ label: "/event/$id", href: "/event/featured-clasico" }]}
                items={[
                  ["event/CombinedPriceChart", "Multi-line overlay chart used at the top of the outcomes panel (see §event-outcomes-panel)"],
                ]}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-loss/30 bg-loss/5 p-5 text-xs text-loss">
              <strong>Rule.</strong> Any new shared component MUST get a real demo above — adding it to this list is only
              acceptable as a temporary placeholder while wiring up data. If the demo would require non-trivial provider
              setup (live stream, follow state, etc.), wrap the provider locally inside the demo function the same way
              <code className="font-mono"> TradeDrawerDemo</code> / <code className="font-mono">GlobalLiveStreamDemo</code> do.
            </div>
          </Section>

          <footer className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground font-mono">
            Stadium Neon · v0.1 · sports prediction design system
          </footer>
        </main>
      </div>
    </div>
  );
}

function InventoryGroup({
  title,
  liveAt,
  items,
}: {
  title: string;
  liveAt: { label: string; href: string }[];
  items: [name: string, desc: string][];
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
        <div className="flex flex-wrap gap-1.5">
          {liveAt.map((r) => (
            <Link
              key={r.href}
              to={r.href}
              className="rounded-full bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground ring-1 ring-white/10 transition hover:text-foreground hover:ring-white/20"
            >
              live at {r.label}
            </Link>
          ))}
        </div>
      </div>
      <ul className="divide-y divide-border text-xs">
        {items.map(([name, desc]) => (
          <li key={name} className="flex flex-col gap-0.5 py-2">
            <code className="font-mono text-[11px] text-foreground">{name}</code>
            <span className="text-muted-foreground">{desc}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TradeDrawerDemo() {
  const { openTrade } = useTradeDrawer();
  const threeWay = MATCH_MARKETS.find((m) => m.shape === "three-way") ?? FEATURED_MATCH;
  const binary = MATCH_MARKETS.find((m) => m.shape === "binary");
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
      <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Trigger from anywhere
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => openTrade({ marketId: threeWay.id })}
          className="rounded-xl bg-foreground px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-background transition hover:opacity-90"
        >
          Open 1X2 · {threeWay.title}
        </button>
        {binary && (
          <button
            type="button"
            onClick={() => openTrade({ marketId: binary.id, outcomeId: binary.outcomes[1]?.id })}
            className="rounded-xl bg-white/[0.06] px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-foreground ring-1 ring-white/10 transition hover:bg-white/[0.1]"
          >
            Open binary · pre-pick 2nd outcome
          </button>
        )}
      </div>
    </div>
  );
}

function PickerVariant({ market }: { market: SportsMarket }) {
  const [outcomeId, setOutcomeId] = useState(market.outcomes[0]?.id);
  const [side, setSide] = useState<"yes" | "no">("yes");
  return (
    <div className="rounded-2xl border border-border bg-background/60 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {market.outcomes.length} outcomes
        </div>
        <div className="truncate font-display text-xs font-semibold text-foreground/80">
          {market.title}
        </div>
      </div>
      <TradeOutcomePicker
        market={market}
        outcomeId={outcomeId}
        onOutcomeChange={setOutcomeId}
        side={side}
        onSideChange={setSide}
      />
    </div>
  );
}

function TradeOutcomePickerDemo() {
  const binary = MATCH_MARKETS.find((m) => m.outcomes.length === 2) ?? FEATURED_MATCH;
  const threeWay = MATCH_MARKETS.find((m) => m.outcomes.length === 3) ?? FEATURED_MATCH;

  // Synthesize a 7-outcome "player to score first" prop to validate the
  // horizontal-scroll path. Mirrors the SportsMarket shape used elsewhere.
  const sevenWay: SportsMarket = {
    id: "demo-7-prop",
    kind: "player-prop",
    shape: "three-way",
    title: "First goalscorer — USA vs Mexico",
    league: { name: "World Cup 2026", short: "WC" },
    endsLabel: "Today 8:00pm",
    volume: "$42K",
    volume24h: "$12K",
    participants: 612,
    tradeHref: "#",
    outcomes: [
      { id: "p1", label: "Pulisic", price: 0.22 },
      { id: "p2", label: "Reyna", price: 0.18 },
      { id: "p3", label: "Pepi", price: 0.14 },
      { id: "p4", label: "Balogun", price: 0.13 },
      { id: "p5", label: "Aaronson", price: 0.10 },
      { id: "p6", label: "Weah", price: 0.09 },
      { id: "p7", label: "Other / no goal", price: 0.14 },
    ],
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <PickerVariant market={binary} />
      <PickerVariant market={threeWay} />
      <PickerVariant market={sevenWay} />
    </div>
  );
}

/**
 * Build the same 7-outcome synthetic prop the picker demo uses, so the
 * outcomes-panel demo also exercises the multi-line chart + scrolling list
 * path. Kept inside this file so the playground stays self-contained.
 */
function buildSevenWayMarket(): SportsMarket {
  return {
    id: "demo-7-prop",
    kind: "player-prop",
    shape: "three-way",
    title: "First goalscorer — USA vs Mexico",
    league: { name: "World Cup 2026", short: "WC" },
    endsLabel: "Today 8:00pm",
    volume: "$42K",
    volume24h: "$12K",
    participants: 612,
    tradeHref: "#",
    outcomes: [
      { id: "p1", label: "Pulisic", price: 0.22, delta24h: 0.02 },
      { id: "p2", label: "Reyna", price: 0.18, delta24h: -0.01 },
      { id: "p3", label: "Pepi", price: 0.14, delta24h: 0.01 },
      { id: "p4", label: "Balogun", price: 0.13 },
      { id: "p5", label: "Aaronson", price: 0.10, delta24h: -0.02 },
      { id: "p6", label: "Weah", price: 0.09 },
      { id: "p7", label: "Other / no goal", price: 0.14 },
    ],
  };
}

function PanelVariant({ market }: { market: SportsMarket }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    if (!pulse) return;
    const t = setTimeout(() => setPulse(0), 700);
    return () => clearTimeout(t);
  }, [pulse]);

  const selected = market.outcomes[selectedIdx];
  const cents = Math.round(selected.price * 100);
  const noCents = 100 - cents;

  // Seed two mock chart positions so the new TradingView-style overlay
  // (CombinedPriceChart `positions`) is exercised in every panel variant —
  // one long-YES on the leading outcome and one long-NO on the runner-up.
  const chartPositions = useMemo<ChartPosition[]>(() => {
    const a = market.outcomes[0];
    const b = market.outcomes[1] ?? market.outcomes[0];
    const aEntry = Math.max(1, Math.min(99, Math.round(a.price * 100) - 4));
    const bEntry = Math.max(1, Math.min(99, 100 - Math.round(b.price * 100) - 6));
    return [
      {
        outcomeId: a.id,
        side: "yes",
        entry: aEntry,
        pnl: 2.51,
        size: 180,
        outcomeLabel: a.team?.short ?? a.label,
      },
      {
        outcomeId: b.id,
        side: "no",
        entry: bEntry,
        pnl: 0.36,
        size: 90,
        outcomeLabel: b.team?.short ?? b.label,
      },
    ];
  }, [market]);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <EventOutcomesPanel
        market={market}
        selectedIdx={selectedIdx}
        tradeSide={side}
        onSelect={setSelectedIdx}
        onSideSelect={(idx, s) => {
          setSelectedIdx(idx);
          setSide(s);
          setPulse((p) => p + 1);
        }}
        chartPositions={chartPositions}
      />
      <div
        className={cn(
          "h-fit rounded-2xl border border-border bg-surface p-4 text-xs lg:sticky lg:top-4",
          pulse > 0 && "animate-trade-pulse",
        )}
      >
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Sticky TradeForm (stub)
        </div>
        <div className="mt-2 font-display text-base font-semibold text-foreground">
          {selected.team?.name ?? selected.label}{" "}
          <span className={cn(side === "yes" ? "text-win" : "text-loss")}>
            {side === "yes" ? "YES" : "NO"}
          </span>
        </div>
        <div className="mt-1 font-mono text-2xl tabular-nums text-foreground">
          {side === "yes" ? cents : noCents}¢
        </div>
        <div className="mt-3 text-[11px] text-muted-foreground">
          Pulses lavender for ~700ms whenever a row's Buy YES / Buy NO button is pressed.
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/*  Guess the Legend playground helpers                                  */
/* -------------------------------------------------------------------- */

function LegendScoreboardDemo() {
  const active = LEGEND_ROUNDS.find((r) => r.status === "voting") ?? LEGEND_ROUNDS[0];
  return (
    <div className="w-full">
      <ScoreboardChassis>
        <div className="mx-auto w-full max-w-3xl">
          <MissionBrief />
          <RoundProgressHud
            rounds={LEGEND_ROUNDS}
            activeRoundId={active.id}
            hits={1}
            completed={2}
            onSelectRound={() => {}}
          />
          <ActiveRoundBay round={active} effectiveStatus={active.status} />
          <CandidateBoard
            round={active}
            effectiveStatus={active.status}
            effectivePickId={undefined}
            onSelectCandidate={() => {}}
            onLockIn={() => {}}
          />
          <SignedArchiveStrip rounds={LEGEND_ROUNDS} />
        </div>
      </ScoreboardChassis>
    </div>
  );
}

function LegendAssetsInventory() {
  const codes = Object.keys(LEGEND_COUNTRIES) as LegendCountryCode[];
  const tokens: { name: string; hex: string; usage: string }[] = [
    { name: "ACCENT (HIT)", hex: "#4ade80", usage: "Correct guess · HUD LED bar · archive winner border" },
    { name: "AMBER (LIVE)", hex: "#facc15", usage: "Active round ring · split-flap clue rail · GUES-NN label" },
    { name: "MISS", hex: "#f87171", usage: "Wrong guess · revealed-miss tile border + LED bar" },
    { name: "Chassis BG", hex: "#0d0d0d", usage: "ScoreboardChassis surface · HUD panel · candidate board" },
  ];
  return (
    <div className="space-y-8 rounded-lg border border-border bg-card/40 p-5">
      {/* 1. Weathered hero flags */}
      <div>
        <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-amber-400/80">
          1 · Country flags — weathered hero (ActiveRoundBay only)
        </div>
        <p className="mb-3 max-w-2xl text-xs text-muted-foreground">
          Reference via <code className="font-mono text-foreground">LEGEND_COUNTRIES[code].flagImage</code>. Source:{" "}
          <code className="font-mono text-foreground">src/assets/legend-reveal/flag-*.jpg</code>. Never use in the HUD — too noisy at small size.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {codes.map((code) => {
            const c = LEGEND_COUNTRIES[code];
            return (
              <div key={code} className="overflow-hidden rounded-md border border-border bg-[#0a0a0a]">
                <img src={c.flagImage} alt={`${c.name} weathered flag`} className="h-24 w-full object-cover" />
                <div className="px-2 py-1.5">
                  <div className="font-mono text-[10px] font-bold text-foreground">{code}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{c.name} · {c.region}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Flat ISO SVG flags */}
      <div>
        <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-amber-400/80">
          2 · Country flags — flat ISO SVG (RoundProgressHud only)
        </div>
        <p className="mb-3 max-w-2xl text-xs text-muted-foreground">
          Reference via <code className="font-mono text-foreground">country-flag-icons/react/3x2</code> using{" "}
          <code className="font-mono text-foreground">LEGEND_COUNTRIES[code].iso2</code>. England uses the{" "}
          <code className="font-mono text-foreground">GB-ENG</code> subdivision (St George's Cross).
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {codes.map((code) => {
            const c = LEGEND_COUNTRIES[code];
            const Flag = (FlatFlags as Record<string, React.ComponentType<{ className?: string; title?: string }> | undefined>)[c.iso2.replace(/-/g, "_")];
            return (
              <div key={code} className="rounded-md border border-border bg-[#0a0a0a] p-2">
                <div className="overflow-hidden rounded-sm border border-black/70">
                  {Flag ? <Flag title={c.name} className="block h-12 w-full" /> : <div className="h-12 w-full bg-zinc-800" />}
                </div>
                <div className="mt-1.5">
                  <div className="font-mono text-[10px] font-bold text-foreground">{code} · iso2={c.iso2}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{c.name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Signed portraits */}
      <div>
        <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-amber-400/80">
          3 · Signed portraits (SignedArchiveStrip + ActiveRoundBay reveal)
        </div>
        <p className="mb-3 max-w-2xl text-xs text-muted-foreground">
          Reference via <code className="font-mono text-foreground">LEGEND_SIGNED_IMAGES[code]</code>. Mystery silhouette via{" "}
          <code className="font-mono text-foreground">LEGEND_MYSTERY_PORTRAIT</code> is shown on the active hero until reveal day. CIV is a pre-warm bonus —{" "}
          <b>not</b> part of the 8-round queue.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {codes.map((code) => (
            <div key={code} className="rounded-md border border-border bg-[#0a0a0a] p-2">
              <div className="overflow-hidden rounded-sm ring-1 ring-amber-500/40">
                <img src={LEGEND_SIGNED_IMAGES[code]} alt={`${LEGEND_COUNTRIES[code].name} signed portrait`} className="aspect-[5/7] w-full object-cover" />
              </div>
              <div className="mt-1.5 font-mono text-[10px] font-bold text-foreground">{code}</div>
              <div className="font-mono text-[10px] text-muted-foreground">LEGEND_SIGNED_IMAGES.{code}</div>
            </div>
          ))}
          <div className="rounded-md border border-dashed border-border bg-[#0a0a0a] p-2">
            <div className="overflow-hidden rounded-sm ring-1 ring-zinc-700">
              <img src={LEGEND_MYSTERY_PORTRAIT} alt="Mystery silhouette" className="aspect-[5/7] w-full object-cover" />
            </div>
            <div className="mt-1.5 font-mono text-[10px] font-bold text-foreground">MYSTERY</div>
            <div className="font-mono text-[10px] text-muted-foreground">LEGEND_MYSTERY_PORTRAIT</div>
          </div>
          <div className="rounded-md border border-amber-500/30 bg-[#0a0a0a] p-2">
            <div className="overflow-hidden rounded-sm ring-1 ring-amber-500/40">
              <img src={signedCivAsset} alt="Côte d'Ivoire pre-warm" className="aspect-[5/7] w-full object-cover" />
            </div>
            <div className="mt-1.5 font-mono text-[10px] font-bold text-foreground">CIV (bonus)</div>
            <div className="font-mono text-[10px] text-muted-foreground">signed-civ.jpg · pre-warm only</div>
          </div>
        </div>
      </div>

      {/* 4. Color tokens */}
      <div>
        <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-amber-400/80">
          4 · Color tokens (constants in GuessTheLegendTab.tsx)
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tokens.map((t) => (
            <div key={t.name} className="overflow-hidden rounded-md border border-border bg-[#0a0a0a]">
              <div className="h-12 w-full" style={{ background: t.hex }} />
              <div className="px-2 py-1.5">
                <div className="font-mono text-[10px] font-bold text-foreground">{t.name}</div>
                <div className="font-mono text-[10px] text-muted-foreground">{t.hex}</div>
                <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{t.usage}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Per-round clue script */}
      <LegendClueScript />
    </div>
  );
}

function LegendClueScript() {
  const ACCENT = "#4ade80";
  const AMBER = "#facc15";
  const MISS = "#f87171";

  function statusMeta(s: typeof LEGEND_ROUNDS[number]["status"]) {
    if (s === "revealed-hit") return { color: ACCENT, label: "HIT" };
    if (s === "revealed-miss") return { color: MISS, label: "MISS" };
    if (s === "voting" || s === "locked-in") return { color: AMBER, label: "LIVE" };
    return { color: "#3f3f46", label: "TBA" };
  }

  return (
    <div>
      <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-amber-400/80">
        5 · Per-round clue script & correct legend
      </div>
      <p className="mb-3 max-w-3xl text-xs text-muted-foreground">
        Three clues per round, fixed labels:{" "}
        <code className="font-mono text-foreground">POSITION · PEAK CLUB · MAJOR TROPHY</code>.
        Within a <b>LIVE</b> round the clues unlock progressively via community vote — clue ① is
        open at launch, ② unlocks after ~30% vote, ③ unlocks after ≥60% vote (the final reveal
        before lock-in). Past rounds (HIT / MISS) show all three for archive review. Upcoming
        rounds (TBA) list the full clue set here for QA only; in product they stay hidden until
        the round goes live.
      </p>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[760px] border-collapse text-left font-mono text-[11px]">
          <thead className="bg-[#0d0d0d] text-[10px] uppercase tracking-widest text-zinc-500">
            <tr>
              <th className="px-3 py-2 font-semibold">Round</th>
              <th className="px-3 py-2 font-semibold">Country</th>
              <th className="px-3 py-2 font-semibold">Correct legend</th>
              <th className="px-3 py-2 font-semibold text-zinc-300">POSITION</th>
              <th className="px-3 py-2 font-semibold text-zinc-300">PEAK CLUB</th>
              <th className="px-3 py-2 font-semibold text-zinc-300">MAJOR TROPHY</th>
              <th className="px-3 py-2 font-semibold">Distractors</th>
            </tr>
          </thead>
          <tbody>
            {LEGEND_ROUNDS.map((r) => {
              const meta = statusMeta(r.status);
              const country = LEGEND_COUNTRIES[r.country];
              const correct = r.candidates.find((c) => c.id === r.correctCandidateId);
              const distractors = r.candidates.filter((c) => c.id !== r.correctCandidateId);
              const clueByIdx = (idx: 1 | 2 | 3) => r.clues.find((c) => c.idx === idx);
              return (
                <tr key={r.id} className="border-t border-border bg-[#0a0a0a] align-top">
                  <td className="px-3 py-2" style={{ borderLeft: `3px solid ${meta.color}` }}>
                    <div className="font-bold text-foreground">#{String(r.roundNumber).padStart(2, "0")}</div>
                    <div className="text-[10px] uppercase tracking-widest" style={{ color: meta.color }}>{meta.label}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-bold text-foreground">{r.country}</div>
                    <div className="text-[10px] text-muted-foreground">{country.name}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-bold text-foreground">{correct?.name ?? "—"}</div>
                    <div className="text-[10px] text-muted-foreground">{correct?.club ?? ""}</div>
                  </td>
                  {[1, 2, 3].map((i) => {
                    const clue = clueByIdx(i as 1 | 2 | 3);
                    if (!clue) return <td key={i} className="px-3 py-2 text-zinc-600">—</td>;
                    const locked = clue.state === "locked";
                    return (
                      <td key={i} className={`px-3 py-2 ${locked ? "text-zinc-500" : "text-foreground"}`}>
                        <div className="font-bold uppercase tracking-wide">
                          {locked ? "🔒 " : ""}{clue.value}
                        </div>
                        {locked && clue.unlockHint && (
                          <div className="mt-0.5 text-[10px] text-muted-foreground">{clue.unlockHint}</div>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 text-[10px] text-muted-foreground">
                    {distractors.length === 0
                      ? "—"
                      : distractors.map((d) => d.name).join(" · ")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 max-w-3xl text-[11px] text-muted-foreground">
        Source of truth: <code className="font-mono text-foreground">LEGEND_ROUNDS</code> in{" "}
        <code className="font-mono text-foreground">src/data/world-cup-carnival.ts</code>. Edit clue copy / correct
        candidate there; this table mirrors the data and stays in sync automatically.
        Upcoming rounds (TBA) keep <code className="font-mono text-foreground">status: "upcoming"</code> in product
        UI — the country/legend/clues are documented here for QA + content review only.
      </p>
    </div>
  );
}

function LegendBayPlayground() {
  const baseRound =
    LEGEND_ROUNDS.find((r) => r.status === "voting") ?? LEGEND_ROUNDS[0];
  const states: {
    key: string;
    label: LegendRoundStatus;
    description: string;
    variant?: "no-pick";
  }[] = [
    { key: "voting", label: "voting", description: "Active round — clues unlock, candidates clickable" },
    { key: "revealed-hit", label: "revealed-hit", description: "Reveal day — user picked correctly" },
    { key: "revealed-miss", label: "revealed-miss", description: "Reveal day — user missed" },
    { key: "revealed-no-pick", label: "revealed-miss", description: "Reveal day — user didn't pick", variant: "no-pick" },
  ];
  return (
    <div className="space-y-8">
      <LegendRevealSequenceDemo baseRound={baseRound} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-1">
      {states.map((s) => {
        const round: LegendRound = {
          ...baseRound,
          status: s.label,
          userPickId:
            s.variant === "no-pick"
              ? undefined
              : s.label === "revealed-miss"
              ? baseRound.candidates.find(
                  (c) => c.id !== baseRound.correctCandidateId,
                )?.id
              : baseRound.correctCandidateId,
        };
        const pickId = s.label === "voting" ? undefined : round.userPickId;
        return (
          <div key={s.key} className="space-y-2">
            <div className="font-mono text-[10px] uppercase tracking-widest text-amber-400/80">
              {s.label} · {s.description}
            </div>
            <ScoreboardChassis>
              <ActiveRoundBay round={round} effectiveStatus={s.label} />
              <CandidateBoard
                round={round}
                effectiveStatus={s.label}
                effectivePickId={pickId}
                onSelectCandidate={() => {}}
                onLockIn={() => {}}
              />
            </ScoreboardChassis>
          </div>
        );
      })}
      </div>
    </div>
  );
}

function EventOutcomesPanelDemo() {
  // placeholder anchor — real impl below
  return _EventOutcomesPanelDemoImpl();
}

function LegendRevealSequenceDemo({ baseRound }: { baseRound: LegendRound }) {
  const [outcome, setOutcome] = useState<RevealOutcome | null>(null);

  const round: LegendRound = useMemo(() => {
    if (!outcome) return baseRound;
    const wrong = baseRound.candidates.find(
      (c) => c.id !== baseRound.correctCandidateId,
    );
    return {
      ...baseRound,
      status: outcome === "hit" ? "revealed-hit" : "revealed-miss",
      userPickId:
        outcome === "hit"
          ? baseRound.correctCandidateId
          : outcome === "miss"
            ? wrong?.id
            : undefined,
    };
  }, [baseRound, outcome]);

  const buttons: { id: RevealOutcome; label: string; color: string }[] = [
    { id: "hit", label: "▶ PLAY HIT", color: "#4ade80" },
    { id: "miss", label: "▶ PLAY MISS", color: "#f87171" },
    { id: "no-pick", label: "▶ PLAY NO-PICK", color: "#60a5fa" },
  ];

  return (
    <div className="space-y-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-amber-400/80">
        reveal sequence · 6–8s cinematic, auto-plays once per user per round
      </div>
      <div className="flex flex-wrap gap-2">
        {buttons.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setOutcome(b.id)}
            className="border-2 px-4 py-2 font-mono text-xs font-bold tracking-widest transition-colors"
            style={{ borderColor: b.color, color: b.color }}
          >
            {b.label}
          </button>
        ))}
        <span className="self-center font-mono text-[10px] text-muted-foreground">
          Replays do not write the seen flag — close with SKIP or wait for end.
        </span>
      </div>
      <AnimatePresence>
        {outcome && (
          <LegendRevealOverlay
            key={outcome}
            round={round}
            outcomeOverride={outcome}
            isReplay
            onClose={() => setOutcome(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function _EventOutcomesPanelDemoImpl() {
  const binary = MATCH_MARKETS.find((m) => m.outcomes.length === 2) ?? FEATURED_MATCH;
  const threeWay = MATCH_MARKETS.find((m) => m.outcomes.length === 3) ?? FEATURED_MATCH;
  const sevenWay = buildSevenWayMarket();
  return (
    <div className="space-y-8">
      <Variant label="Binary (2 outcomes)" market={binary} />
      <Variant label="1X2 (3 outcomes)" market={threeWay} />
      <Variant label="Player prop (7 outcomes)" market={sevenWay} />
    </div>
  );
}

function Variant({ label, market }: { label: string; market: SportsMarket }) {
  return (
    <div>
      <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <PanelVariant market={market} />
    </div>
  );
}

function EventLiveStageDemo() {
  const live =
    MATCH_MARKETS.find((m) => m.isLiveStream && m.liveScore && m.fixture) ??
    FEATURED_MATCH;
  const selected = live.outcomes[0] ?? live.outcomes[0];
  return (
    <StageTabs
      defaultTabId="stream"
      tabs={[
        {
          id: "stream",
          label: "Stream",
          badge: (
            <span className="ml-1 inline-flex h-1.5 w-1.5 rounded-full bg-[color:var(--accent)] shadow-[0_0_8px_var(--accent)]" />
          ),
          content: <EventLiveStage market={live} selected={selected} />,
        },
        {
          id: "chart",
          label: "Chart",
          content: (
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center text-xs text-muted-foreground">
              PriceChart slot
            </div>
          ),
        },
        {
          id: "book",
          label: "Order book",
          content: (
            <div className="space-y-3">
              <OrderBook sideLabels={{ yes: "Man City", no: "Real Madrid" }} />
              <p className="text-xs text-muted-foreground">
                Left column shows <span className="text-[oklch(0.85_0.16_155)]">Man City</span> orders: sellers above, buyers below the last traded price. Right column shows <span className="text-[oklch(0.82_0.16_25)]">Real Madrid</span> the same way — prices move in opposite directions because the two outcomes are mutually exclusive.
              </p>
            </div>
          ),
        },
      ]}
    />
  );
}

function MobileTradeBarDemo() {
  const live =
    MATCH_MARKETS.find((m) => m.isLiveStream && m.fixture) ?? FEATURED_MATCH;
  const selected = live.outcomes[0];
  return (
    <div className="relative">
      {/* Locally override the lg:hidden rule by wrapping in a smaller, static
          frame — only used to demo the bar inside the style-guide. */}
      <div className="[&_.fixed]:!relative [&_.fixed]:!inset-auto [&_.fixed]:!bottom-auto">
        <MobileTradeBar market={live} selected={selected} />
      </div>
    </div>
  );
}

function GlobalLiveStreamDemo() {
  // We can't easily render the portaled mini player inside the guide
  // without polluting the rest of the page, so this demo offers a button
  // that starts a global watching session — the mini player then appears
  // bottom-right of the screen and follows the user as they browse.
  const live =
    MATCH_MARKETS.find((m) => m.isLiveStream && m.liveScore && m.fixture) ??
    FEATURED_MATCH;
  const { startWatching, stopWatching, openFullscreen, setMinimized, active } =
    useLiveStream();
  const watching = active?.marketId === live.id;
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface/40 p-4 text-xs">
      <span className="font-mono uppercase tracking-widest text-muted-foreground">
        {live.title}
      </span>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            startWatching(live.id, live.outcomes[0]?.id);
            setMinimized(true);
          }}
          className="rounded-md bg-primary px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
        >
          Start watching
        </button>
        <button
          type="button"
          onClick={() => {
            startWatching(live.id, live.outcomes[0]?.id);
            openFullscreen();
          }}
          className="rounded-md bg-white/[0.06] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-foreground hover:bg-white/[0.12]"
        >
          Open fullscreen
        </button>
        {watching && (
          <button
            type="button"
            onClick={stopWatching}
            className="rounded-md bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:bg-white/[0.1]"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
}

function EventExtrasDemo() {
  const base =
    MATCH_MARKETS.find((m) => m.isLiveStream && m.fixture) ?? FEATURED_MATCH;
  const preMatch =
    MATCH_MARKETS.find((m) => !m.isLiveStream && m.fixture) ?? FEATURED_MATCH;
  const related = getRelatedMarkets(base);
  const selected = base.outcomes[0];
  return (
    <div className="space-y-4">
      <RelatedMarketsBar markets={related} />
      <div className="grid gap-3 md:grid-cols-2">
        <DepthBar
          mark={Math.round(selected.price * 100)}
          sideLabels={
            base.outcomes.length === 2
              ? {
                  yes: base.outcomes[0].team?.name ?? base.outcomes[0].label,
                  no: base.outcomes[1].team?.name ?? base.outcomes[1].label,
                }
              : undefined
          }
        />
        <div className="flex items-center justify-end">
          <ShareButton outcomeId={selected.id} />
        </div>
      </div>
      <PreMatchStrip market={preMatch} />
      <LiveTape market={base} />
    </div>
  );
}

/**
 * Showcase wrapper that mirrors the real `/event/$id` header shell
 * (ambient surface + stats panel) around an {@link EventQuestionHeading}.
 * Used in the style-guide so playground and product stay in sync.
 */
function QuestionHeaderDemo({ market }: { market: SportsMarket }) {
  return (
    <header className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-card">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-ambient" />
      <div className="relative flex flex-col items-stretch md:flex-row">
        <div className="flex flex-1 flex-col">
          <EventQuestionHeading market={market} />
        </div>
        <div
          aria-hidden
          className="hidden w-px bg-gradient-to-b from-transparent via-white/10 to-transparent md:my-8 md:block"
        />
        <div className="flex w-full flex-row justify-around gap-6 border-t border-white/5 bg-white/[0.01] px-8 py-5 md:w-52 md:flex-col md:justify-center md:gap-5 md:border-t-0 md:px-7 md:pb-8 md:pt-14">
          <div className="space-y-1">
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/70">
              Total Volume
            </p>
            <p className="font-mono text-lg font-medium tracking-tight text-foreground tabular-nums">
              {market.volume}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                aria-hidden
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-win shadow-[0_0_10px_currentColor]"
              />
              <p className="font-mono text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/70">
                Live Players
              </p>
            </div>
            <p className="font-mono text-lg font-medium tracking-tight text-foreground tabular-nums">
              {market.participants.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </header>
  );
}

/**
 * Showcase for the global Share system. Renders every ShareTrigger variant
 * plus one open-dialog button per target kind so the dialog states are all
 * reachable from the playground.
 */
function ShareDemo() {
  const sampleTicket = {
    ticketId: "t_demo_share",
    status: "SETTLED_WON" as const,
    acceptedAtMs: Date.now() - 3_600_000,
    stakeU: 10,
    lockedActivityOdds: 14.2,
    grossPayoutU: 142,
    wonLegCount: 4,
    legs: [
      { matchId: "m1", outcomeId: "o1", marketId: "m1:ML", marketType: "MONEYLINE" as const, marketLabel: "Moneyline", outcomeSide: "HOME" as const, teamLabel: "Argentina Win", matchLabel: "Argentina vs Mexico", kickoff: "", probability: 0.55, displayProbability: "55%" },
      { matchId: "m2", outcomeId: "o2", marketId: "m2:ML", marketType: "MONEYLINE" as const, marketLabel: "Moneyline", outcomeSide: "HOME" as const, teamLabel: "Brazil Win", matchLabel: "Brazil vs Japan", kickoff: "", probability: 0.6, displayProbability: "60%" },
      { matchId: "m3", outcomeId: "o3", marketId: "m3:ML", marketType: "MONEYLINE" as const, marketLabel: "Moneyline", outcomeSide: "HOME" as const, teamLabel: "Spain Win", matchLabel: "Spain vs USA", kickoff: "", probability: 0.58, displayProbability: "58%" },
      { matchId: "m4", outcomeId: "o4", marketId: "m4:ML", marketType: "MONEYLINE" as const, marketLabel: "Moneyline", outcomeSide: "HOME" as const, teamLabel: "Germany Win", matchLabel: "Germany vs Canada", kickoff: "", probability: 0.62, displayProbability: "62%" },
    ],
  };

  const eventTarget = shareEvent({
    id: "wc26-final",
    title: "Will Brazil lift the World Cup?",
    subtitle: "World Cup 2026 · Outright",
    outcomeId: "yes",
  });
  const leagueTarget = shareLeague({
    slug: "world-cup-2026",
    title: "World Cup 2026",
    subtitle: "48 teams · 104 matches",
  });
  const playerTarget = sharePlayer({
    id: "messi",
    title: "Lionel Messi",
    subtitle: "Player props · World Cup 2026",
  });
  const comboTarget = shareCombo({
    ticket: sampleTicket,
    poster: <ShareCardPreview ticket={sampleTicket} />,
  });
  const luckyTarget = shareLuckyBox({
    prizeId: "signed-jersey",
    title: "Signed Argentina jersey",
    subtitle: "Trophy Vault drop · Phase 2",
  });
  const promoTarget = sharePromo({
    slug: "world-cup",
    title: "World Cup Carnival",
    subtitle: "3,000,000 U prize pool",
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Trigger variants
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ShareTrigger target={eventTarget} variant="icon" />
          <ShareTrigger target={eventTarget} variant="chip" />
          <ShareTrigger target={eventTarget} variant="ghost" />
          <div className="w-full max-w-xs">
            <ShareTrigger target={eventTarget} variant="wide" label="Share match snapshot" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Target kinds
        </div>
        <div className="flex flex-wrap gap-2">
          <ShareTrigger target={eventTarget} variant="chip" label="Event" />
          <ShareTrigger target={leagueTarget} variant="chip" label="League" />
          <ShareTrigger target={playerTarget} variant="chip" label="Player" />
          <ShareTrigger target={comboTarget} variant="chip" label="Combo ticket" />
          <ShareTrigger target={luckyTarget} variant="chip" label="Lucky box" />
          <ShareTrigger target={promoTarget} variant="chip" label="Promo" />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Share poster — OMENX stadium
        </div>
        <div className="mx-auto w-full max-w-[420px]">
          <ShareCardPreview ticket={sampleTicket} />
        </div>
        <div className="mx-auto mt-6 w-full max-w-[420px]">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Draft variant — pre-submit (same artwork)
          </div>
          <ShareCardPreview
            legs={sampleTicket.legs}
            stakeU={sampleTicket.stakeU}
            odds={sampleTicket.lockedActivityOdds}
            grossPayoutU={sampleTicket.grossPayoutU}
          />
        </div>
        <div className="mx-auto mt-6 w-full max-w-[420px]">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Mixed markets — moneyline · spread · total · draw
          </div>
          <ShareCardPreview
            legs={[
              { matchId: "mx1", outcomeId: "o1", marketId: "mx1:ML", marketType: "MONEYLINE", marketLabel: "Moneyline", outcomeSide: "HOME", teamLabel: "Brazil Win", matchLabel: "Brazil vs Argentina", kickoff: "", probability: 0.55, displayProbability: "55%" },
              { matchId: "mx2", outcomeId: "o2", marketId: "mx2:SPR", marketType: "SPREAD", marketLabel: "Spread · France -1.5", outcomeSide: "HOME", teamLabel: "France -1.5", matchLabel: "France vs Morocco", kickoff: "", probability: 0.48, displayProbability: "48%" },
              { matchId: "mx3", outcomeId: "o3", marketId: "mx3:TOT", marketType: "TOTAL", marketLabel: "Total · Over 2.5", outcomeSide: "HOME", teamLabel: "Over 2.5", matchLabel: "Spain vs Germany", kickoff: "", probability: 0.52, displayProbability: "52%" },
              { matchId: "mx4", outcomeId: "o4", marketId: "mx4:ML", marketType: "MONEYLINE", marketLabel: "Moneyline", outcomeSide: "DRAW", teamLabel: "Draw", matchLabel: "Italy vs Croatia", kickoff: "", probability: 0.28, displayProbability: "28%" },
            ]}
            stakeU={10}
            odds={32.4}
            grossPayoutU={324}
          />
          <p className="mt-2 text-[11px] text-muted-foreground">
            Spread/Total picks always render the matchLabel sub-line so the poster never collapses into a context-less "UNDER 0.5 WIN".
          </p>
        </div>
      </div>

    </div>
  );
}