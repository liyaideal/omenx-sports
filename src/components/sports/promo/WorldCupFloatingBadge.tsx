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
      className="group fixed right-3 z-40 flex items-center gap-2 rounded-xl border border-amber-400/60 bg-[#0a0a0a]/95 py-2 pl-2 pr-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.6),0_0_0_1px_rgba(250,204,21,0.15)] backdrop-blur-md transition active:scale-95 md:hidden"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 76px)" }}
    >
      <span className="grid h-9 w-9 place-items-center">
        <GiftBoxJerseyIcon className="h-9 w-9" />
      </span>
      <span className="font-pitch text-[11px] font-bold uppercase leading-tight tracking-wide text-amber-300">
        World Cup
        <br />
        Carnival
      </span>
      <ChevronRight className="h-4 w-4 text-amber-300/70 transition group-hover:translate-x-0.5" />
    </Link>
  );
}