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
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0a0a0a]/95 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        {/* Logo lockup — Figma mobile spec: OMENX (white) | SPORTS (green italic) */}
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
            className="h-6 w-[2px] rounded-full bg-white/15"
          />
          <span className="font-display text-lg font-black italic uppercase tracking-normal text-[#00e676]">
            Sports
          </span>
        </a>

        {/* Right cluster — Figma keeps it minimal: just the avatar entry */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={onAvatarClick}
            aria-label={`Open ${userName} menu`}
            className="transition active:scale-95"
          >
            <img
              src={userAvatar}
              alt={userName}
              className="h-9 w-9 rounded-full border border-white/15 object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
}