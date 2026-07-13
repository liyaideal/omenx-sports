import { useMemo } from "react";
import { ExternalLink, Loader2, LogIn } from "lucide-react";
import {
  useLiveMarkPrices,
  useOpenPositions,
} from "@/lib/demoEngineEvents";
import { useDemoAuth } from "@/hooks/useDemoAuth";
import { omenxUrl } from "@/lib/omenx";
import { cn } from "@/lib/utils";

/**
 * Live open-positions strip — reads the OmenX main-site `positions` table
 * for the currently signed-in demo user and reprices via realtime
 * `event_options` prices. Rendered inside the mobile Me sheet, the Fans
 * page, and the style-guide playground.
 */
export function LivePositionsCard({
  className,
  onSignIn,
}: {
  className?: string;
  onSignIn?: () => void;
}) {
  const auth = useDemoAuth();
  const { loading, positions, error } = useOpenPositions(auth.user?.id ?? null);
  const optionIds = useMemo(
    () =>
      positions
        .map((p) => p.option_id)
        .filter((id): id is string => !!id),
    [positions],
  );
  const marks = useLiveMarkPrices(optionIds);

  if (!auth.user) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-primary/25 bg-primary/[0.04] p-5 text-center",
          className,
        )}
      >
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-primary">
          <LogIn className="h-4 w-4" />
        </div>
        <div className="mt-3 font-display text-sm font-semibold text-foreground">
          Sign in to see live positions
        </div>
        <p className="mx-auto mt-1 max-w-xs text-[11px] leading-snug text-muted-foreground">
          Open positions live on the OmenX main-site demo engine and appear
          here + in Portfolio ↗.
        </p>
        {onSignIn && (
          <button
            type="button"
            onClick={onSignIn}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary/20 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-primary hover:bg-primary/30"
          >
            <LogIn className="h-3 w-3" /> Continue with Google
          </button>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center gap-2 rounded-2xl border border-border bg-white/[0.02] p-5 text-[11px] text-muted-foreground",
          className,
        )}
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading positions…
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-loss/30 bg-loss/5 p-4 text-[11px] text-loss",
          className,
        )}
      >
        {error}
      </div>
    );
  }

  if (!positions.length) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border bg-white/[0.02] p-5 text-center",
          className,
        )}
      >
        <div className="font-display text-sm text-foreground">
          No open positions
        </div>
        <p className="mx-auto mt-1 max-w-xs text-[11px] leading-snug text-muted-foreground">
          Place a market order on a mapped World Cup semifinal to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {positions.map((p) => {
        const mark = p.option_id ? marks[p.option_id] ?? p.mark_price : p.mark_price;
        const pnl = (Number(mark) - Number(p.entry_price)) * Number(p.size);
        const pnlUp = pnl >= 0;
        return (
          <div
            key={p.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white/[0.03] px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-sm font-semibold text-foreground">
                {p.event_name}
              </div>
              <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <span>{p.option_label}</span>
                <span>·</span>
                <span>
                  {Math.round(Number(p.entry_price) * 100)}¢ →{" "}
                  <span className="text-foreground">
                    {Math.round(Number(mark) * 100)}¢
                  </span>
                </span>
                <span>·</span>
                <span>{Number(p.size).toFixed(1)} contracts</span>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div
                className={cn(
                  "font-mono text-sm font-semibold tabular-nums",
                  pnlUp ? "text-win" : "text-loss",
                )}
              >
                {pnlUp ? "+" : ""}
                {pnl.toFixed(2)}
              </div>
              <a
                href={omenxUrl.portfolio()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                OmenX <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}