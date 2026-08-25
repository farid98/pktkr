import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";

const DATA_ROOT = path.join(process.cwd(), "public", "data", "econ");

export async function readEconomyCsv(relativePath: string): Promise<Record<string, string>[]> {
  const csv = await readFile(path.join(DATA_ROOT, relativePath), "utf8");
  return parse(csv, { columns: true, skip_empty_lines: true, trim: true }) as Record<string, string>[];
}
