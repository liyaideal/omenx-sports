import { useState } from "react";
import { cn } from "@/lib/utils";

interface TeamCrestProps {
  name: string;
  /** Two-letter abbreviation, e.g. "MC", "ARS". Auto-derived if omitted. */
  abbr?: string;
  /** Hue 0–360 — picks a stable color tone. */
  hue?: number;
  /** Optional real crest image URL — falls back to letter crest on error. */
  logoUrl?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZES: Record<NonNullable<TeamCrestProps["size"]>, string> = {
  xs: "h-6 w-6 text-[9px]",
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-xs",
  lg: "h-14 w-14 text-sm",
  xl: "h-20 w-20 text-base",
};

function deriveAbbr(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function hashHue(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
}

/**
 * Abstract team crest — gradient shield with monogram.
 * Used as a stable, license-free stand-in for real club crests in the design system.
 */
export function TeamCrest({ name, abbr, hue, logoUrl, size = "md", className }: TeamCrestProps) {
  const letters = abbr ?? deriveAbbr(name);
  const h = hue ?? hashHue(name);
  const from = `oklch(0.65 0.18 ${h})`;
  const to = `oklch(0.4 0.16 ${(h + 40) % 360})`;
  const [imgFailed, setImgFailed] = useState(false);
  if (logoUrl && !imgFailed) {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 shadow-card overflow-hidden",
          SIZES[size],
          className,
        )}
        aria-label={name}
      >
        <img
          src={logoUrl}
          alt={name}
          className="h-[78%] w-[78%] object-contain"
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-mono font-bold text-white ring-1 ring-white/10 shadow-card",
        SIZES[size],
        className,
      )}
      style={{ backgroundImage: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
      aria-label={name}
    >
      {letters}
    </div>
  );
}