import { Flag, Heart, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import type { TeamLite } from "@/data/sports-mock";

interface FanPollCardProps {
  authorAvatar: string;
  authorName: string;
  authorHandle: string;
  question: string;
  home: TeamLite;
  away: TeamLite;
  whenLabel: string;
  kickoff: string;
  votes: { home: number; away: number };
  reactions: { likes: number; comments: number; shares: number; flags: number };
  marketHref: string;
}

export function FanPollCard({
  authorAvatar,
  authorName,
  authorHandle,
  question,
  home,
  away,
  whenLabel,
  kickoff,
  votes,
  reactions,
  marketHref,
}: FanPollCardProps) {
  const total = votes.home + votes.away || 1;
  const homePct = Math.round((votes.home / total) * 100);
  const awayPct = 100 - homePct;
  return (
    <article className="relative overflow-hidden rounded-3xl border border-border bg-surface p-5 shadow-card">
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(60%_100%_at_50%_100%,oklch(0.7_0.28_340/0.18),transparent_70%)]" />
      <header className="relative flex items-center gap-3">
        <img src={authorAvatar} alt={authorName} className="h-10 w-10 rounded-full object-contain bg-white/5 p-1 ring-2 ring-white/10" />
        <div className="flex-1 leading-tight">
          <div className="text-sm font-semibold text-foreground">{authorName}</div>
          <div className="font-mono text-[11px] text-muted-foreground">{authorHandle}</div>
        </div>
        <button aria-label="More" className="text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </header>

      <h3 className="relative mt-4 font-display text-lg font-semibold text-foreground">{question}</h3>

      <div className="relative mt-5 flex items-center justify-center gap-4">
        <CrestBubble team={home} />
        <div className="flex flex-col items-center gap-1">
          <span className="font-serif-display italic text-xl text-muted-foreground">vs</span>
          <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {whenLabel}<br />at {kickoff}
          </span>
        </div>
        <CrestBubble team={away} />
      </div>

      <a href={marketHref} className="relative mt-5 block space-y-2.5">
        <VoteBar team={home} pct={homePct} count={votes.home} from="oklch(0.65 0.2 250)" to="oklch(0.82 0.15 270)" />
        <VoteBar team={away} pct={awayPct} count={votes.away} from="oklch(0.78 0.13 300)" to="oklch(0.7 0.22 330)" />
      </a>

      <footer className="relative mt-5 flex items-center justify-between text-[12px] font-mono text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5"><Heart className="h-3.5 w-3.5" /> {reactions.likes}</span>
          <span className="inline-flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5" /> {reactions.comments}</span>
          <span className="inline-flex items-center gap-1.5"><Send className="h-3.5 w-3.5" /> {reactions.shares}</span>
        </div>
        <span className="inline-flex items-center gap-1.5"><Flag className="h-3.5 w-3.5" /> {reactions.flags}</span>
      </footer>
    </article>
  );
}

function CrestBubble({ team }: { team: TeamLite }) {
  return (
    <div
      className="grid h-20 w-20 place-items-center rounded-full bg-white/[0.05] p-2 ring-1 ring-white/10"
      style={{ boxShadow: `0 0 30px -6px oklch(0.7 0.22 ${team.hue} / 0.55)` }}
    >
      <img src={team.logo} alt={team.name} className="h-full w-full object-contain" />
    </div>
  );
}

function VoteBar({
  team,
  pct,
  count,
  from,
  to,
}: {
  team: TeamLite;
  pct: number;
  count: number;
  from: string;
  to: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <img src={team.logo} alt="" className="h-5 w-5 shrink-0 object-contain" />
      <div className="relative h-7 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${Math.max(pct, 8)}%`,
            backgroundImage: `linear-gradient(90deg, ${from}, ${to})`,
          }}
        />
      </div>
      <div className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground">
        <span className="grid h-4 w-4 place-items-center rounded-sm bg-white/10">●</span>
        {count}
      </div>
    </div>
  );
}
