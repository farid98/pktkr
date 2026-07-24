import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function DailyReport({ markdown }: { markdown: string }) {
  return (
    <section
      id="daily-report"
      className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_16px_60px_-38px_rgba(15,23,42,0.45)]"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2 className="border-b border-slate-100 px-4 py-5 text-2xl font-bold tracking-[-0.03em] text-[#203a63] sm:px-6 sm:text-3xl">
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h3 className="px-4 pt-8 text-lg font-bold tracking-[-0.02em] text-slate-900 first:pt-5 sm:px-6 sm:text-xl">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="px-4 pt-3 text-sm leading-6 text-slate-600 sm:px-6">
              {children}
            </p>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mx-4 mt-4 rounded-lg border-l-4 border-[#58749b] bg-slate-50 py-3 text-slate-500 sm:mx-6">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => (
            <ul className="mx-4 mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600 sm:mx-6">
              {children}
            </ul>
          ),
          li: ({ children }) => <li className="pl-1">{children}</li>,
          table: ({ children }) => (
            <div className="mx-4 mt-4 overflow-x-auto rounded-xl border border-slate-200 sm:mx-6">
              <table className="w-full min-w-[720px] border-collapse text-left text-xs sm:text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-50 text-[11px] uppercase tracking-[0.06em] text-slate-500">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="whitespace-nowrap border-b border-slate-200 px-3 py-3 font-bold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="whitespace-nowrap border-b border-slate-100 px-3 py-2.5 text-slate-600 last:border-b-0">
              {children}
            </td>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-800">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-xs text-slate-400">{children}</em>
          ),
          hr: () => <hr className="mx-4 mt-8 border-slate-200 sm:mx-6" />,
          code: ({ children }) => (
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-700">
              {children}
            </code>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
      <div className="h-8" />
    </section>
  );
}
