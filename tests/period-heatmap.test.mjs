import assert from "node:assert/strict";
import test from "node:test";

import { buildPeriodHeatmap, periodStartDate } from "../lib/period-heatmap.ts";

test("the window is measured in calendar days", () => {
  assert.equal(periodStartDate("2026-10-30", 7), "2026-10-24");
  assert.equal(periodStartDate("2026-10-30", 120), "2026-07-03");
});

test("returns use one common pair of adjusted closing dates", () => {
  const endRows = [
    { symbol: "AAA", company: "Alpha", sector: "BANKS", marketCap: 1000 },
    { symbol: "BBB", company: "Beta", sector: "CEMENT", marketCap: 2000 },
    { symbol: "NEW", company: "New", sector: "CEMENT", marketCap: 3000 },
  ];
  const histories = new Map([
    ["AAA", [{ date: "2026-10-26", close: 10 }, { date: "2026-10-30", close: 12 }]],
    ["BBB", [{ date: "2026-10-26", close: 20 }, { date: "2026-10-30", close: 18 }]],
    ["NEW", [{ date: "2026-10-28", close: 30 }, { date: "2026-10-30", close: 33 }]],
  ]);

  const result = buildPeriodHeatmap(endRows, histories, "2026-10-30", 7);

  assert.equal(result.actualStart, "2026-10-26");
  assert.deepEqual(result.rows.map((row) => row.symbol), ["AAA", "BBB"]);
  assert.ok(Math.abs(result.rows[0].returnPercent - 20) < 1e-9);
  assert.ok(Math.abs(result.rows[1].returnPercent + 10) < 1e-9);
  assert.deepEqual(result.omittedSymbols, ["NEW"]);
});
