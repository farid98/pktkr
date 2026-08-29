import Link from "next/link";

type Section = "market" | "economy";
type ActivePage = "market" | "tickers" | "news" | "explore" | "economy" | "trade" | "it-exports";
type NavLink = { href: string; label: string; shortLabel?: string; active: ActivePage };

const marketLinks: NavLink[] = [
  { href: "/", label: "Market", shortLabel: "Market", active: "market" },
  { href: "/tickers", label: "Tickers", shortLabel: "Tickers", active: "tickers" },
];

const economyLinks: NavLink[] = [
  { href: "/econ", label: "Overview", active: "economy" },
  { href: "/econ/trade", label: "Trade", active: "trade" },
  { href: "/econ/it-exports", label: "IT exports", active: "it-exports" },
];

export function SiteHeader({ section, active, showSubnav = true }: { section: Section; active: ActivePage; showSubnav?: boolean }) {
  const links = section === "market" ? marketLinks : economyLinks;

  return (
    <header className="border-b border-slate-200/80 bg-white">
      <div className="mx-auto flex h-16 max-w-[1880px] items-center justify-between px-4 sm:px-8">
        <Link href={section === "market" ? "/" : "/econ"} className="flex items-center gap-3" aria-label="pktkr home">
          <span className="grid size-9 place-items-center rounded-xl bg-[#203a63] text-sm font-black tracking-tight text-white">pk</span>
          <span className="text-lg font-bold tracking-[-0.03em] text-[#203a63]">pktkr</span>
        </Link>
        <nav className="flex items-center gap-5 text-sm font-bold" aria-label="Primary navigation">
          <Link href="/" className={section === "market" ? "text-[#203a63]" : "text-slate-400 hover:text-slate-900"} aria-current={section === "market" ? "page" : undefined}>Stocks</Link>
          <Link href="/econ" className={section === "economy" ? "text-[#203a63]" : "text-slate-400 hover:text-slate-900"} aria-current={section === "economy" ? "page" : undefined}>Economy</Link>
        </nav>
      </div>
      {showSubnav ? <div className="border-t border-slate-100">
        <nav className="mx-auto flex max-w-[1880px] items-center gap-4 overflow-x-auto px-4 py-2 text-xs font-semibold text-slate-500 sm:gap-5 sm:px-8" aria-label={`${section === "market" ? "Stock market" : "Economy"} navigation`}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={active === link.active ? "whitespace-nowrap text-[#203a63]" : "whitespace-nowrap hover:text-slate-900"} aria-current={active === link.active ? "page" : undefined}>
              <span className="sm:hidden">{link.shortLabel ?? link.label}</span>
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          ))}
        </nav>
      </div> : null}
    </header>
  );
}
