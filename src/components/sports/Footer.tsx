import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { omenxUrl } from "@/lib/omenx";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
          <span>© OmenX</span>
          <span className="h-3 w-px bg-border" aria-hidden />
          <span className="text-neon">Stadium Neon · Sports zone</span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <a
            href={omenxUrl.terms()}
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            Terms <ArrowUpRight className="h-3 w-3" />
          </a>
          <a
            href={omenxUrl.help()}
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            Help <ArrowUpRight className="h-3 w-3" />
          </a>
          <a
            href={omenxUrl.home()}
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            OmenX <ArrowUpRight className="h-3 w-3" />
          </a>
          <Link
            to="/style-guide"
            className="text-muted-foreground/50 hover:text-muted-foreground"
          >
            Design system
          </Link>
        </nav>
      </div>
    </footer>
  );
}