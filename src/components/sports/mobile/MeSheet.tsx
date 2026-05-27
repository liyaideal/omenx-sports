import {
  ArrowUpRight,
  Gift,
  Globe,
  HelpCircle,
  LifeBuoy,
  LogOut,
  MessageCircle,
  Settings as SettingsIcon,
  Shield,
  Users,
  Wallet,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { omenxUrl, OMENX_BASE } from "@/lib/omenx";
import { cn } from "@/lib/utils";

interface MeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  userAvatar: string;
  equity: string;
  openPositions: number;
  /** Signed string, e.g. "+$142.20" / "-$12.40" / "$0.00". */
  pnlToday: string;
  /** Display string, e.g. "$48.00". */
  toClaim: string;
}

const OMENX_DESTINATIONS = [
  { label: "Markets", href: omenxUrl.markets() },
  { label: "Crypto", href: omenxUrl.crypto() },
  { label: "Politics", href: omenxUrl.politics() },
  { label: "Leaderboard", href: `${OMENX_BASE}/leaderboard` },
];

const MENU_ITEMS = [
  { label: "Rewards", icon: Gift, href: omenxUrl.account(), tone: "primary" as const },
  { label: "Referral", icon: Users, href: omenxUrl.account(), tone: "primary" as const },
  { label: "Settings", icon: SettingsIcon, href: omenxUrl.settings() },
  { label: "Language", icon: Globe, href: omenxUrl.settings(), trailing: "EN" },
  {
    label: "Transparency Audit",
    icon: Shield,
    href: omenxUrl.transparency(),
    tone: "good" as const,
  },
  {
    label: "Help & Support",
    icon: HelpCircle,
    href: "https://omenx-helpcenter.lovable.app",
    external: true,
  },
  {
    label: "Join Discord",
    icon: MessageCircle,
    href: "https://discord.gg/qXssm2crf9",
    external: true,
    tone: "discord" as const,
  },
];

/**
 * Bottom sheet for the mobile Me tab. Aggregates everything that lived
 * in the desktop AppTopBar dropdown + BridgeStrip + a 2x2 "Back to OmenX"
 * portal — so users never need the desktop chrome on mobile.
 */
export function MeSheet({
  open,
  onOpenChange,
  userName,
  userAvatar,
  equity,
  openPositions,
  pnlToday,
  toClaim,
}: MeSheetProps) {
  const trimmed = pnlToday.trim();
  const pnlUp = trimmed.startsWith("+");
  const pnlDown = trimmed.startsWith("-") || trimmed.startsWith("−");
  const pnlTone = pnlUp ? "text-win" : pnlDown ? "text-loss" : "text-muted-foreground";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[92vh] overflow-y-auto rounded-t-3xl border-t border-border/60 bg-background p-0"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-2.5">
          <span className="h-1 w-10 rounded-full bg-white/15" />
        </div>

        <SheetHeader className="sr-only">
          <SheetTitle>Account</SheetTitle>
          <SheetDescription>
            Equity, positions, OmenX shortcuts and settings.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 px-5 pb-8 pt-3">
          {/* User card */}
          <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/[0.06]">
            <img
              src={userAvatar}
              alt={userName}
              className="h-12 w-12 rounded-full border-2 border-primary/50 object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-base font-semibold text-foreground">
                {userName}
              </div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                OmenX · Sports
              </div>
            </div>
            <a
              href={omenxUrl.wallet()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-win/10 px-3 py-2 ring-1 ring-win/30 transition active:scale-95"
            >
              <Wallet className="h-4 w-4 text-win" />
              <span className="font-mono text-sm font-bold text-win">{equity}</span>
            </a>
          </div>

          {/* BridgeStrip stats */}
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Open" value={openPositions.toString()} tone="primary" />
            <Stat label="Today" value={pnlToday} tone={pnlUp ? "win" : pnlDown ? "loss" : "muted"} />
            <Stat label="To claim" value={toClaim} tone="foreground" />
          </div>
          <a
            href={omenxUrl.portfolio()}
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-primary/15 px-4 py-3 text-sm font-semibold text-foreground ring-1 ring-primary/30 transition active:scale-[0.98]"
          >
            Open Portfolio <ArrowUpRight className="h-4 w-4" />
          </a>

          {/* Back to OmenX */}
          <div>
            <div className="mb-2 flex items-center gap-2 px-1">
              <LifeBuoy className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Explore OmenX
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {OMENX_DESTINATIONS.map((d) => (
                <a
                  key={d.label}
                  href={d.href}
                  className="group flex items-center justify-between gap-2 rounded-2xl bg-white/[0.03] px-4 py-3 ring-1 ring-white/[0.05] transition active:scale-[0.98]"
                >
                  <span className="text-sm font-medium text-foreground">{d.label}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition group-hover:text-foreground" />
                </a>
              ))}
            </div>
          </div>

          {/* Menu */}
          <div className="overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.05]">
            {MENU_ITEMS.map((item, i) => {
              const Icon = item.icon;
              const iconTone =
                item.tone === "primary"
                  ? "text-primary"
                  : item.tone === "good"
                    ? "text-emerald-400"
                    : item.tone === "discord"
                      ? "text-[#5865F2]"
                      : "text-muted-foreground";
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 text-sm text-foreground transition active:bg-white/[0.04]",
                    i < MENU_ITEMS.length - 1 && "border-b border-white/[0.04]",
                  )}
                >
                  <Icon className={cn("h-4 w-4", iconTone)} />
                  <span className="flex-1">{item.label}</span>
                  {item.trailing && (
                    <span className="font-mono text-xs text-muted-foreground">
                      {item.trailing}
                    </span>
                  )}
                  {item.external && (
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </a>
              );
            })}
          </div>

          <a
            href={`${OMENX_BASE}/`}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-loss/30 bg-loss/5 px-4 py-3 text-sm font-medium text-loss transition active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "primary" | "win" | "loss" | "muted" | "foreground";
}) {
  const toneCls =
    tone === "win"
      ? "text-win"
      : tone === "loss"
        ? "text-loss"
        : tone === "primary"
          ? "text-primary"
          : tone === "foreground"
            ? "text-foreground"
            : "text-muted-foreground";
  return (
    <div className="rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/[0.05]">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className={cn("mt-1 font-display text-lg font-semibold tabular-nums", toneCls)}>
        {value}
      </div>
    </div>
  );
}