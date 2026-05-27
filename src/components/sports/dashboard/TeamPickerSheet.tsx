import { useMemo, useState } from "react";
import { Check, Plus, Search, X } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { TeamLite } from "@/data/sports-mock";

export interface TeamGroup {
  label: string;
  teams: TeamLite[];
}

/**
 * Team picker for large catalogs (e.g. World Cup 24+ national teams).
 * Two presentation variants — pick by form factor:
 *   • variant="sheet"  → MOBILE ONLY. Full-screen bottom sheet, sticky
 *     header (title + search + close) and sticky Save bar. Optimized for
 *     thumb reach and one-hand operation.
 *   • variant="dialog" → DESKTOP ONLY. Centered modal (~640px wide,
 *     max-h 80vh) with the same body, but rendered as an overlay over
 *     the page rather than taking the whole viewport.
 * Both variants share the same body: sticky search header, a "Following"
 * pin group, and the grouped catalog with multi-select crests.
 */
export function TeamPickerSheet({
  open,
  onOpenChange,
  groups,
  initialFollowed,
  onSave,
  title = "Pick your teams",
  description = "Search or browse — we'll surface their matches, polls, and fan posts on your home.",
  variant = "sheet",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: TeamGroup[];
  initialFollowed?: string[];
  onSave?: (names: string[]) => void;
  title?: string;
  description?: string;
  /** "sheet" = mobile full-screen, "dialog" = desktop centered modal. */
  variant?: "sheet" | "dialog";
}) {
  const [followed, setFollowed] = useState<Set<string>>(
    () => new Set(initialFollowed ?? []),
  );
  const [query, setQuery] = useState("");

  const toggle = (name: string) =>
    setFollowed((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const allTeams = useMemo(() => groups.flatMap((g) => g.teams), [groups]);
  const followingTeams = useMemo(
    () => allTeams.filter((t) => followed.has(t.name)),
    [allTeams, followed],
  );

  const q = query.trim().toLowerCase();
  const filteredGroups = useMemo(() => {
    if (!q) return groups;
    return groups
      .map((g) => ({
        ...g,
        teams: g.teams.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.short.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.teams.length > 0);
  }, [groups, q]);

  const totalMatches = filteredGroups.reduce((n, g) => n + g.teams.length, 0);

  const body = (
    <>
      {/* Sticky header: title + search + close */}
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/95 px-5 pb-3 pt-5 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            </div>
            {variant === "sheet" && (
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.05] text-muted-foreground ring-1 ring-white/10 transition hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search teams, countries, or codes…"
              className="h-10 w-full rounded-full bg-white/[0.05] pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-primary/60"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear"
                className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 pb-6 pt-5">
          {/* Following pin group */}
          {!q && followingTeams.length > 0 && (
            <PickerGroup label={`Following · ${followingTeams.length}`}>
              <CrestGrid teams={followingTeams} followed={followed} onToggle={toggle} />
            </PickerGroup>
          )}

          {filteredGroups.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-border/60 bg-surface/40 px-6 py-16 text-center text-sm text-muted-foreground">
              No teams match &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredGroups.map((group) => (
              <PickerGroup
                key={group.label}
                label={
                  q
                    ? `${group.label} · ${group.teams.length} match${group.teams.length === 1 ? "" : "es"}`
                    : group.label
                }
              >
                <CrestGrid teams={group.teams} followed={followed} onToggle={toggle} />
              </PickerGroup>
            ))
          )}

          {q && totalMatches > 0 && (
            <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {totalMatches} team{totalMatches === 1 ? "" : "s"} match &ldquo;{query}&rdquo;
            </p>
          )}
        </div>

        {/* Sticky save bar */}
        <footer className="sticky bottom-0 z-10 border-t border-border/60 bg-background/95 px-5 py-4 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {followed.size === 0
                ? "Tap a crest to follow"
                : `${followed.size} selected`}
            </span>
            <div className="flex items-center gap-2">
              {followed.size > 0 && (
                <button
                  type="button"
                  onClick={() => setFollowed(new Set())}
                  className="rounded-full px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </button>
              )}
              <button
                type="button"
                disabled={followed.size === 0}
                onClick={() => {
                  onSave?.([...followed]);
                  onOpenChange(false);
                }}
                className="rounded-full bg-gradient-neon px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow transition disabled:opacity-40"
              >
                Save preferences
              </button>
            </div>
          </div>
        </footer>
    </>
  );

  if (variant === "dialog") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[80vh] w-[min(640px,92vw)] max-w-none flex-col gap-0 overflow-hidden border-border/60 bg-background p-0 sm:rounded-3xl">
          {body}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="inset-0 flex h-full w-full max-w-none flex-col gap-0 border-0 bg-background p-0 sm:max-w-none"
      >
        {body}
      </SheetContent>
    </Sheet>
  );
}

function PickerGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 last:mb-0">
      <h3 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </h3>
      {children}
    </section>
  );
}

function CrestGrid({
  teams,
  followed,
  onToggle,
}: {
  teams: TeamLite[];
  followed: Set<string>;
  onToggle: (name: string) => void;
}) {
  return (
    <ul className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
      {teams.map((team) => {
        const isFollowing = followed.has(team.name);
        return (
          <li key={team.name}>
            <button
              type="button"
              onClick={() => onToggle(team.name)}
              aria-pressed={isFollowing}
              className="group flex w-full flex-col items-center gap-1.5"
            >
              <span
                className={`relative grid h-14 w-14 place-items-center rounded-full p-1.5 ring-1 transition ${
                  isFollowing
                    ? "bg-white/[0.08] ring-primary/60"
                    : "bg-white/[0.04] ring-white/10 group-hover:ring-white/25"
                }`}
                style={{
                  boxShadow: isFollowing
                    ? `0 0 22px -4px oklch(0.7 0.22 ${team.hue} / 0.75)`
                    : `0 0 14px -8px oklch(0.7 0.22 ${team.hue} / 0.45)`,
                }}
              >
                <img src={team.logo} alt="" className="h-full w-full object-contain" />
                <span
                  className={`absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full ring-2 ring-background transition ${
                    isFollowing
                      ? "bg-gradient-neon text-primary-foreground"
                      : "bg-white/[0.1] text-muted-foreground"
                  }`}
                >
                  {isFollowing ? <Check className="h-2.5 w-2.5" /> : <Plus className="h-2.5 w-2.5" />}
                </span>
              </span>
              <span className="truncate text-[10px] font-medium text-muted-foreground group-hover:text-foreground">
                {team.short}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}