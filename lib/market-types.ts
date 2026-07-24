export type MarketRow = {
  symbol: string;
  company: string;
  sector: string;
  close: number;
  percentChange: number;
  volume: number;
  marketCap: number;
  downloadedAtUtc: string;
};

export type MarketSession = {
  date: string;
  file: string;
  report?: string;
};

export type MarketIndex = {
  latest: string;
  sessions: MarketSession[];
};
