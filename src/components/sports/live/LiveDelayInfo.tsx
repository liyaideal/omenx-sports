import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Variant = "score" | "stream";
type Tone = "muted" | "onMedia";
type Size = "xs" | "sm";

interface LiveDelayInfoProps {
  variant?: Variant;
  /** `muted` for in-content chips, `onMedia` for chips over video/poster. */
  tone?: Tone;
  size?: Size;
  className?: string;
}

/**
 * Shared "ⓘ" affordance attached to any LIVE chip / video surface.
 * Clicking opens a small popover explaining that live video and scores
 * are subject to a 30–60s delay and should be treated as reference only.
 *
 * Inspired by Polymarket's `• HT ⓘ` pattern — the icon is the entire
 * disclosure; we never push long disclaimer copy into the visible UI.
 */
export function LiveDelayInfo({
  variant = "score",
  tone = "muted",
  size = "xs",
  className,
}: LiveDelayInfoProps) {
  const iconCls =
    size === "sm" ? "h-3.5 w-3.5" : "h-3 w-3";
  const triggerCls =
    tone === "onMedia"
      ? "text-white/60 hover:text-white"
      : "text-muted-foreground hover:text-foreground";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="About live data delay"
          onClick={(e) => {
            // Don't bubble up into surrounding clickable chips / cards.
            e.stopPropagation();
          }}
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full transition",
            triggerCls,
            className,
          )}
        >
          <Info className={iconCls} />
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
          About live data
        </div>
        {variant === "stream" ? (
          <p>
            The live stream may be delayed by{" "}
            <span className="text-foreground">30–60 seconds</span> compared to
            the venue. Use it for reference only — settled outcomes are based
            on official sources.
          </p>
        ) : (
          <p>
            Live scores and match time shown here may lag the venue by{" "}
            <span className="text-foreground">30–60 seconds</span>. They are
            indicative — settlement always uses the official result.
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}