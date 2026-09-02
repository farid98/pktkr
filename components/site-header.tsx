import Link from "next/link";

type ActivePage = "market" | "tickers" | "blog";
type NavLink = { href: string; label: string; active: ActivePage };

const primaryLinks: NavLink[] = [
  { href: "/", label: "Market", active: "market" },
  { href: "/tickers", label: "Tickers", active: "tickers" },
  { href: "/blog", label: "Blog", active: "blog" },
];

export function SiteHeader({ active }: { active: ActivePage }) {
  return (
    <header className="border-b border-slate-200/80 bg-white">
      <div className="mx-auto flex h-14 max-w-[1880px] items-center justify-between gap-3 px-3 sm:h-16 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3" aria-label="pktkr home">
          <span className="grid size-8 place-items-center rounded-lg bg-[#203a63] text-xs font-black tracking-tight text-white sm:size-9 sm:rounded-xl sm:text-sm">pk</span>
          <span className="text-base font-bold tracking-[-0.03em] text-[#203a63] sm:text-lg">pktkr</span>
        </Link>
        <nav className="flex shrink-0 rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-bold sm:text-sm" aria-label="Primary navigation">
          {primaryLinks.map((link) => (
            <Link key={link.href} href={link.href} className={`rounded-md px-2.5 py-1.5 transition sm:px-3 ${active === link.active ? "bg-[#203a63] text-white shadow-sm" : "text-slate-500 hover:text-slate-900"}`} aria-current={active === link.active ? "page" : undefined}>{link.label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
