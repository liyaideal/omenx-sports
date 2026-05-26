import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Search, Wallet, User, Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { omenxUrl } from "@/lib/omenx";

type CategoryKey = "markets" | "sports" | "crypto" | "politics";

const CATEGORIES: { key: CategoryKey; label: string; href: string; internal?: boolean }[] = [
  { key: "markets", label: "Markets", href: omenxUrl.markets() },
  { key: "sports", label: "Sports", href: "/", internal: true },
  { key: "crypto", label: "Crypto", href: omenxUrl.crypto() },
  { key: "politics", label: "Politics", href: omenxUrl.politics() },
];

interface TopBarProps {
  active?: CategoryKey;
  className?: string;
}

export function TopBar({ active = "sports", className }: TopBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-6 px-4 md:px-6">
        {/* Co-branded logo lockup */}
        <div className="flex items-center gap-3">
          <a
            href={omenxUrl.home()}
            className="group inline-flex items-center gap-1.5 text-sm font-display font-semibold text-muted-foreground transition-colors hover:text-foreground"
            aria-label="OmenX home"
          >
            <span className="grid h-6 w-6 place-items-center rounded-md bg-white/[0.06] ring-1 ring-white/10 text-[11px] font-bold tracking-tighter">
              Ω
            </span>
            <span className="hidden sm:inline">OmenX</span>
          </a>
          <span className="h-5 w-px bg-border" aria-hidden />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5"
            aria-label="Stadium Neon — Sports"
          >
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-neon">
              Stadium Neon
            </span>
          </Link>
        </div>

        {/* Category nav */}
        <nav className="hidden lg:flex items-center gap-1 ml-2">
          {CATEGORIES.map((c) => {
            const isActive = c.key === active;
            const baseCls =
              "group relative inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors";
            const tone = isActive
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground";
            const content = (
              <>
                {c.label}
                {!c.internal && (
                  <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                )}
                {isActive && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-neon" />
                )}
              </>
            );
            return c.internal ? (
              <Link key={c.key} to="/" className={cn(baseCls, tone)}>
                {content}
              </Link>
            ) : (
              <a
                key={c.key}
                href={c.href}
                className={cn(baseCls, tone)}
                title={`Open ${c.label} on OmenX`}
              >
                {content}
              </a>
            );
          })}
        </nav>

        <div className="flex-1" />

        {/* Right cluster */}
        <div className="hidden md:flex items-center gap-1">
          <button
            type="button"
            title="Search — coming soon"
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            <Search className="h-4 w-4" />
          </button>
          <a
            href={omenxUrl.wallet()}
            title="Open wallet on OmenX"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
          >
            <Wallet className="h-3.5 w-3.5" />
            Wallet
            <ArrowUpRight className="h-3 w-3 opacity-60" />
          </a>
          <a
            href={omenxUrl.account()}
            title="Open account on OmenX"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.04] ring-1 ring-white/10 text-foreground transition-colors hover:bg-white/[0.08]"
            aria-label="Account"
          >
            <User className="h-4 w-4" />
          </a>
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
          aria-label="Menu"
          aria-expanded={open}
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-3 grid gap-1">
            {CATEGORIES.map((c) =>
              c.internal ? (
                <Link
                  key={c.key}
                  to="/"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center justify-between rounded-md px-3 py-2 text-sm",
                    c.key === active
                      ? "bg-white/[0.06] text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {c.label}
                </Link>
              ) : (
                <a
                  key={c.key}
                  href={c.href}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground"
                >
                  {c.label}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ),
            )}
            <div className="my-2 h-px bg-border" />
            <a
              href={omenxUrl.wallet()}
              className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground"
            >
              <span className="inline-flex items-center gap-2">
                <Wallet className="h-3.5 w-3.5" />
                Wallet
              </span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
            <a
              href={omenxUrl.account()}
              className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground"
            >
              <span className="inline-flex items-center gap-2">
                <User className="h-3.5 w-3.5" />
                Account
              </span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}