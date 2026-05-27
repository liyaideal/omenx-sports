import { Bell, ChevronRight } from "lucide-react";
import { omenxUrl } from "@/lib/omenx";

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
        {/* Breadcrumb lockup */}
        <div className="flex min-w-0 items-center gap-1.5">
          <a
            href={omenxUrl.home()}
            aria-label="Back to OmenX"
            className="grid h-8 w-8 place-items-center rounded-lg bg-white/[0.05] ring-1 ring-white/10 text-[13px] font-bold tracking-tighter text-foreground transition active:scale-95"
          >
            Ω
          </a>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span
            className="bg-gradient-to-br from-primary to-accent bg-clip-text font-display text-base font-black italic uppercase tracking-tight text-transparent"
            style={{
              filter:
                "drop-shadow(0 0 10px color-mix(in oklab, var(--primary) 30%, transparent))",
            }}
          >
            Sports
          </span>
        </div>

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