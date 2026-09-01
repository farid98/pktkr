import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Image from "next/image";

import { MermaidDiagram } from "@/components/mermaid-diagram";
import { MonthlyIndexLineChart } from "@/components/monthly-index-line-chart";
import { MonthlyMarketHeatmap } from "@/components/monthly-market-heatmap";

function Heading({ level, children }: { level: 2 | 3; children: ReactNode }) {
  const className =
    level === 2
      ? "mt-10 text-2xl font-bold tracking-[-0.03em] text-[#203a63] sm:text-3xl"
      : "mt-7 text-xl font-bold tracking-[-0.02em] text-slate-900";
  return level === 2 ? <h2 className={className}>{children}</h2> : <h3 className={className}>{children}</h3>;
}

function Ticker({ symbol }: { symbol: string }) {
  const normalizedSymbol = symbol.trim().toUpperCase();

  return (
    <a
      href={`https://dps.psx.com.pk/company/${encodeURIComponent(normalizedSymbol)}`}
      target="_blank"
      rel="noreferrer"
      title={`View ${normalizedSymbol} on PSX Data Portal`}
      className="font-semibold text-[#203a63] underline decoration-slate-300 underline-offset-4 hover:decoration-[#203a63]"
    >
      {normalizedSymbol}
    </a>
  );
}

export const blogMdxComponents = {
  h1: ({ children }: { children: ReactNode }) => (
    <h2 className="mt-10 text-2xl font-bold tracking-[-0.03em] text-[#203a63] sm:text-3xl">{children}</h2>
  ),
  h2: ({ children }: { children: ReactNode }) => <Heading level={2}>{children}</Heading>,
  h3: ({ children }: { children: ReactNode }) => <Heading level={3}>{children}</Heading>,
  p: ({ children }: { children: ReactNode }) => (
    <p className="mt-4 text-[15px] leading-7 text-slate-700 sm:text-base">{children}</p>
  ),
  a: ({ href, children }: ComponentPropsWithoutRef<"a">) => (
    <a href={href} className="font-semibold text-[#203a63] underline decoration-slate-300 underline-offset-4 hover:decoration-[#203a63]">{children}</a>
  ),
  ul: ({ children }: { children: ReactNode }) => <ul className="mt-4 list-disc space-y-2 pl-6 text-[15px] leading-7 text-slate-700 sm:text-base">{children}</ul>,
  ol: ({ children }: { children: ReactNode }) => <ol className="mt-4 list-decimal space-y-2 pl-6 text-[15px] leading-7 text-slate-700 sm:text-base">{children}</ol>,
  blockquote: ({ children }: { children: ReactNode }) => <blockquote className="my-6 border-l-4 border-[#58749b] bg-slate-50 px-5 py-4 text-slate-600">{children}</blockquote>,
  pre: ({ children }: { children: ReactNode }) => <pre className="my-6 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm leading-6 text-slate-100">{children}</pre>,
  code: ({ children }: { children: ReactNode }) => <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-700">{children}</code>,
  table: ({ children }: { children: ReactNode }) => (
    <div className="my-6 overflow-x-auto rounded-xl border border-slate-200"><table className="w-full min-w-[560px] border-collapse text-left text-sm">{children}</table></div>
  ),
  thead: ({ children }: { children: ReactNode }) => <thead className="bg-slate-50 text-xs uppercase tracking-[0.06em] text-slate-500">{children}</thead>,
  th: ({ children }: { children: ReactNode }) => <th className="border-b border-slate-200 px-3 py-3 font-bold">{children}</th>,
  td: ({ children }: { children: ReactNode }) => <td className="border-b border-slate-100 px-3 py-3 text-slate-700 last:border-b-0">{children}</td>,
  MermaidDiagram,
  Ticker,
  MonthlyIndexLineChart,
  MonthlyMarketHeatmap,
  MonthlyIndexSocialImage: () => (
    <Image
      src="/blog/august-2026-kse100-market-wrap/opengraph-image"
      alt="KSE-100 daily close in August 2026, ending at 176,975.67 after gaining 0.50%"
      width={1200}
      height={630}
      sizes="(max-width: 768px) 100vw, 768px"
      className="my-6 block w-full rounded-2xl border border-slate-200 shadow-sm"
    />
  ),
};
