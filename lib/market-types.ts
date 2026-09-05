export type MarketRow = {
  symbol: string;
  company: string;
  sector: string;
  ldcp: number;
  high: number;
  low: number;
  close: number;
  percentChange: number;
  volume: number;
  marketCap: number;
  downloadedAtUtc: string;
};

export type MarketSession = {
  date: string;
  file: string;
  asOfUtc?: string;
  isClosing?: boolean;
  report?: string;
  marketCloseChart?: string;
  indexClose?: number;
  indexChange?: number | null;
  indexPoints?: number | null;
};

export type MarketIndex = {
  latest: string;
  sessions: MarketSession[];
};

export type TickerHistory = Record<string, number[]>;

export type TickerOhlcvPoint = {
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number;
  volume: number | null;
  change?: number | null;
  percentChange?: number | null;
};
