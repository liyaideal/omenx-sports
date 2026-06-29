import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { SportsMarket } from "@/data/sports-markets";

export const REGULATION_TIME_NOTICE =
  "This market resolves based solely on the result at the end of regulation time (90 minutes plus stoppage time). Extra time and penalty shootouts are not counted.";

/**
 * True iff the market's resolution is scoped to regulation time only —
 * i.e. a soccer match-result (1X2 or two-way). Futures, top-scorer and
 * player-prop markets are unaffected.
 */
export function marketUsesRegulationTimeResolution(market: SportsMarket): boolean {
  return market.kind === "match";
}

interface RegulationTimeNoticeProps {
  /** `inline` = full-width subtle banner. `tooltip` = ⓘ icon w/ popover. */
  variant?: "inline" | "tooltip";
  className?: string;
  /** Tooltip-only: tone of the ⓘ trigger. */
  tone?: "muted" | "onMedia";
}

/**
 * Soccer resolution-rule disclosure. Two surfaces:
 *
 * - `inline` — sits on the event trade page above the chart/outcomes. Neutral
 *   styling (border + muted text); this is informational, not a warning.
 * - `tooltip` — compact ⓘ icon for dense card surfaces (Games-tab cards).
 *   Click reveals the full sentence in a popover.
 */
export function RegulationTimeNotice({
  variant = "inline",
  className,
  tone = "muted",
}: RegulationTimeNoticeProps) {
  if (variant === "tooltip") {
    const triggerCls =
      tone === "onMedia"
        ? "text-white/60 hover:text-white"
        : "text-muted-foreground hover:text-foreground";
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="About settlement rules"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className={cn(
              "inline-flex shrink-0 items-center justify-center rounded-full transition",
              triggerCls,
              className,
            )}
          >
            <Info className="h-3 w-3" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="center"
          sideOffset={6}
          className="z-[80] w-72 border-border bg-background/95 p-4 text-xs leading-relaxed text-muted-foreground shadow-2xl backdrop-blur"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-foreground">
            Settlement · regulation time
          </div>
          <p>{REGULATION_TIME_NOTICE}</p>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border border-border bg-white/[0.02] px-3.5 py-2.5 text-[12px] leading-relaxed text-muted-foreground",
        className,
      )}
    >
      <Info className="mt-[2px] h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span>
        <span className="mr-1.5 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">
          Regulation time only
        </span>
        {REGULATION_TIME_NOTICE}
      </span>
    </div>
  );
}