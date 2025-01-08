export interface TokenData {
  symbol: string;
  name: string;
  decimals: number;
  address?: string;
  chainId?: number;
}

export interface PriceRange {
  low: number;
  high: number;
}

export interface MarketData {
  currentPrice: number;
  priceChange24h: number;
  marketCap: number;
  fullyDilutedValuation: number;
  volume24h: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number;
  priceRanges: {
    '24h': PriceRange;
  };
  priceChangePercentages: {
    '1h': number;
    '24h': number;
    '7d': number;
    '14d': number;
    '30d': number;
    '1y': number | null;
  };
  btcPrice: number;
  btcPriceChange24h: number;
  ethPrice: number;
  ethPriceChange24h: number;
}

export interface TokenMetadata {
  symbol: string;
  commonNames: string[];
  decimals: number;
  chainData: {
    [chainId: number]: {
      address: string;
      verified: boolean;
    };
  };
  marketData?: MarketData;
}