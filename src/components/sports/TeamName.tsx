import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TeamNameProps {
  /** Short code rendered as visible text, e.g. "MCI". */
  short: string;
  /** Full team name shown in the hover tooltip / mobile toast. */
  full: string;
  className?: string;
  /** Optional override for tooltip side. */
  side?: "top" | "bottom" | "left" | "right";
}

/**
 * Short team code with a desktop hover tooltip + mobile tap-to-toast that
 * reveal the full team name. Use anywhere a `team.short` is rendered as
 * standalone text. Stops click propagation so taps inside a clickable card
 * don't trigger the card's navigation.
 */
export function TeamName({ short, full, className, side = "top" }: TeamNameProps) {
  const same = short.trim().toLowerCase() === full.trim().toLowerCase();
  const handleClick = (e: React.MouseEvent) => {
    if (same) return;
    e.preventDefault();
    e.stopPropagation();
    toast(full);
  };

  const trigger = (
    <span
      role={same ? undefined : "button"}
      tabIndex={same ? undefined : 0}
      aria-label={same ? undefined : full}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (same) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          toast(full);
        }
      }}
      className={cn(
        "cursor-help underline decoration-dotted decoration-muted-foreground/30 decoration-from-font underline-offset-[3px] outline-none focus-visible:ring-1 focus-visible:ring-foreground/40 rounded-sm",
        same && "cursor-inherit no-underline",
        className,
      )}
    >
      {short}
    </span>
  );

  if (same) return trigger;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent side={side}>{full}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}