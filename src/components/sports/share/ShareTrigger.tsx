import { ArrowUpRight, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useShare } from "./ShareProvider";
import type { ShareTarget } from "./share-targets";

export type ShareTriggerVariant = "icon" | "chip" | "wide" | "ghost";
export type ShareTriggerAccent = "default" | "amber";
export type ShareTriggerSize = "md" | "sm";

export interface ShareTriggerProps {
  target: ShareTarget;
  variant?: ShareTriggerVariant;
  label?: string;
  className?: string;
  ariaLabel?: string;
  /** Wide-variant only: color scheme. Default keeps the neutral primary look. */
  accent?: ShareTriggerAccent;
  /** Wide-variant only: vertical padding. `md` = py-4 (default), `sm` = py-3. */
  size?: ShareTriggerSize;
}

/** Declarative trigger — drop it next to any shareable surface. */
export function ShareTrigger({
  target,
  variant = "icon",
  label,
  className,
  ariaLabel,
  accent = "default",
  size = "md",
}: ShareTriggerProps) {
  const { share } = useShare();
  const open = () => share(target);
  const a11y = ariaLabel ?? label ?? "Share";

  if (variant === "wide") {
    const wideLabel = label ?? "Share";
    const isAmber = accent === "amber";
    const padY = size === "sm" ? "py-3" : "py-4";
    return (
      <button
        type="button"
        onClick={open}
        aria-label={a11y}
        className={cn(
          "group flex w-full items-center justify-center gap-4 rounded-2xl border transition-all duration-300 active:scale-[0.98]",
          padY,
          isAmber
            ? "border-amber-400/70 bg-amber-400/10 hover:border-amber-400 hover:bg-amber-400/15"
            : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.06]",
          className,
        )}
      >
        <span
          className={cn(
            "font-mono text-[11px] font-bold uppercase tracking-[0.25em] transition-colors",
            isAmber
              ? "text-amber-300 group-hover:text-amber-200"
              : "text-muted-foreground group-hover:text-foreground",
          )}
        >
          {wideLabel}
        </span>
        <span
          className={cn(
            "grid h-6 w-6 place-items-center rounded-lg transition-colors",
            isAmber ? "bg-amber-400/20 group-hover:bg-amber-400/30" : "bg-primary/10 group-hover:bg-primary/20",
          )}
        >
          <ArrowUpRight
            className={cn(
              "h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
              isAmber ? "text-amber-300" : "text-primary",
            )}
          />
        </span>
      </button>
    );
  }

  if (variant === "chip") {
    return (
      <button
        type="button"
        onClick={open}
        aria-label={a11y}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 font-pitch text-[10px] font-bold uppercase tracking-widest text-zinc-300 transition hover:border-amber-400/60 hover:text-amber-400",
          className,
        )}
      >
        <Share2 className="h-3 w-3" />
        {label ?? "Share"}
      </button>
    );
  }

  if (variant === "ghost") {
    return (
      <button
        type="button"
        onClick={open}
        aria-label={a11y}
        className={cn(
          "inline-grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:bg-white/5 hover:text-foreground",
          className,
        )}
      >
        <Share2 className="h-3.5 w-3.5" />
      </button>
    );
  }

  // icon (default)
  return (
    <button
      type="button"
      onClick={open}
      aria-label={a11y}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-foreground ring-1 ring-white/10 transition hover:bg-white/[0.1]",
        className,
      )}
    >
      <Share2 className="h-3.5 w-3.5" />
      {label ?? "Share"}
    </button>
  );
}