import { useState, type ReactNode } from "react";
import { MobileTopBar } from "@/components/sports/mobile/MobileTopBar";
import { MobileBottomNav } from "@/components/sports/mobile/MobileBottomNav";
import { MeSheet } from "@/components/sports/mobile/MeSheet";
import { ACCOUNT_STATS } from "@/data/sports-markets";

const USER_NAME = "Jeremy";
const USER_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=faces&q=80";

/**
 * Mobile-only chrome wrapper used by every mobile sports route. Renders
 * MobileTopBar above the content, MobileBottomNav as fixed bottom, and
 * owns the MeSheet state so the avatar button + bottom-nav `Me` tab both
 * open the same sheet.
 *
 * Hidden ≥ md — desktop renders its own AppTopBar inside each page.
 */
export function MobileChrome({ children }: { children: ReactNode }) {
  const [meOpen, setMeOpen] = useState(false);
  return (
    <div className="md:hidden">
      <MobileTopBar
        userName={USER_NAME}
        userAvatar={USER_AVATAR}
        onAvatarClick={() => setMeOpen(true)}
      />
      <main className="space-y-8 px-4 pb-24 pt-5">{children}</main>
      <MobileBottomNav onMeClick={() => setMeOpen(true)} />
      <MeSheet
        open={meOpen}
        onOpenChange={setMeOpen}
        userName={USER_NAME}
        userAvatar={USER_AVATAR}
        equity={ACCOUNT_STATS.available}
        openPositions={ACCOUNT_STATS.openPositions}
        pnlToday={ACCOUNT_STATS.pnlToday}
        toClaim={ACCOUNT_STATS.toClaim}
      />
    </div>
  );
}