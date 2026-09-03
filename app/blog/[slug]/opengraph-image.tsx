import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

import { getBlogPost, type SocialCard } from "@/lib/blog";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type IndexSession = { date: string; indexClose: number };
type ImageProps = { params: Promise<{ slug: string }> };
type MarketWrapCard = Extract<SocialCard, { type: "market-wrap" }>;
type CompanyBriefingCard = Extract<SocialCard, { type: "company-briefing" }>;

function formatIndex(value: number) {
  return new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(value);
}

function formatIndexDate(value: string) {
  return new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short", timeZone: "Asia/Karachi" }).format(new Date(`${value}T12:00:00+05:00`));
}

async function getMarketChart({ startDate, endDate }: MarketWrapCard) {
  const source = await readFile(path.join(process.cwd(), "public", "data", "index.json"), "utf8");
  const payload = JSON.parse(source) as { sessions: IndexSession[] };
  const sessions = payload.sessions.filter((session) => session.date >= startDate && session.date <= endDate);
  if (sessions.length < 2) throw new Error(`Insufficient index sessions for social card: ${startDate} to ${endDate}`);
  const closes = sessions.map((session) => session.indexClose);
  const start = sessions[0];
  const end = sessions.at(-1)!;
  const rawMin = Math.min(...closes);
  const rawMax = Math.max(...closes);
  const chartMinimum = rawMin - Math.max((rawMax - rawMin) * 0.12, 150);
  const chartMaximum = rawMax + Math.max((rawMax - rawMin) * 0.12, 150);
  const chart = { x: 38, y: 26, width: 1002, height: 250 };
  const point = (session: IndexSession, index: number) => {
    const x = chart.x + (index / (sessions.length - 1)) * chart.width;
    const y = chart.y + ((chartMaximum - session.indexClose) / (chartMaximum - chartMinimum)) * chart.height;
    return `${x},${y}`;
  };

  return {
    start,
    end,
    change: end.indexClose - start.indexClose,
    returnPercent: (end.indexClose / start.indexClose - 1) * 100,
    points: sessions.map(point).join(" "),
    endPoint: point(end, sessions.length - 1).split(",").map(Number),
    chart,
  };
}

