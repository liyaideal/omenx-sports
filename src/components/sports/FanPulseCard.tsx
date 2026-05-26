import { ArrowRight, MessageCircle, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamCrest } from "./TeamCrest";
import type { Team } from "@/lib/teams";

export interface FanPulseCardProps {
  question: string;
  home: Team;
  away: Team;
  /** Crowd vote share, 0–100, for the HOME side. */
  homePct: number;
  totalVotes: number;
  likes: number;
  comments: number;
  /** Where the Vote buttons take you (the underlying market). */
  href: string;
  className?: string;
}

/**
 * Crowd sentiment poll card. Not the order-book sentiment (that's
 * SentimentCard) — this is the social "who do you think will win" pulse,
 * displayed as two side-by-side vote bars in team colors.
 */
export function FanPulseCard({
  question,
  home,
  away,
  homePct,
  totalVotes,
  likes,
  comments,
  href,
  className,
}: FanPulseCardProps) {
  const awayPct = 100 - homePct;
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-2xl border border-border bg-surface p-4 shadow-card",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-neon">
          Fan Pulse
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {totalVotes.toLocaleString()} votes
        </span>
      </div>

      <h3 className="mt-2 font-display font-semibold text-sm leading-snug text-foreground">
        {question}
      </h3>

      <div className="mt-3 flex items-center justify-around">
        <TeamCrest name={home.name} abbr={home.short} logoUrl={home.logo} size="md" />
        <span className="font-serif-display italic text-base text-muted-foreground">vs</span>
        <TeamCrest name={away.name} abbr={away.short} logoUrl={away.logo} size="md" />
      </div>

      <div className="mt-3 space-y-1.5">
        <a
          href={href}
          className="group flex items-center gap-2"
          aria-label={`Vote ${home.short}`}
        >
          <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] group-hover:bg-primary/90"
              style={{ width: `${homePct}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-right font-mono text-[11px] tabular-nums text-primary">
            {homePct}%
          </span>
        </a>
        <a
          href={href}
          className="group flex items-center gap-2"
          aria-label={`Vote ${away.short}`}
        >
          <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-neon transition-[width] group-hover:bg-neon/90"
              style={{ width: `${awayPct}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-right font-mono text-[11px] tabular-nums text-neon">
            {awayPct}%
          </span>
        </a>
      </div>

      <div className="mt-auto flex items-center justify-between pt-3 text-[11px] font-mono text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3" /> {likes}</span>
          <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {comments}</span>
        </div>
        <a
          href={href}
          className="inline-flex items-center gap-1 text-neon hover:opacity-80"
        >
          Trade <ArrowRight className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}