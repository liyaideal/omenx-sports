import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Radio, Trophy, Star, User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = {
  key: "home" | "live" | "world-cup" | "fans" | "me";
  label: string;
  icon: LucideIcon;
  to?: "/" | "/events" | "/promo/world-cup" | "/fans";
  badge?: { kind: "count" | "hot"; value?: string };
};

const TABS: Tab[] = [
  { key: "home", label: "Home", icon: Home, to: "/" },
  {
    key: "live",
    label: "Live",
    icon: Radio,
    to: "/events",
    badge: { kind: "count", value: "6" },
  },
  {
    key: "world-cup",
    label: "World Cup",
    icon: Trophy,
    to: "/promo/world-cup",
    badge: { kind: "hot" },
  },
  { key: "fans", label: "Fans", icon: Star, to: "/fans" },
  { key: "me", label: "Me", icon: User },
];

const triggerHaptic = () => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(8);
  }
};

/**
 * Fixed bottom navigation for the mobile sports zone. 4 tabs — Home,
 * Events, Fans, Me. The first three are real TanStack Router routes; "Me"
 * opens a bottom sheet (account + bridge back to OmenX) owned by the
 * parent chrome.
 */
export function MobileBottomNav({ onMeClick }: { onMeClick: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.06] bg-[#0a0a0a]/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex h-16 max-w-md items-stretch justify-around px-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.to ? pathname === tab.to : false;

          const inner = (
            <>
              <span className="relative">
                <Icon
                  className={cn(
                    "h-[22px] w-[22px] transition-all",
                    isActive && "text-[#00e676] drop-shadow-[0_0_6px_#00e676]",
                  )}
                  strokeWidth={isActive ? 2.4 : 1.8}
                />
                {tab.badge?.kind === "count" && (
                  <span className="absolute -right-2 -top-1.5 grid h-[15px] min-w-[15px] place-items-center rounded-full bg-[#ff4c4d] px-1 font-mono text-[9px] font-bold text-white ring-2 ring-[#0a0a0a]">
                    {tab.badge.value}
                  </span>
                )}
                {tab.badge?.kind === "hot" && (
                  <span className="absolute -right-3 -top-2 inline-flex items-center gap-0.5 rounded-full bg-[#ff7a18] px-1 py-px font-mono text-[8px] font-bold uppercase text-white ring-2 ring-[#0a0a0a]">
                    🔥Hot
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "text-[11px] tracking-tight",
                  isActive ? "font-semibold text-[#00e676]" : "font-medium",
                )}
              >
                {tab.label}
              </span>
            </>
          );

          const className = cn(
            "relative flex flex-1 flex-col items-center justify-center gap-1 px-1 transition-transform active:scale-95",
            isActive ? "text-[#00e676]" : "text-white/55",
          );

          if (tab.key === "me") {
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  triggerHaptic();
                  onMeClick();
                }}
                className={className}
              >
                {inner}
              </button>
            );
          }

          return (
            <Link
              key={tab.key}
              to={tab.to!}
              onClick={triggerHaptic}
              aria-current={isActive ? "page" : undefined}
              className={className}
            >
              {inner}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}