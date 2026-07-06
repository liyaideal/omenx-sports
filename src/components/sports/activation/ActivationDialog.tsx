import * as React from "react";
import { X, Trophy, Ticket, Wallet, Clock, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export type ActivationVariant = "reward-pool" | "voucher" | "deposit-match";

export interface ActivationDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  variant: ActivationVariant;
  /** Big title, e.g. "3M Reward Pool Live". */
  title: string;
  /** One-line supporting copy under the title. */
  subtitle: string;
  /** Primary CTA label. */
  ctaLabel: string;
  /** Fired when the primary CTA is clicked. Dialog does NOT auto-close — the
   *  caller decides (usually keep it closed while opening a follow-up flow). */
  onCta: () => void;
  /** Optional dismiss link under the CTA. Defaults to "Maybe later". */
  secondaryLabel?: string;
  /** Optional analytics kicker (uppercase eyebrow). Defaults per variant. */
  eyebrow?: string;
}

/**
 * User-activation modal. Shared shell for the 3 activation surfaces
 * (reward-pool live · voucher ready · deposit match). Renders as a
 * center Dialog on md+ and as a bottom Sheet on mobile per project
 * rule (`mem://rules/mobile-bottom-sheet`).
 */
export function ActivationDialog(props: ActivationDialogProps) {
  const isMobile = useIsMobile();
  const { open, onOpenChange } = props;

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-t border-border bg-surface p-0 [&>button]:hidden"
        >
          <SheetTitle className="sr-only">{props.title}</SheetTitle>
          <SheetDescription className="sr-only">{props.subtitle}</SheetDescription>
          <ActivationBody {...props} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(94vw,26rem)] max-w-none overflow-hidden rounded-3xl border border-border bg-surface p-0 [&>button]:hidden">
        <DialogTitle className="sr-only">{props.title}</DialogTitle>
        <DialogDescription className="sr-only">{props.subtitle}</DialogDescription>
        <ActivationBody {...props} />
      </DialogContent>
    </Dialog>
  );
}

function ActivationBody({
  variant,
  title,
  subtitle,
  ctaLabel,
  onCta,
  onOpenChange,
  secondaryLabel = "Maybe later",
  eyebrow,
}: ActivationDialogProps) {
  const preset = VARIANT_PRESETS[variant];
  const Icon = preset.icon;
  const badgeLabel = eyebrow ?? preset.eyebrow;

  return (
    <div className="relative overflow-hidden">
      {/* Ambient halo — themed per variant, kept within brand tokens. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 -top-24 h-56 opacity-70 blur-3xl",
          preset.haloClass,
        )}
      />
      <button
        type="button"
        aria-label="Close"
        onClick={() => onOpenChange(false)}
        className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/[0.06] text-muted-foreground ring-1 ring-white/10 transition hover:text-foreground hover:ring-white/25"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="relative flex flex-col items-center px-6 pb-6 pt-8 text-center">
        {/* Icon well */}
        <div className="relative">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-neon shadow-glow ring-1 ring-white/15">
            <Icon className="h-7 w-7 text-white" strokeWidth={2.25} />
          </div>
          <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-surface ring-1 ring-white/20">
            <Sparkles className="h-3 w-3 text-neon" />
          </span>
        </div>

        {/* Eyebrow */}
        <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {preset.eyebrowIcon}
          {badgeLabel}
        </span>

        {/* Title */}
        <h3 className="mt-3 font-pitch text-2xl font-bold uppercase leading-tight tracking-wide text-foreground">
          {title}
        </h3>

        {/* Subtitle */}
        <p className="mt-2 max-w-[280px] text-sm text-muted-foreground">
          {subtitle}
        </p>

        {/* Highlight strip (variant specific) */}
        {preset.highlight && (
          <div className="mt-4 w-full rounded-2xl border border-border bg-background/60 px-4 py-3">
            {preset.highlight}
          </div>
        )}

        {/* Primary CTA */}
        <button
          type="button"
          onClick={onCta}
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-neon px-6 font-pitch text-sm font-bold uppercase tracking-[0.18em] text-white shadow-glow transition hover:opacity-95 active:opacity-90"
        >
          {ctaLabel}
        </button>

        {/* Secondary dismiss */}
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="mt-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground transition hover:text-foreground"
        >
          {secondaryLabel}
        </button>
      </div>
    </div>
  );
}

/** Per-variant theming — icon, eyebrow copy, ambient halo, optional highlight row. */
const VARIANT_PRESETS: Record<
  ActivationVariant,
  {
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    eyebrow: string;
    eyebrowIcon: React.ReactNode;
    haloClass: string;
    highlight?: React.ReactNode;
  }
> = {
  "reward-pool": {
    icon: Trophy,
    eyebrow: "New users · limited",
    eyebrowIcon: <span className="h-1.5 w-1.5 rounded-full bg-neon shadow-[0_0_8px_var(--neon)]" />,
    haloClass:
      "bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.7_0.28_340/0.55),transparent_70%)]",
    highlight: (
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Pool live
        </span>
        <span className="font-scoreboard text-lg font-bold tracking-[0.15em] text-foreground">
          3,000,000 <span className="text-neon">U</span>
        </span>
      </div>
    ),
  },
  voucher: {
    icon: Ticket,
    eyebrow: "24h window",
    eyebrowIcon: <Clock className="h-3 w-3 text-[color:oklch(0.85_0.17_85)]" />,
    haloClass:
      "bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.85_0.17_85/0.45),transparent_70%)]",
    highlight: (
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Position voucher
        </span>
        <span className="font-scoreboard text-lg font-bold tracking-[0.15em] text-[color:oklch(0.85_0.17_85)]">
          10 U
        </span>
      </div>
    ),
  },
  "deposit-match": {
    icon: Wallet,
    eyebrow: "500 spots · daily",
    eyebrowIcon: <span className="h-1.5 w-1.5 rounded-full bg-win shadow-[0_0_8px_var(--win)]" />,
    haloClass:
      "bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.78_0.18_155/0.45),transparent_70%)]",
    highlight: (
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          You deposit → you get
        </span>
        <span className="font-scoreboard text-lg font-bold tracking-[0.15em] text-foreground">
          20 U <span className="text-muted-foreground">+</span>{" "}
          <span className="text-win">20 U</span>
        </span>
      </div>
    ),
  },
};