import { ImageResponse } from "next/og";

import { getItExportData } from "@/lib/economy/it-export-data";

export const alt = "Pakistan computer-services exports from FY2020 to FY2025";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const data = await getItExportData();
  const annual = data.filter((row) => row.period.startsWith("FY") && !row.period.includes("YTD"));
  const maxValue = Math.ceil(Math.max(...annual.map((row) => row.computerServices)) / 500) * 500;

  return new ImageResponse(
    (
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
            <div
              style={{
                alignItems: "center",
                background: "#203a63",
                borderRadius: 14,
                color: "white",
                display: "flex",
                fontSize: 22,
                fontWeight: 800,
                height: 48,
                justifyContent: "center",
                width: 48,
              }}
            >
              pk
            </div>
            <div style={{ display: "flex", fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em" }}>pktkr</div>
          </div>
          <div style={{ color: "#58749b", display: "flex", fontSize: 18, fontWeight: 700 }}>PAKISTAN ECONOMY · EXPORTS</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 30 }}>
          <div style={{ display: "flex", fontSize: 42, fontWeight: 800, letterSpacing: "-0.045em" }}>
            Pakistan IT exports are becoming material.
          </div>
          <div style={{ color: "#64748b", display: "flex", fontSize: 21, marginTop: 8 }}>
            Computer-services exports · million USD · fiscal year
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, marginTop: 24 }}>
          <div
            style={{
              color: "#94a3b8",
              display: "flex",
              flexDirection: "column",
              fontSize: 15,
              justifyContent: "space-between",
              paddingBottom: 34,
              paddingTop: 4,
              width: 58,
            }}
          >
            {[maxValue, maxValue / 2, 0].map((value) => (
              <div key={value} style={{ display: "flex" }}>${value.toLocaleString()}M</div>
            ))}
          </div>
          <div
            style={{
              borderBottom: "2px solid #cbd5e1",
              display: "flex",
              flex: 1,
              gap: 24,
              height: 250,
              justifyContent: "space-around",
              padding: "0 22px",
            }}
          >
            {annual.map((row) => {
              const barHeight = Math.max(12, (row.computerServices / maxValue) * 210);
              return (
                <div
                  key={row.period}
                  style={{ alignItems: "center", display: "flex", flex: 1, flexDirection: "column", justifyContent: "flex-end" }}
                >
                  <div style={{ color: "#315a8a", display: "flex", fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
                    ${Math.round(row.computerServices).toLocaleString()}M
                  </div>
                  <div style={{ background: row.period === "FY2025" ? "#0f766e" : "#315a8a", height: barHeight, width: 72 }} />
                  <div style={{ color: "#475569", display: "flex", fontSize: 16, marginTop: 10 }}>{row.period}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ borderTop: "1px solid #e2e8f0", color: "#64748b", display: "flex", fontSize: 16, justifyContent: "space-between", paddingTop: 16 }}>
          <div style={{ display: "flex" }}>Source: State Bank of Pakistan</div>
          <div style={{ display: "flex" }}>pktkr.com/econ/it-exports</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
