import { useState } from "react";
import { toast } from "sonner";
import { Loader2, LogIn, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { signInDemo, signOutDemo, type DemoScenario } from "@/lib/demoEngine";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignedIn?: () => void;
}

const ACCOUNTS: Array<{
  scenario: DemoScenario;
  title: string;
  blurb: string;
  balanceHint: string;
}> = [
  {
    scenario: "matched",
    title: "Matched trader",
    blurb: "Existing positions & realised PnL — jump straight into portfolio.",
    balanceHint: "≈ $13,530 USDC",
  },
  {
    scenario: "welcome",
    title: "Welcome trader",
    blurb: "Fresh account with Trial Bonus — try the newbie onboarding flow.",
    balanceHint: "Fresh · Trial Bonus",
  },
];

function Body({
  onSignedIn,
  onClose,
}: {
  onSignedIn?: () => void;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState<DemoScenario | null>(null);

  const handle = async (s: DemoScenario) => {
    setBusy(s);
    try {
      await signInDemo(s);
      toast.success(`Signed in · ${s === "matched" ? "Matched" : "Welcome"} demo`);
      onSignedIn?.();
      onClose();
    } catch (e) {
      toast.error("Sign in failed", {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 rounded-xl border border-primary/25 bg-primary/5 p-3 text-[11px] leading-relaxed text-muted-foreground">
        <Shield className="mt-[1px] h-3.5 w-3.5 shrink-0 text-primary" />
        <span>
          Demo accounts · shared with OmenX main site. Balances, positions
          and orders are stored on the main-site demo engine — you can open
          the same session in Portfolio ↗.
        </span>
      </div>
      <div className="grid gap-2">
        {ACCOUNTS.map((a) => (
          <button
            key={a.scenario}
            type="button"
            disabled={busy !== null}
            onClick={() => handle(a.scenario)}
            className={cn(
              "group flex w-full items-start justify-between gap-3 rounded-xl border border-border bg-white/[0.03] p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/[0.06]",
              busy && busy !== a.scenario && "opacity-40",
            )}
          >
            <div className="min-w-0 flex-1">
              <div className="font-display text-sm font-semibold text-foreground">
                {a.title}
              </div>
              <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                {a.blurb}
              </div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/80">
                {a.balanceHint}
              </div>
            </div>
            {busy === a.scenario ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
            ) : (
              <LogIn className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Responsive demo sign-in surface. Bottom sheet on mobile, centred dialog
 * on md+ — matches the project-wide "no center modals on mobile" rule.
 */
export function DemoSignInSheet({ open, onOpenChange, onSignedIn }: Props) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-t border-border/60 bg-background px-5 pb-8 pt-4"
        >
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15" />
          <SheetHeader className="mb-3">
            <SheetTitle>Sign in (demo)</SheetTitle>
            <SheetDescription>
              Pick a demo account to load — orders and balances persist on
              the OmenX main-site engine.
            </SheetDescription>
          </SheetHeader>
          <Body onSignedIn={onSignedIn} onClose={() => onOpenChange(false)} />
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in (demo)</DialogTitle>
          <DialogDescription>
            Pick a demo account to load — orders and balances persist on the
            OmenX main-site engine.
          </DialogDescription>
        </DialogHeader>
        <Body onSignedIn={onSignedIn} onClose={() => onOpenChange(false)} />
        <DialogFooter className="justify-start pt-1">
          <button
            type="button"
            onClick={async () => {
              await signOutDemo();
              onOpenChange(false);
            }}
            className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            Sign out any active demo session
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}