function CompanyBriefingImage({ card }: { card: CompanyBriefingCard }) {
  const headline = card.headline?.slice(0, 2) ?? ["Company briefing"];
  const metrics = card.metrics?.slice(0, 4) ?? [];

  return (
    <div style={{ background: "#071525", color: "#f8fafc", display: "flex", flexDirection: "column", height: "100%", padding: "52px 64px", width: "100%" }}>
      <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between" }}>
        <div style={{ alignItems: "center", display: "flex", fontSize: 30, fontWeight: 800, gap: 14 }}>
          <div style={{ alignItems: "center", background: "#e2b654", borderRadius: 14, color: "#071525", display: "flex", fontSize: 21, fontWeight: 900, height: 48, justifyContent: "center", width: 48 }}>pk</div>
          pktkr
        </div>
        <div style={{ background: "#10243b", border: "1px solid #27415f", borderRadius: 999, color: "#b8cae1", display: "flex", fontSize: 18, fontWeight: 700, padding: "10px 18px" }}>Corporate briefing · FY26</div>
      </div>

      <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center" }}>
        <div style={{ color: "#e2b654", display: "flex", fontSize: 28, fontWeight: 800, letterSpacing: "0.08em" }}>{card.eyebrow ?? "pktkr"}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 12 }}>
          {headline.map((line) => (
            <div key={line} style={{ display: "flex", fontSize: 50, fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1.05 }}>{line}</div>
          ))}
        </div>
        {card.description ? <div style={{ color: "#b8cae1", display: "flex", fontSize: 24, lineHeight: 1.35, marginTop: 22 }}>{card.description}</div> : null}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        {metrics.map(({ label, value, note }) => (
          <div key={label} style={{ background: "#10243b", border: "1px solid #27415f", borderRadius: 16, display: "flex", flex: 1, flexDirection: "column", padding: "16px" }}>
            <div style={{ color: "#9db4ce", display: "flex", fontSize: 14, fontWeight: 700 }}>{label}</div>
            <div style={{ display: "flex", fontSize: 25, fontWeight: 800, marginTop: 7 }}>{value}</div>
            {note ? <div style={{ color: "#e2b654", display: "flex", fontSize: 12, fontWeight: 700, marginTop: 4 }}>{note}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function OpenGraphImage({ params }: ImageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  const socialCard = post?.socialCard;
  const marketCard = socialCard?.type === "market-wrap" ? socialCard : null;
  const articleCard = socialCard?.type === "article" ? socialCard : null;
  const chart = marketCard ? await getMarketChart(marketCard) : null;
  const title = post?.title ?? "pktkr Blog";
  const summary = post?.summary ?? "Data-backed views of Pakistan's stock market.";
  const cardTitle = articleCard?.headline?.join(" ") ?? title;
  const cardSummary = articleCard?.description ?? summary;

  if (socialCard?.type === "company-briefing") return new ImageResponse(<CompanyBriefingImage card={socialCard} />, size);

  return new ImageResponse(
    <div style={{ background: "#f7f9fc", color: "#0f172a", display: "flex", flexDirection: "column", height: "100%", padding: "48px 64px", width: "100%" }}>
      <div style={{ alignItems: "center", color: "#203a63", display: "flex", fontSize: 30, fontWeight: 800, gap: 14 }}>
        <div style={{ alignItems: "center", background: "#203a63", borderRadius: 14, color: "white", display: "flex", fontSize: 21, fontWeight: 800, height: 48, justifyContent: "center", width: 48 }}>pk</div>
        pktkr <span style={{ color: "#64748b", fontSize: 20, fontWeight: 600 }}>Market wrap</span>
      </div>

      {chart ? (
        <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "space-between", marginTop: 30 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ color: "#475569", display: "flex", fontSize: 24, fontWeight: 600 }}>{marketCard?.label}</div>
              <div style={{ color: "#203a63", display: "flex", fontSize: 42, fontWeight: 800, letterSpacing: "-0.035em", marginTop: 4 }}>{formatIndex(chart.end.indexClose)}</div>
            </div>
            <div style={{ alignItems: "flex-end", display: "flex", flexDirection: "column" }}>
              <div style={{ color: "#64748b", display: "flex", fontSize: 20, fontWeight: 600 }}>Monthly return</div>
              <div style={{ color: "#176b63", display: "flex", fontSize: 44, fontWeight: 800, letterSpacing: "-0.035em" }}>+{chart.returnPercent.toFixed(2)}%</div>
              <div style={{ color: "#64748b", display: "flex", fontSize: 19 }}>+{formatIndex(chart.change)} points</div>
            </div>
          </div>
          <svg height="305" viewBox="0 0 1080 305" width="1080">
            <line x1="38" x2="1040" y1="276" y2="276" stroke="#cbd5e1" strokeWidth="2" />
            <polyline fill="none" points={chart.points} stroke="#203a63" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7" />
            <circle cx={chart.endPoint[0]} cy={chart.endPoint[1]} fill="#176b63" r="9" stroke="#ffffff" strokeWidth="4" />
          </svg>
          <div style={{ color: "#64748b", display: "flex", fontSize: 18, justifyContent: "space-between", marginTop: -4 }}>
            <span>{formatIndexDate(marketCard!.startDate)} · {formatIndex(chart.start.indexClose)}</span>
            <span>{formatIndexDate(marketCard!.endDate)} · {formatIndex(chart.end.indexClose)}</span>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center" }}>
          <div style={{ color: "#203a63", display: "flex", fontSize: 56, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.08 }}>{cardTitle}</div>
          <div style={{ color: "#58749b", display: "flex", fontSize: 27, lineHeight: 1.35, marginTop: 24 }}>{cardSummary}</div>
        </div>
      )}
    </div>,
    size,
  );
}
