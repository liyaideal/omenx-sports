import omenxLogo from "@/assets/omenx-logo.svg";

/**
 * Mobile-only top bar — Figma spec: OMENX (white) | SPORTS (green italic).
 * Right side is intentionally empty; account entry lives in the bottom nav
 * "Me" tab. Props are accepted but unused so existing callers keep working.
 */
export function MobileTopBar(_props: {
  userAvatar?: string;
  userName?: string;
  onAvatarClick?: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0a0a0a]/95 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-3 px-4">
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
      </div>
    </header>
  );
}