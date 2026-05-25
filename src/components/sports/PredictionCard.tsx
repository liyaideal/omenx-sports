import { Heart, MessageCircle, Send, Flag, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamCrest } from "./TeamCrest";
import { VoteBar } from "./VoteBar";

export interface PredictionCardProps {
  author: { name: string; handle: string };
  question: string;
  home: string;
  away: string;
  kickoff: string;
  votes: { home: number; away: number };
  metrics?: { likes: number; comments: number; shares: number; flags: number };
  className?: string;
}

export function PredictionCard({
  author,
  question,
  home,
  away,
  kickoff,
  votes,
  metrics = { likes: 78, comments: 35, shares: 32, flags: 32 },
  className,
}: PredictionCardProps) {
  const total = votes.home + votes.away || 1;
  const homePct = Math.round((votes.home / total) * 100);
  const awayPct = 100 - homePct;
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-card",
        className,
      )}
    >
      {/* author */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <TeamCrest name={author.name} size="sm" />
          <div className="leading-tight">
            <div className="text-sm font-semibold text-foreground">{author.name}</div>
            <div className="text-[11px] text-muted-foreground font-mono">@{author.handle}</div>
          </div>
        </div>
        <button className="rounded-full p-1.5 text-muted-foreground hover:bg-white/5 hover:text-foreground" aria-label="More">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      <h3 className="mt-4 text-base font-display font-semibold text-foreground">{question}</h3>

      {/* matchup */}
      <div className="mt-5 flex items-center justify-center gap-6">
        <TeamCrest name={home} size="xl" />
        <div className="text-center">
          <div className="font-serif-display italic text-2xl text-muted-foreground">vs</div>
          <div className="mt-1 inline-block rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-mono text-muted-foreground tracking-wider">
            {kickoff}
          </div>
        </div>
        <TeamCrest name={away} size="xl" />
      </div>

      {/* votes */}
      <div className="mt-6 space-y-2.5">
        <VoteBar tone="blue" value={homePct} count={votes.home} />
        <VoteBar tone="primary" value={awayPct} count={votes.away} />
      </div>

      {/* metrics */}
      <div className="mt-5 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5"><Heart className="h-3.5 w-3.5" /><span className="font-mono">{metrics.likes}</span></div>
        <div className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5" /><span className="font-mono">{metrics.comments}</span></div>
        <div className="flex items-center gap-1.5"><Send className="h-3.5 w-3.5" /><span className="font-mono">{metrics.shares}</span></div>
        <div className="flex items-center gap-1.5"><Flag className="h-3.5 w-3.5" /><span className="font-mono">{metrics.flags}</span></div>
      </div>
    </div>
  );
}