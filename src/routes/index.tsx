import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { NeonRing } from "@/components/sports/NeonRing";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background bg-ambient text-foreground">
      <div className="mx-auto grid min-h-screen max-w-6xl place-items-center px-6">
        <div className="grid items-center gap-12 md:grid-cols-[1fr_auto]">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-neon">stadium neon</div>
            <h1 className="mt-4 text-6xl font-display font-bold leading-[1.05]">
              Predict the match,
              <br />
              <span className="font-serif-display italic text-gradient-neon">own the moment.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm text-muted-foreground leading-relaxed">
              Reskin in progress. The design system is the first deliverable — every page that
              follows will be built on top of it.
            </p>
            <Link
              to="/style-guide"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-neon px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
            >
              Open the design system <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="hidden md:block">
            <NeonRing size={280} dashed>
              <div className="grid h-48 w-48 place-items-center rounded-full bg-surface text-6xl font-display font-bold">
                10
              </div>
            </NeonRing>
          </div>
        </div>
      </div>
    </div>
  );
}
