// Base interfaces
export interface BaseTokenData {
  name: string;
  symbol: string;
  description?: string;
}

// Market specific data
export interface MarketData {
  currentPrice?: number;
  marketCap?: number;
  totalVolume?: number;
  priceChange24h?: number;
  priceChangePercentage24h?: number;
}

// Protocol specific data
export interface ProtocolData {
  tvl?: number;
  change24h?: number;
  category?: string;
  name?: string;
  chains?: string[];
  apy?: number;
}

// Combined token data
export interface TokenData extends BaseTokenData {
  marketData?: MarketData;
  protocolData?: ProtocolData;
  metadata?: {
    marketCapRank?: number;
    score?: number;
  };
}

// Custom error types
export class TokenError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'TokenError';
  }
}

export class TokenNotFoundError extends TokenError {
  constructor(symbol: string) {
    super(`Token ${symbol} not found`, 'TOKEN_NOT_FOUND');
    this.name = 'TokenNotFoundError';
  }
}

export class TokenFetchError extends TokenError {
  constructor(symbol: string, details?: string) {
    super(
      `Failed to fetch data for token ${symbol}${details ? `: ${details}` : ''}`,
      'TOKEN_FETCH_ERROR'
    );
    this.name = 'TokenFetchError';
  }
}