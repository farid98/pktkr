"use client";

import { useEffect, useId, useState } from "react";

export function MermaidDiagram({ chart }: { chart: string }) {
  const diagramId = useId().replace(/:/g, "-");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          themeVariables: {
            primaryColor: "#e8eef8",
            primaryTextColor: "#203a63",
            primaryBorderColor: "#58749b",
            lineColor: "#58749b",
            fontFamily: "Arial, sans-serif",
          },
        });
        const result = await mermaid.render(`pktkr-${diagramId}`, chart);
        if (active) setSvg(result.svg);
      } catch {
        if (active) setError(true);
      }
    }

    void render();
    return () => {
      active = false;
    };
  }, [chart, diagramId]);

  return (
    <figure className="my-6 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
      {svg ? (
        <div
          className="min-w-max [&_svg]:mx-auto [&_svg]:max-w-none"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <pre className="whitespace-pre-wrap font-mono text-xs leading-5 text-slate-600">
          {chart}
        </pre>
      )}
      {error ? (
        <figcaption className="mt-3 text-xs text-slate-500">
          Diagram source is shown because it could not be rendered.
        </figcaption>
      ) : null}
    </figure>
  );
}
