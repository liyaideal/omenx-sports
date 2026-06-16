import { ArrowUpRight, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useShare } from "./ShareProvider";
import type { ShareTarget } from "./share-targets";

export type ShareTriggerVariant = "icon" | "chip" | "wide" | "ghost";

export interface ShareTriggerProps {
  target: ShareTarget;
  variant?: ShareTriggerVariant;
  label?: string;
  className?: string;
  ariaLabel?: string;
}

/** Declarative trigger — drop it next to any shareable surface. */
export function ShareTrigger({
  target,
  variant = "icon",
  label,
  className,
  ariaLabel,
}: ShareTriggerProps) {
  const { share } = useShare();
  const open = () => share(target);
  const a11y = ariaLabel ?? label ?? "Share";

  if (variant === "wide") {
    const wideLabel = label ?? "Share";
    return (
      <button
        type="button"
        onClick={open}
        aria-label={a11y}
        className={cn(
          "group flex w-full items-center justify-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] py-4 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.06] active:scale-[0.98]",
          className,
        )}
      >
        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.25em] text-muted-foreground transition-colors group-hover:text-foreground">
          {wideLabel}
        </span>
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
          <ArrowUpRight className="h-3.5 w-3.5 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
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