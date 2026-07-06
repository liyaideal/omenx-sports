import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export interface CoachMarkOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Element to spotlight. Overlay measures its bounding rect on open + resize + scroll. */
  targetRef: React.RefObject<HTMLElement | null>;
  title: string;
  description?: string;
  /** 1-based step index. Rendered only alongside `totalSteps > 1`. */
  step?: number;
  /** Total steps in the guide. Eyebrow chip is hidden when this is 1 or unset. */
  totalSteps?: number;
  /** Primary CTA label. Defaults to `Got it`. */
  ctaLabel?: string;
  /** CTA handler. Defaults to closing the overlay. */
  onCta?: () => void;
  /** Force tooltip placement. `auto` picks based on target position. */
  placement?: "auto" | "top" | "bottom";
  /** Extra padding around the spotlight, px. */
  padding?: number;
  /** Spotlight corner radius, px. */
  radius?: number;
  /** Scroll target into view when opened. Defaults to true. */
  scrollIntoView?: boolean;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * CoachMarkOverlay — full-viewport spotlight coach-mark. Renders a dark scrim
 * with an SVG mask cut-out around the referenced target, then anchors a
 * tooltip card (title + description + single CTA) directly above or below it.
 *
 * Callers control persistence ("don't show again", per-user gating, etc.);
 * this component only owns the visual and dismissal via the CTA.
 *
 * Step indicator rule: the `STEP · N / TOTAL` eyebrow chip renders **only**
 * when the guide has more than one step (`totalSteps > 1`). Single-step
 * guides hide the chip — the title alone communicates the action.
 */
export function CoachMarkOverlay({
  open,
  onOpenChange,
  targetRef,
  title,
  description,
  step,
  totalSteps,
  ctaLabel = "Got it",
  onCta,
  placement = "auto",
  padding = 8,
  radius = 16,
  scrollIntoView = true,
}: CoachMarkOverlayProps) {
  const isMobile = useIsMobile();
  const [rect, setRect] = React.useState<Rect | null>(null);
  const [viewport, setViewport] = React.useState({ w: 0, h: 0 });
  const ctaButtonRef = React.useRef<HTMLButtonElement | null>(null);

  React.useLayoutEffect(() => {
    if (!open) return;
    const measure = () => {
      const el = targetRef.current;
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    measure();
    let scrollTimer: number | undefined;
    if (scrollIntoView && targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      scrollTimer = window.setTimeout(measure, 320);
    }
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      if (scrollTimer) window.clearTimeout(scrollTimer);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, targetRef, scrollIntoView]);

  React.useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handleKey);
    const t = window.setTimeout(() => ctaButtonRef.current?.focus(), 60);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", handleKey);
    };
  }, [open, onOpenChange]);

  if (!open || typeof document === "undefined") return null;

  const spot = rect
    ? {
        x: Math.max(0, rect.left - padding),
        y: Math.max(0, rect.top - padding),
        w: rect.width + padding * 2,
        h: rect.height + padding * 2,
      }
    : null;

  const spotCenterY = spot ? spot.y + spot.h / 2 : viewport.h / 2;
  const preferBottom = placement === "bottom" || (placement === "auto" && spotCenterY < viewport.h / 2);
  const cardStyle: React.CSSProperties | undefined = isMobile
    ? undefined
    : spot
    ? preferBottom
      ? { top: `${spot.y + spot.h + 16}px`, left: `${spot.x + spot.w / 2}px`, transform: "translateX(-50%)" }
      : { top: `${spot.y - 16}px`, left: `${spot.x + spot.w / 2}px`, transform: "translate(-50%, -100%)" }
    : { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

  const handleCta = () => {
    if (onCta) onCta();
    else onOpenChange(false);
  };

  const overlay = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[70] animate-in fade-in duration-200"
    >
      <svg className="pointer-events-auto absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <mask id="coach-mark-mask">
            <rect width="100%" height="100%" fill="white" />
            {spot && (
              <rect
                x={spot.x}
                y={spot.y}
                width={spot.w}
                height={spot.h}
                rx={radius}
                ry={radius}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.72)"
          mask="url(#coach-mark-mask)"
        />
      </svg>

      {spot && (
        <div
          aria-hidden
          className="pointer-events-none absolute"
          style={{
            top: spot.y,
            left: spot.x,
            width: spot.w,
            height: spot.h,
            borderRadius: radius,
            boxShadow:
              "0 0 0 2px oklch(0.7 0.18 145), 0 0 0 6px oklch(0.7 0.18 145 / 0.2), 0 0 40px 4px oklch(0.7 0.18 145 / 0.5)",
          }}
        />
      )}

      <div
        className={cn(
          "pointer-events-auto absolute w-[min(92vw,22rem)] overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-glow",
          isMobile && "left-1/2 bottom-4 top-auto -translate-x-1/2",
          "animate-in fade-in slide-in-from-bottom-2 duration-200",
        )}
        style={cardStyle}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-16 h-32 opacity-70 blur-3xl bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.7_0.18_145/0.5),transparent_70%)]"
        />
        <div className="relative flex flex-col gap-2">
          {totalSteps && totalSteps > 1 && step ? (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/[0.05] px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-[oklch(0.7_0.18_145)] shadow-[0_0_8px_oklch(0.7_0.18_145)]" />
              Step · {step} / {totalSteps}
            </span>
          ) : null}
          <h3 className="font-pitch text-lg font-bold uppercase leading-tight tracking-wide text-foreground">
            {title}
          </h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          <button
            ref={ctaButtonRef}
            type="button"
            onClick={handleCta}
            className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-neon px-6 font-pitch text-sm font-bold uppercase tracking-[0.18em] text-white shadow-glow transition hover:opacity-95 active:opacity-90"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
