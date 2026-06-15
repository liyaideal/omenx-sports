import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/sports/dashboard/AppShell";
import { AppTopBar } from "@/components/sports/dashboard/AppTopBar";
import { MobileChrome } from "@/components/sports/mobile/MobileChrome";
import { CarnivalTabs } from "@/components/sports/promo/CarnivalTabs";
import { OverviewSection } from "@/components/sports/promo/OverviewSection";
import { NewbieRewardsSection } from "@/components/sports/promo/NewbieRewardsSection";
import { ComboChallengeSection } from "@/components/sports/promo/ComboChallengeSection";
import { LuckyBoxSection } from "@/components/sports/promo/LuckyBoxSection";
import { CarnivalRulesSection } from "@/components/sports/promo/CarnivalRulesSection";
import { ScoreboardHero } from "@/components/sports/promo/ScoreboardHero";
import { ScoreboardTicker } from "@/components/sports/promo/ScoreboardTicker";
import { ACCOUNT_STATS } from "@/data/sports-markets";
import type { CarnivalTab } from "@/data/world-cup-carnival";

const USER_NAME = "Jeremy";
const USER_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces&q=80";

function normalizeTab(raw: unknown): CarnivalTab {
  if (raw === "newbie" || raw === "combo" || raw === "luckybox" || raw === "rules") {
    return raw;
  }
  return "overview";
}

interface SearchShape {
  tab: CarnivalTab;
}

export const Route = createFileRoute("/promo/world-cup")({
  validateSearch: (raw: Record<string, unknown>): SearchShape => ({
    tab: normalizeTab(raw.tab),
  }),
  head: () => ({
    meta: [
      { title: "World Cup Carnival — OMENX" },
      {
        name: "description",
        content:
          "3,000,000 U prize pool across the OMENX World Cup Carnival: welcome pack, combo challenge and daily lucky box.",
      },
      { property: "og:title", content: "World Cup Carnival — OMENX" },
      {
        property: "og:description",
        content:
          "Stack vouchers, run a 4-leg combo and spin the trophy vault for signed jerseys.",
      },
    ],
  }),
  component: CarnivalPage,
});

function CarnivalPage() {
  const { tab } = Route.useSearch();
  return (
    <AppShell>
      <div className="hidden md:block">
        <AppTopBar
          userName={USER_NAME}
          userAvatar={USER_AVATAR}
          equity={ACCOUNT_STATS.available}
        />
      </div>

      <MobileChrome>
        <CarnivalContent tab={tab} />
      </MobileChrome>

      <div className="hidden flex-col gap-6 px-6 pb-12 pt-8 md:flex md:px-8 md:pt-10">
        <CarnivalContent tab={tab} />
      </div>
    </AppShell>
  );
}

function CarnivalContent({ tab }: { tab: CarnivalTab }) {
  return (
    <div className="space-y-6">
      <CarnivalTabs current={tab} />

      {tab !== "overview" && (
        <ScoreboardHero compact />
      )}

      {tab === "overview" && <OverviewSection />}
      {tab === "newbie" && <NewbieRewardsSection />}
      {tab === "combo" && <ComboChallengeSection />}
      {tab === "luckybox" && <LuckyBoxSection />}
      {tab === "rules" && <CarnivalRulesSection />}

      {tab !== "overview" && <ScoreboardTicker />}
    </div>
  );
}