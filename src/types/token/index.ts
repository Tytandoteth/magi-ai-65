// Base interfaces
export interface BaseTokenData {
  name: string;
  symbol: string;
  description?: string;
}

// Market specific data
export interface MarketData {
  current_price?: { usd?: number };
  market_cap?: { usd?: number };
  total_volume?: { usd?: number };
  price_change_24h?: number;
  price_change_percentage_24h?: number;
}

// Protocol specific data
export interface ProtocolData {
  tvl?: number;
  change_24h?: number;
  category?: string;
  chains?: string[];
  apy?: number;
}

// Metadata interface
export interface TokenMetadata {
  additional_metrics?: {
    market_cap_rank?: number;
  };
}

// Combined token data
export interface TokenData extends BaseTokenData {
  market_data?: MarketData;
  metadata?: TokenMetadata;
  protocol_data?: ProtocolData;
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