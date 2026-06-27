import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { GiftBoxJerseyIcon } from "@/components/sports/promo/GiftBoxJerseyIcon";

/**
 * Floating bottom-right entry point linking into the World Cup Carnival.
 * Designed for mobile product pages (sits above the bottom nav). Anchored
 * fixed; safe-area aware. Uses the carnival LED palette (amber on near-black).
 */
export function WorldCupFloatingBadge() {
  return (
    <Link
      to="/promo/world-cup"
      aria-label="Open World Cup Carnival"
      className="group fixed right-3 z-40 flex items-center gap-1.5 rounded-lg border-2 border-amber-400/40 bg-[rgba(30,20,0,0.35)] py-1 pl-1 pr-1.5 shadow-[0_4px_14px_rgba(0,0,0,0.25)] backdrop-blur-md transition active:scale-95 md:hidden"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 72px)" }}
    >
      <span className="grid h-7 w-7 place-items-center">
        <GiftBoxJerseyIcon className="h-7 w-7" />
      </span>
      <span className="font-mono text-[9px] font-bold uppercase leading-[1.05] tracking-wide text-amber-400">
        World Cup
        <br />
        Carnival
      </span>
      <ChevronRight className="h-3 w-3 text-amber-400/80 transition group-hover:translate-x-0.5" strokeWidth={2.5} />
    </Link>
  );
}