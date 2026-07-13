import { useState } from "react";
import { toast } from "sonner";
import { Loader2, UserCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { demoEngine, signInDemo, type DemoScenario } from "@/lib/demoEngine";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSignedIn?: () => void;
  /**
   * Preview mode for `/style-guide` — renders the chooser without actually
   * mutating the auth session. All handlers no-op after a fake latency.
   */
  previewOnly?: boolean;
}

type Row =
  | {
      kind: "account";
      scenario: DemoScenario;
      name: string;
      email: string;
      avatar: string;
    }
  | { kind: "another" };

const ACCOUNTS: Row[] = [
  {
    kind: "account",
    scenario: "matched",
    name: "Alex Carter",
    email: "alex.carter@gmail.com",
    avatar:
      "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=felix&backgroundColor=b6e3f4",
  },
  {
    kind: "account",
    scenario: "welcome",
    name: "Mia Reyes",
    email: "mia.reyes@gmail.com",
    avatar:
      "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=mia&backgroundColor=ffd5dc",
  },
  { kind: "another" },
];

/** Multi-color Google "G" logo. */
function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

function Body({
  onSignedIn,
  onClose,
  previewOnly,
}: {
  onSignedIn?: () => void;
  onClose: () => void;
  previewOnly?: boolean;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  const handleAccount = async (r: Extract<Row, { kind: "account" }>) => {
    setBusy(r.scenario);
    try {
      if (previewOnly) {
        await new Promise((res) => setTimeout(res, 500));
        toast.success(`Welcome back, ${r.name}`, {
          description: "Preview only — no session created.",
        });
      } else {
        await signInDemo(r.scenario);
        toast.success(`Welcome back, ${r.name}`);
        onSignedIn?.();
      }
      onClose();
    } catch (e) {
      toast.error("Couldn't sign in", {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setBusy(null);
    }
  };

  const handleAnother = async () => {
    setBusy("another");
    try {
      if (previewOnly) {
        await new Promise((res) => setTimeout(res, 500));
        toast.success("Welcome to OMENX Sports", {
          description: "Preview only — no session created.",
        });
      } else {
        const { error } = await demoEngine.auth.signInAnonymously();
        if (error) throw error;
        toast.success("Welcome to OMENX Sports");
        onSignedIn?.();
      }
      onClose();
    } catch (e) {
      toast.error("Couldn't sign in", {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-2 pt-1 text-center">
        <GoogleG className="h-8 w-8" />
        <div className="font-display text-lg font-medium text-foreground">
          Choose an account
        </div>
        <div className="text-xs text-muted-foreground">
          to continue to <span className="text-foreground">OMENX Sports</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/70 bg-white/[0.02]">
        {ACCOUNTS.map((row, i) => {
          const isLast = i === ACCOUNTS.length - 1;
          const divider = !isLast && "border-b border-border/60";
          if (row.kind === "account") {
            const active = busy === row.scenario;
            return (
              <button
                key={row.scenario}
                type="button"
                disabled={busy !== null}
                onClick={() => handleAccount(row)}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.05] focus:bg-white/[0.06] focus:outline-none",
                  divider,
                  busy && !active && "opacity-40",
                )}
              >
                <img
                  src={row.avatar}
                  alt=""
                  className="h-9 w-9 rounded-full border border-border/60 bg-white/5 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">
                    {row.name}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {row.email}
                  </div>
                </div>
                {active && (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                )}
              </button>
            );
          }
          const active = busy === "another";
          return (
            <div key="another">
              <button
                type="button"
                disabled={busy !== null}
                onClick={handleAnother}
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.05] focus:bg-white/[0.06] focus:outline-none",
                  busy && !active && "opacity-40",
                )}
              >
                <span className="grid h-9 w-9 place-items-center rounded-full border border-dashed border-border/70 text-muted-foreground">
                  <UserCircle2 className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground">
                    Use another account
                  </div>
                </div>
                {active && (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
                )}
              </button>
              <div className="px-4 pb-3 font-mono text-[10px] leading-snug text-muted-foreground/80">
                New account · won't sync across devices
              </div>
            </div>
          );
        })}
      </div>

      <p className="px-1 text-center text-[10px] leading-snug text-muted-foreground/70">
        Before using this app, you can review OMENX Sports&apos;s{" "}
        <span className="text-foreground/80 underline decoration-dotted">
          privacy policy
        </span>{" "}
        and{" "}
        <span className="text-foreground/80 underline decoration-dotted">
          terms of service
        </span>
        .
      </p>
    </div>
  );
}

/**
 * Google "Choose an account" style entry, matched to the OmenX main-site
 * chooser. Renders as a bottom Sheet on mobile, centered Dialog on md+.
 */
export function GoogleAccountChooser({
  open,
  onOpenChange,
  onSignedIn,
  previewOnly,
}: Props) {
  const isMobile = useIsMobile();
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-t border-border/60 bg-background px-5 pb-8 pt-4"
        >
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15" />
          <SheetHeader className="sr-only">
            <SheetTitle>Choose an account</SheetTitle>
            <SheetDescription>
              Continue to OMENX Sports with a Google account.
            </SheetDescription>
          </SheetHeader>
          <Body
            onSignedIn={onSignedIn}
            onClose={() => onOpenChange(false)}
            previewOnly={previewOnly}
          />
        </SheetContent>
      </Sheet>
    );
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="sr-only">
          <DialogTitle>Choose an account</DialogTitle>
          <DialogDescription>
            Continue to OMENX Sports with a Google account.
          </DialogDescription>
        </DialogHeader>
        <Body
          onSignedIn={onSignedIn}
          onClose={() => onOpenChange(false)}
          previewOnly={previewOnly}
        />
      </DialogContent>
    </Dialog>
  );
}