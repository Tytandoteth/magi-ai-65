export interface BaseMetric {
  name: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  changePercent?: number;
}

export interface TokenData {
  name: string;
  symbol: string;
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  metrics: BaseMetric[];
}

export interface ProtocolData {
  name: string;
  tvl: number;
  apy: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  metrics: BaseMetric[];
}

export interface MarketData {
  marketCondition: string;
  totalMarketCap: number;
  volume24h: number;
  btcDominance: number;
  keyMetrics: BaseMetric[];
  analysis: string;
}

export interface DefiData {
  name: string;
  tvl: number;
  apy: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  details: string;
  considerations: string[];
  metrics: BaseMetric[];
}

export type ResponseType = 'token' | 'market' | 'defi' | 'general';