import * as React from "react";
import { X, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export type ActivationVariant = "reward-pool" | "voucher" | "deposit-match";

export interface ActivationDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  variant: ActivationVariant;
  /** Big title, e.g. "3M Reward Pool Live". The first token (up to the first
   *  space) is rendered in the variant's accent color per Figma. */
  title: string;
  /** One-line supporting copy under the title. */
  subtitle: string;
  /** Primary CTA label. */
  ctaLabel: string;
  /** Fired when the primary CTA is clicked. Dialog does NOT auto-close. */
  onCta: () => void;
  /** Optional analytics kicker (uppercase eyebrow). Defaults per variant. */
  eyebrow?: string;
}

/**
 * User-activation modal — Figma spec.
 * Center Dialog on md+ (420×380, carnival CTA, amber accent word).
 * Bottom Sheet on mobile (390×448, neon CTA, green accent word).
 * Both share the same hero-image + eyebrow + title + subtitle + CTA structure.
 *
 * Hero illustrations live in `HERO_IMAGES` below. Swap in the exported PNGs
 * (desktop 420×148, mobile 390×172) via `.asset.json` pointers.
 */
export function ActivationDialog(props: ActivationDialogProps) {
  const isMobile = useIsMobile();
  const { open, onOpenChange } = props;

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-t border-border bg-[#161023] p-0 [&>button]:hidden"
        >
          <SheetTitle className="sr-only">{props.title}</SheetTitle>
          <SheetDescription className="sr-only">{props.subtitle}</SheetDescription>
          <ActivationBody {...props} device="mobile" />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[420px] max-w-[94vw] overflow-hidden rounded-[14px] border border-[#382b53] bg-[#161023] p-0 [&>button]:hidden">
        <DialogTitle className="sr-only">{props.title}</DialogTitle>
        <DialogDescription className="sr-only">{props.subtitle}</DialogDescription>
        <ActivationBody {...props} device="desktop" />
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
  eyebrow,
  device,
}: ActivationDialogProps & { device: "desktop" | "mobile" }) {
  const preset = VARIANT_PRESETS[variant];
  const badgeLabel = eyebrow ?? preset.eyebrow;

  // Split title so the first word can render in the accent color per Figma
  // (desktop: amber, mobile: neon-green). "Deposit 20U, Get 20U" is a special
  // case where the highlighted word is at the end — override via `preset.
  // accentMatch` when set.
  const accentText = preset.accentMatch ?? title.split(" ")[0];
  const idx = title.indexOf(accentText);
  const before = idx >= 0 ? title.slice(0, idx) : "";
  const after = idx >= 0 ? title.slice(idx + accentText.length) : title;
  const accentColor = device === "desktop" ? "text-[#F5BA38]" : "text-neon";
  const eyebrowIcon = device === "desktop" ? preset.eyebrowIcon.desktop : preset.eyebrowIcon.mobile;
  const ctaClass =
    device === "desktop"
      ? "bg-gradient-carnival"
      : "bg-gradient-neon";

  const heroSrc = HERO_IMAGES[variant][device];

  return (
    <div className="relative overflow-hidden">
      {/* Hero image — swap `HERO_IMAGES` entries with the Figma PNG exports. */}
      <div
        className={cn(
          "relative w-full overflow-hidden",
          device === "desktop" ? "h-[148px]" : "h-[172px] rounded-t-3xl",
        )}
      >
        {heroSrc ? (
          <img
            src={heroSrc}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            aria-hidden
            className={cn(
              "absolute inset-0",
              device === "desktop"
                ? preset.placeholderDesktop
                : preset.placeholderMobile,
            )}
          />
        )}
        {/* Alpha fade to card bg — matches Figma mask. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-b from-transparent to-[#161023]"
        />
        {/* Close */}
        <button
          type="button"
          aria-label="Close"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 z-10 grid h-7 w-7 place-items-center rounded-md bg-black/40 text-white/80 ring-1 ring-white/10 backdrop-blur transition hover:text-white hover:ring-white/25"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2.25} />
        </button>
        {/* Mobile grabber */}
        {device === "mobile" && (
          <div
            aria-hidden
            className="absolute left-1/2 top-[10px] h-1 w-9 -translate-x-1/2 rounded-full bg-white/25"
          />
        )}
      </div>

      {/* Content block — 32px padding per Figma */}
      <div className="flex flex-col gap-4 px-8 pb-8 pt-4">
        {/* Eyebrow pill */}
        <span className="inline-flex h-[26px] items-center gap-1.5 self-start rounded-full border border-white/5 bg-white/[0.05] px-3 font-sans text-[12px] font-medium uppercase tracking-wide text-[#9697A8]">
          {eyebrowIcon}
          {badgeLabel}
        </span>

        {/* Title — Jersey 25, accent word colored */}
        <h3
          className={cn(
            "font-jersey leading-none text-white",
            device === "desktop" ? "text-[42px]" : "text-[38px] uppercase",
          )}
        >
          {before && <span>{before}</span>}
          <span className={accentColor}>{accentText}</span>
          {after && <span>{after}</span>}
        </h3>

        {/* Subtitle */}
        <p className="font-sans text-[14px] leading-snug text-[#9697A8]">
          {subtitle}
        </p>

        {/* CTA */}
        <button
          type="button"
          onClick={onCta}
          className={cn(
            "mt-2 inline-flex h-[46px] w-full items-center justify-center rounded-full font-jersey text-[24px] leading-none text-[#F7F8F8] transition hover:opacity-95 active:opacity-90",
            ctaClass,
          )}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}

/** Per-variant theming — eyebrow copy/icon, title accent override, hero placeholder gradient. */
const VARIANT_PRESETS: Record<
  ActivationVariant,
  {
    eyebrow: string;
    eyebrowIcon: { desktop: React.ReactNode; mobile: React.ReactNode };
    /** Override which substring of `title` gets the accent color. Defaults
     *  to the first space-separated token. */
    accentMatch?: string;
    placeholderDesktop: string;
    placeholderMobile: string;
  }
> = {
  "reward-pool": {
    eyebrow: "New users · limited",
    eyebrowIcon: {
      desktop: <span className="h-1 w-1 rounded-full bg-[#F5BA38] shadow-[0_0_6px_#F5BA38]" />,
      mobile: <span className="h-1 w-1 rounded-full bg-neon shadow-[0_0_6px_var(--neon)]" />,
    },
    placeholderDesktop:
      "bg-[linear-gradient(135deg,#3b1f5a_0%,#6b2d8a_45%,#f5ba38_100%)]",
    placeholderMobile:
      "bg-[radial-gradient(80%_120%_at_50%_20%,oklch(0.78_0.18_155/0.45),transparent_70%),linear-gradient(180deg,#0b1a20_0%,#061014_100%)]",
  },
  voucher: {
    eyebrow: "24h window",
    eyebrowIcon: {
      desktop: <Clock className="h-2.5 w-2.5 text-[#F5BA38]" strokeWidth={2.5} />,
      mobile: <Clock className="h-2.5 w-2.5 text-neon" strokeWidth={2.5} />,
    },
    placeholderDesktop:
      "bg-[linear-gradient(135deg,#1f1a3d_0%,#3d2a6b_50%,#f5ba38_100%)]",
    placeholderMobile:
      "bg-[radial-gradient(80%_120%_at_50%_20%,oklch(0.78_0.18_155/0.5),transparent_70%),linear-gradient(180deg,#0b1a20_0%,#061014_100%)]",
  },
  "deposit-match": {
    eyebrow: "500 spots · daily",
    eyebrowIcon: {
      desktop: <span className="h-1 w-1 rounded-full bg-[#F5BA38] shadow-[0_0_6px_#F5BA38]" />,
      mobile: <span className="h-1 w-1 rounded-full bg-neon shadow-[0_0_6px_var(--neon)]" />,
    },
    // "Get 20U" is highlighted, not "Deposit"
    accentMatch: "Get 20U",
    placeholderDesktop:
      "bg-[linear-gradient(135deg,#1a1f3d_0%,#4a2d6b_50%,#f5ba38_100%)]",
    placeholderMobile:
      "bg-[radial-gradient(80%_120%_at_50%_20%,oklch(0.78_0.18_155/0.45),transparent_70%),linear-gradient(180deg,#0b1a20_0%,#061014_100%)]",
  },
};

/**
 * Hero illustration URLs per variant × device. Populate with `.asset.json`
 * pointers after exporting from Figma:
 *   desktop → 420×148 PNG @2x (cartoon carnival palette)
 *   mobile  → 390×172 PNG @2x (neon-green cinematic palette)
 * Until populated, the CSS placeholder gradient in `VARIANT_PRESETS` renders.
 */
const HERO_IMAGES: Record<
  ActivationVariant,
  { desktop: string | null; mobile: string | null }
> = {
  "reward-pool": { desktop: null, mobile: null },
  voucher: { desktop: null, mobile: null },
  "deposit-match": { desktop: null, mobile: null },
};
  },
};