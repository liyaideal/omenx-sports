import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/sports/dashboard/AppShell";
import { MobileChrome } from "@/components/sports/mobile/MobileChrome";
import { MobileFansSection } from "@/components/sports/mobile/MobileFansSection";

export const Route = createFileRoute("/fans")({
  head: () => ({
    meta: [
      { title: "Fans Zone — Stadium Neon" },
      {
        name: "description",
        content:
          "Follow teams, watch live trades roll in, and read the fan feed inside OmenX Stadium Neon.",
      },
      { property: "og:title", content: "Fans Zone — Stadium Neon" },
      {
        property: "og:description",
        content:
          "Follow teams and watch live trades and fan posts from the OmenX sports community.",
      },
      { property: "og:url", content: "/fans" },
    ],
    links: [{ rel: "canonical", href: "/fans" }],
  }),
  component: FansPage,
});

function FansPage() {
  return (
    <AppShell>
      <MobileChrome>
        <MobileFansSection />
      </MobileChrome>
      <div className="hidden min-h-screen items-center justify-center px-8 md:flex">
        <div className="max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-card">
          <h1 className="font-display text-2xl font-semibold">
            Fans Zone lives on the homepage
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            On desktop the Fans Zone sits in the left column of the home
            dashboard. This standalone route is the mobile entry point.
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