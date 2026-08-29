import { getItExportData } from "./it-export-data";
import { getEconomicTradeData } from "./trade-data";
import { getPublishedEconomyStories } from "./stories";

export type SocialImageBar = { label: string; value: number; accent?: boolean };

export type EconomySocialImageData = {
  eyebrow: string;
  title: string;
  subtitle: string;
  source: string;
  path: string;
  bars: SocialImageBar[];
  maxValue: number;
};

export async function getEconomySocialImageData(slug: string): Promise<EconomySocialImageData> {
  const story = getPublishedEconomyStories().find((item) => item.slug === slug);

  if (slug === "it-exports") {
    const data = await getItExportData();
    const annual = data.filter((row) => row.period.startsWith("FY") && !row.period.includes("YTD"));
    const bars = annual.map((row) => ({
      label: row.period,
      value: row.computerServices,
      accent: row.period === "FY2025",
    }));

    return {
      eyebrow: "PAKISTAN ECONOMY · EXPORTS",
      title: "Pakistan IT exports are becoming material.",
      subtitle: "Computer-services exports · million USD · fiscal year",
      source: "Source: State Bank of Pakistan",
      path: "/econ/it-exports",
      bars,
      maxValue: Math.ceil(Math.max(...bars.map((bar) => bar.value)) / 500) * 500,
    };
  }

  if (slug === "trade") {
    const data = await getEconomicTradeData();
    const latest = data.at(-1)!;
    const bars = [
      { label: "Exports", value: latest.exports },
      { label: "Imports", value: latest.imports, accent: true },
    ];

    return {
      eyebrow: "PAKISTAN ECONOMY · TRADE",
      title: "Pakistan’s trade gap remains wide.",
      subtitle: `${latest.fiscalYear} merchandise trade · million USD`,
      source: "Source: Pakistan Bureau of Statistics",
      path: "/econ/trade",
      bars,
      maxValue: Math.ceil(Math.max(...bars.map((bar) => bar.value)) / 5000) * 5000,
    };
  }

  return {
    eyebrow: "PAKISTAN ECONOMY",
    title: story?.title ?? "Pakistan economy, in data.",
    subtitle: story?.summary ?? "Clear, data-backed briefings on Pakistan’s economy.",
    source: story?.source ?? "pktkr.com",
    path: story?.href ?? "/econ",
    bars: [],
    maxValue: 1,
  };
}

export function EconomySocialImage({ data }: { data: EconomySocialImageData }) {
  return (
    <div
      style={{
        background: "#ffffff",
        color: "#203a63",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "48px 64px 38px",
        width: "100%",
      }}
    >
      <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
        <div style={{ alignItems: "center", display: "flex", gap: 14 }}>
          <div style={{ alignItems: "center", background: "#203a63", borderRadius: 14, color: "white", display: "flex", fontSize: 22, fontWeight: 800, height: 48, justifyContent: "center", width: 48 }}>pk</div>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em" }}>pktkr</div>
        </div>
        <div style={{ color: "#58749b", display: "flex", fontSize: 18, fontWeight: 700 }}>{data.eyebrow}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", marginTop: 30 }}>
        <div style={{ display: "flex", fontSize: 42, fontWeight: 800, letterSpacing: "-0.045em" }}>{data.title}</div>
        <div style={{ color: "#64748b", display: "flex", fontSize: 21, marginTop: 8 }}>{data.subtitle}</div>
      </div>

      {data.bars.length > 0 ? (
        <div style={{ display: "flex", flex: 1, marginTop: 24 }}>
          <div style={{ color: "#94a3b8", display: "flex", flexDirection: "column", fontSize: 15, justifyContent: "space-between", paddingBottom: 34, paddingTop: 4, width: 72 }}>
            {[data.maxValue, data.maxValue / 2, 0].map((value) => <div key={value} style={{ display: "flex" }}>${value.toLocaleString()}M</div>)}
          </div>
          <div style={{ borderBottom: "2px solid #cbd5e1", display: "flex", flex: 1, gap: 24, height: 250, justifyContent: "space-around", padding: "0 22px" }}>
            {data.bars.map((bar) => (
              <div key={bar.label} style={{ alignItems: "center", display: "flex", flex: 1, flexDirection: "column", justifyContent: "flex-end" }}>
                <div style={{ color: bar.accent ? "#0f766e" : "#315a8a", display: "flex", fontSize: 15, fontWeight: 700, marginBottom: 6 }}>${Math.round(bar.value).toLocaleString()}M</div>
                <div style={{ background: bar.accent ? "#0f766e" : "#315a8a", height: Math.max(12, (bar.value / data.maxValue) * 210), width: data.bars.length > 4 ? 72 : 120 }} />
                <div style={{ color: "#475569", display: "flex", fontSize: 16, marginTop: 10 }}>{bar.label}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ color: "#315a8a", display: "flex", flex: 1, fontSize: 34, fontWeight: 700, marginTop: 50 }}>Data-backed analysis of Pakistan’s economy.</div>
      )}

      <div style={{ borderTop: "1px solid #e2e8f0", color: "#64748b", display: "flex", fontSize: 16, justifyContent: "space-between", paddingTop: 16 }}>
        <div style={{ display: "flex" }}>{data.source}</div>
        <div style={{ display: "flex" }}>pktkr.com{data.path}</div>
      </div>
    </div>
  );
}
