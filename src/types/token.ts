import { Json } from '@/integrations/supabase/types/base';

export interface TokenData {
  name: string;
  symbol: string;
  market_data?: {
    current_price?: { usd?: number };
    market_cap?: { usd?: number };
    total_volume?: { usd?: number };
    price_change_percentage_24h?: number;
  };
  metadata?: {
    additional_metrics?: {
      market_cap_rank?: number;
    };
  };
  description?: string;
}

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

export interface ProtocolData {
  tvl?: number;
  change_1d?: number;
  category?: string;
  name?: string;
}

export interface TokenResponse {
  success: boolean;
  data?: TokenData;
  protocolData?: ProtocolData;
  error?: string;
}