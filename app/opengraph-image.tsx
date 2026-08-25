import { ImageResponse } from "next/og";

export const alt = "pktkr — Pakistan market and economy data";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#f7f9fc",
          color: "#203a63",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "72px 80px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              alignItems: "center",
              background: "#203a63",
              borderRadius: 22,
              color: "white",
              display: "flex",
              fontSize: 34,
              fontWeight: 800,
              height: 76,
              justifyContent: "center",
              width: 76,
            }}
          >
            pk
          </div>
          <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: "-0.04em" }}>
            pktkr
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 66, fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1.05 }}>
            Pakistan, in data.
          </div>
          <div style={{ color: "#58749b", fontSize: 28 }}>
            Stocks · Economy · Trade · Exports
          </div>
        </div>
        <div style={{ color: "#64748b", fontSize: 22 }}>
          Clear views of the KSE-100 and the forces shaping Pakistan’s economy.
        </div>
      </div>
    ),
    { ...size },
  );
}
