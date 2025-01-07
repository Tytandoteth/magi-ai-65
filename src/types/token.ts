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

// Metadata specific interface
export interface TokenMetadata {
  additional_metrics?: {
    market_cap_rank?: number;
    coingecko_score?: number;
    developer_score?: number;
    community_score?: number;
  };
}

// Main token data interface
export interface TokenData extends BaseTokenData {
  market_data?: TokenMarketData;
  metadata?: TokenMetadata;
}

// Raw data from database
export interface RawTokenData {
  id: number;
  created_at: string;
  symbol: string;
  name: string;
  coingecko_id: string | null;
  description: string | null;
  categories: string[] | null;
  platforms: Json | null;
  market_data: Json | null;
  last_updated: string | null;
  metadata: Json | null;
}

// Protocol specific data
export interface ProtocolData {
  tvl?: number;
  change_1d?: number;
  category?: string;
  name?: string;
  chains?: string[];
  apy?: number;
}

// Combined response interface
export interface TokenResponse {
  success: boolean;
  data?: TokenData;
  protocolData?: ProtocolData;
  error?: string;
}