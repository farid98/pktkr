import Link from "next/link";

type ActivePage = "market" | "tickers" | "news" | "explore" | "economy" | "trade" | "it-exports" | "blog";
type NavLink = { href: string; label: string; active: ActivePage };

const primaryLinks: NavLink[] = [
  { href: "/", label: "Market", active: "market" },
  { href: "/tickers", label: "Tickers", active: "tickers" },
  { href: "/blog", label: "Blog", active: "blog" },
];

export function SiteHeader({ active }: { active: ActivePage }) {
  return (
    <header className="border-b border-slate-200/80 bg-white">
      <div className="mx-auto flex h-16 max-w-[1880px] items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="pktkr home">
          <span className="grid size-9 place-items-center rounded-xl bg-[#203a63] text-sm font-black tracking-tight text-white">pk</span>
          <span className="text-lg font-bold tracking-[-0.03em] text-[#203a63]">pktkr</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm font-bold sm:gap-5" aria-label="Primary navigation">
          {primaryLinks.map((link) => (
            <Link key={link.href} href={link.href} className={active === link.active ? "text-[#203a63]" : "text-slate-400 hover:text-slate-900"} aria-current={active === link.active ? "page" : undefined}>{link.label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
