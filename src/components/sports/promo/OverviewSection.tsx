import { Link } from "@tanstack/react-router";
import {
  CARNIVAL_TABS,
  type CarnivalTab,
} from "@/data/world-cup-carnival";
import { ScoreboardTicker } from "./ScoreboardTicker";
import { ConfettiLayer } from "./ConfettiLayer";
import welcomeAsset from "@/assets/carnival/card-welcome-v2.jpg.asset.json";
import comboAsset from "@/assets/carnival/card-combo-v2.jpg.asset.json";
import luckyboxAsset from "@/assets/carnival/card-luckybox-v2.jpg.asset.json";

interface SeriesEntry {
  tab: CarnivalTab;
  sec: string;
  title: string;
  highlight: string;
  body: string;
  accent: string; // OKLCH or hex
  banner: string;
}

const SERIES: SeriesEntry[] = [
  {
    tab: "newbie",
    sec: "SEC-01",
    title: "Welcome Pack",
    highlight: "Up to 560 U",
    body: "Register, deposit, trade & invite to stack position vouchers.",
    accent: "oklch(0.7 0.18 145)",
    banner: welcomeAsset.url,
  },
  {
    tab: "combo",
    sec: "SEC-02",
    title: "Combo Challenge",
    highlight: "10 U → 500 U",
    body: "Pick 4 World Cup outcomes. Land all 4 to win up to 50× your stake.",
    accent: "#facc15",
    banner: comboAsset.url,
  },
  {
    tab: "luckybox",
    sec: "SEC-03",
    title: "Lucky Box",
    highlight: "Signed Jersey",
    body: "Hit daily volume to roll the trophy vault. Grand prize: signed kit.",
    accent: "#60a5fa",
    banner: luckyboxAsset.url,
  },
];

export function OverviewSection() {
  return (
    <div className="relative flex flex-col gap-6">
      <ConfettiLayer count={20} className="z-0" />

      <div className="relative z-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        {SERIES.map((s) => (
          <SeriesCard key={s.tab} entry={s} />
        ))}
      </div>

      <div className="relative z-10">
        <ScoreboardTicker />
      </div>
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
      className="group relative flex flex-col overflow-hidden border-2 border-zinc-800 bg-[#0a0a0a] transition-colors hover:border-[color:var(--card-accent)]"
      style={{ ["--card-accent" as string]: entry.accent }}
      aria-label={`Open ${label}`}
    >
      {/* Top banner — AI art, fades to black at the bottom for legibility. */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={entry.banner}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 60%, #0a0a0a 100%)",
          }}
        />
        <div aria-hidden className="absolute inset-0 bg-led-matrix opacity-20 mix-blend-overlay" />
        <span className="absolute bottom-2 left-3 font-scoreboard text-[10px] font-bold tracking-[0.25em] text-zinc-300">
          {entry.sec}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col p-5">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-led-matrix opacity-[0.06]" />
        <h3 className="relative font-pitch text-xl font-bold uppercase tracking-wide text-white transition-colors group-hover:text-[color:var(--card-accent)]">
          {entry.title}
        </h3>
        <div className="relative mt-1 font-scoreboard text-lg font-black italic tabular-nums text-[color:var(--card-accent)]">
          {entry.highlight}
        </div>
        <p className="relative mt-3 text-sm text-zinc-400">{entry.body}</p>

        <div className="relative mt-5 inline-flex items-center gap-2 font-pitch text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 transition-colors group-hover:text-[color:var(--card-accent)]">
          Enter section →
        </div>
      </div>
      <span
        aria-hidden
        className="relative block h-1 bg-zinc-800 transition-all group-hover:bg-[color:var(--card-accent)] group-hover:shadow-[0_0_12px_var(--card-accent)]"
      />
    </Link>
  );
}