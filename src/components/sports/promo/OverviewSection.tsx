import { Link } from "@tanstack/react-router";
import { Circle, Diamond, BarChart3 } from "lucide-react";
import {
  USER_CARNIVAL_STATE,
  CARNIVAL_TABS,
  type CarnivalTab,
} from "@/data/world-cup-carnival";
import { ScoreboardHero } from "./ScoreboardHero";
import { ScoreboardTicker } from "./ScoreboardTicker";
import { cn } from "@/lib/utils";

interface SeriesEntry {
  tab: CarnivalTab;
  sec: string;
  title: string;
  highlight: string;
  body: string;
  accent: string; // OKLCH or hex
  icon: React.ReactNode;
  iconShape: "circle" | "diamond" | "bars";
}

const SERIES: SeriesEntry[] = [
  {
    tab: "newbie",
    sec: "SEC-01",
    title: "Welcome Pack",
    highlight: "Up to 560 U",
    body: "Register, deposit, trade & invite to stack position vouchers.",
    accent: "oklch(0.7 0.18 145)",
    icon: <Circle className="h-3 w-3" />,
    iconShape: "circle",
  },
  {
    tab: "combo",
    sec: "SEC-02",
    title: "Combo Challenge",
    highlight: "10 U → 500 U",
    body: "Pick 4 World Cup outcomes. Land all 4 to win up to 50× your stake.",
    accent: "#facc15",
    icon: <Diamond className="h-3.5 w-3.5" />,
    iconShape: "diamond",
  },
  {
    tab: "luckybox",
    sec: "SEC-03",
    title: "Lucky Box",
    highlight: "Signed Jersey",
    body: "Hit daily volume to roll the trophy vault. Grand prize: signed kit.",
    accent: "#60a5fa",
    icon: <BarChart3 className="h-3.5 w-3.5" />,
    iconShape: "bars",
  },
];

export function OverviewSection() {
  return (
    <div className="flex flex-col gap-6">
      <ScoreboardHero />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {SERIES.map((s) => (
          <SeriesCard key={s.tab} entry={s} />
        ))}
      </div>

      <FanStatusPanel />

      <ScoreboardTicker />
    </div>
  );
}

function SeriesCard({ entry }: { entry: SeriesEntry }) {
  const tab = CARNIVAL_TABS.find((t) => t.id === entry.tab);
  const label = tab?.label ?? entry.title;
  return (
    <Link
      to="/promo/world-cup"
      search={{ tab: entry.tab }}
      className="group relative block overflow-hidden border-2 border-zinc-800 bg-[#0a0a0a] transition-colors hover:border-[color:var(--card-accent)]"
      style={{ ["--card-accent" as string]: entry.accent }}
      aria-label={`Open ${label}`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <span
            className="grid h-8 w-8 place-items-center rounded border border-zinc-700 bg-zinc-900 text-[color:var(--card-accent)]"
            aria-hidden
          >
            <span
              className={cn(
                entry.iconShape === "diamond" && "rotate-45",
                entry.iconShape === "bars" && "flex items-end gap-0.5",
              )}
            >
              {entry.iconShape === "bars" ? (
                <>
                  <span className="block h-4 w-1 bg-[color:var(--card-accent)]" />
                  <span className="block h-2 w-1 bg-[color:var(--card-accent)]" />
                  <span className="block h-3 w-1 bg-[color:var(--card-accent)]" />
                </>
              ) : entry.iconShape === "diamond" ? (
                <span className="block h-3 w-3 bg-[color:var(--card-accent)]" />
              ) : (
                <span className="block h-3 w-3 rounded-full border-2 border-[color:var(--card-accent)]" />
              )}
            </span>
          </span>
          <span className="font-scoreboard text-[10px] font-bold tracking-[0.25em] text-zinc-500">
            {entry.sec}
          </span>
        </div>

        <h3 className="mt-5 font-pitch text-xl font-bold uppercase tracking-wide text-white transition-colors group-hover:text-[color:var(--card-accent)]">
          {entry.title}
        </h3>
        <div className="mt-1 font-scoreboard text-lg font-black italic tabular-nums text-[color:var(--card-accent)]">
          {entry.highlight}
        </div>
        <p className="mt-3 text-sm text-zinc-400">{entry.body}</p>

        <div className="mt-5 inline-flex items-center gap-2 font-pitch text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 transition-colors group-hover:text-[color:var(--card-accent)]">
          Enter section →
        </div>
      </div>
      <span
        aria-hidden
        className="block h-1 bg-zinc-800 transition-all group-hover:bg-[color:var(--card-accent)] group-hover:shadow-[0_0_12px_var(--card-accent)]"
      />
    </Link>
  );
}

function FanStatusPanel() {
  const s = USER_CARNIVAL_STATE;
  const followed = s.followedTeams.slice(0, 2);
  const extra = s.followedTeams.length - followed.length;
  return (
    <div className="flex flex-col items-stretch gap-5 border border-zinc-800 bg-[#0f0f0f] p-5 md:flex-row md:items-center md:gap-6">
      <div className="flex items-center gap-4">
        <div className="font-pitch text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600">
          Fan Status
        </div>
        <div
          className="font-scoreboard text-2xl font-bold tabular-nums text-[oklch(0.7_0.18_145)]"
          style={{ filter: "drop-shadow(0 0 6px oklch(0.7 0.18 145 / 0.45))" }}
        >
          LVL {s.fanLevel}
        </div>
      </div>

      <div className="flex-1">
        <div className="mb-2 flex items-center justify-between font-scoreboard text-[10px] font-bold tracking-[0.2em] text-zinc-500">
          <span>Qualification Phase</span>
          <span className="text-[oklch(0.7_0.18_145)]">{s.qualificationPercent}% to Finals</span>
        </div>
        <div className="relative h-3 overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
          <div
            className="relative h-full bg-[oklch(0.7_0.18_145)]"
            style={{
              width: `${s.qualificationPercent}%`,
              boxShadow: "0 0 15px oklch(0.7 0.18 145 / 0.7)",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-y-0 w-1/3 animate-scoreboard-sweep"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {followed.map((code) => (
          <span
            key={code}
            className="grid h-8 w-10 place-items-center rounded border border-zinc-700 bg-zinc-900 font-scoreboard text-[10px] font-bold text-white"
          >
            {code}
          </span>
        ))}
        {extra > 0 && (
          <span className="grid h-8 w-10 place-items-center rounded border border-zinc-700 bg-zinc-900 font-scoreboard text-[10px] font-bold text-zinc-500">
            +{extra}
          </span>
        )}
      </div>
    </div>
  );
}