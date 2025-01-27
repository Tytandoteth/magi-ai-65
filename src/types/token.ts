import { Json } from '@/integrations/supabase/types/base';

// Base token data interface
export interface BaseTokenData {
  name: string;
  symbol: string;
  description?: string;
}

// Market data specific interface
export interface TokenMarketData {
  current_price?: { usd?: number };
  market_cap?: { usd?: number };
  total_volume?: { usd?: number };
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

// Metadata specific interface
export interface TokenMetadata {
  additional_metrics?: {
    market_cap_rank?: number;
    coingecko_score?: number;
    developer_score?: number;
    community_score?: number;
  };
  platforms?: Record<string, string>;
}

// Main token data interface
export interface TokenData extends BaseTokenData {
  market_data?: TokenMarketData;
  metadata?: TokenMetadata;
  protocol_data?: ProtocolData;
  platforms?: Record<string, string>;
}

// Custom error classes
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

// Actions interface
export interface TokenAction {
  type: string;
  payload: {
    symbol: string;
    data?: TokenData;
    error?: string;
  };
}