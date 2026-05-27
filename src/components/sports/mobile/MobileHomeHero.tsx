import { Sparkles } from "lucide-react";

/**
 * Mobile home greeting card — the first content block under MobileTopBar.
 * Pure presentational, no avatar (MobileTopBar already shows it).
 */
export function MobileHomeHero({
  userName,
  equity,
}: {
  userName: string;
  equity: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-surface to-surface p-5 shadow-card">
      <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <Sparkles className="h-3 w-3 text-primary" />
        Welcome back
      </div>
      <h1 className="mt-1 font-display text-2xl font-semibold leading-9">
        Hi,
        <span className="font-serif-display italic text-neon"> {userName}</span>
      </h1>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Available equity
        </span>
        <span className="font-display text-xl font-semibold tabular-nums text-foreground">
          {equity}
        </span>
      </div>
    </section>
  );
}