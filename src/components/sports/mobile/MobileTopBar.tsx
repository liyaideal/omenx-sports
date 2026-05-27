import { Bell } from "lucide-react";
import omenxLogo from "@/assets/omenx-logo.svg";

/**
 * Mobile-only top bar. A compact breadcrumb lockup (Ω OmenX › Sports) on
 * the left makes it obvious the user is inside a sub-zone of OmenX —
 * tapping the Ω jumps back to the main site, tapping `Sports` stays.
 * Right side: notifications bell (placeholder) + user avatar that opens
 * the Me sheet from the BottomNav layer above.
 */
export function MobileTopBar({
  userAvatar,
  userName,
  onAvatarClick,
}: {
  userAvatar: string;
  userName: string;
  onAvatarClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/85 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        {/* Logo lockup — mirrors desktop AppTopBar (OmenX mark + neon divider + Sports) */}
        <a
          href="/"
          aria-label="OmenX Sports"
          className="group flex min-w-0 flex-shrink-0 items-center gap-2 transition-opacity duration-300 hover:opacity-95"
        >
          <img
            src={omenxLogo}
            alt="OMENX"
            className="h-6 w-auto transition-transform duration-300 group-active:scale-[0.98]"
          />
          <span
            aria-hidden
            className="relative h-7 w-[2px] overflow-hidden rounded-full bg-white/5"
          >
            <span
              className="absolute inset-0 bg-gradient-to-b from-primary via-primary to-accent"
              style={{
                boxShadow:
                  "0 0 10px color-mix(in oklab, var(--primary) 60%, transparent)",
              }}
            />
          </span>
          <span
            className="bg-gradient-to-br from-primary to-accent bg-clip-text font-display text-lg font-black italic uppercase tracking-normal text-transparent"
            style={{
              filter:
                "drop-shadow(0 0 12px color-mix(in oklab, var(--primary) 35%, transparent))",
            }}
          >
            Sports
          </span>
        </a>

        {/* Right cluster */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Notifications"
            className="relative grid h-9 w-9 place-items-center rounded-full bg-white/[0.04] text-muted-foreground transition active:scale-95"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[oklch(0.7_0.22_25)] shadow-[0_0_6px_oklch(0.7_0.22_25)]" />
          </button>
          <button
            type="button"
            onClick={onAvatarClick}
            aria-label={`Open ${userName} menu`}
            className="transition active:scale-95"
          >
            <img
              src={userAvatar}
              alt={userName}
              className="h-9 w-9 rounded-full border-2 border-primary/50 object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
}