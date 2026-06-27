import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/sports/dashboard/AppShell";
import { MobileChrome } from "@/components/sports/mobile/MobileChrome";
import { MobileEventsSection } from "@/components/sports/mobile/MobileEventsSection";
import { WorldCupFloatingBadge } from "@/components/sports/promo/WorldCupFloatingBadge";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — Stadium Neon" },
      {
        name: "description",
        content:
          "Browse every live and upcoming sports market on OmenX Stadium Neon by day.",
      },
      { property: "og:title", content: "Events — Stadium Neon" },
      {
        property: "og:description",
        content:
          "Live and upcoming sports prediction markets, filtered by day.",
      },
      { property: "og:url", content: "/events" },
    ],
    links: [{ rel: "canonical", href: "/events" }],
  }),
  component: EventsPage,
});

function EventsPage() {
  return (
    <AppShell>
      <MobileChrome>
        <MobileEventsSection />
        <WorldCupFloatingBadge />
      </MobileChrome>
      <div className="hidden min-h-screen items-center justify-center px-8 md:flex">
        <div className="max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-card">
          <h1 className="font-display text-2xl font-semibold">
            Events live on the homepage
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The desktop dashboard already shows the full Live &amp; Upcoming grid
            on the home page. This standalone Events route is the mobile entry
            point.
          </p>
          <Link
            to="/"
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Open homepage
          </Link>
        </div>
      </div>
    </AppShell>
  );
}