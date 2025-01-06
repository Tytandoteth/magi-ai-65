import { Json } from './base';

/**
 * Represents DeFi market data for various cryptocurrencies
 */
export interface DefiMarketData {
  Row: {
    id: number;
    created_at: string;
    coin_id: string;
    symbol: string;
    name: string;
    current_price: number | null;
    market_cap: number | null;
    total_volume: number | null;
    price_change_24h: number | null;
    price_change_percentage_24h: number | null;
    total_value_locked: number | null;
    raw_data: Json | null;
  };
  Insert: {
    id?: number;
    created_at?: string;
    coin_id: string;
    symbol: string;
    name: string;
    current_price?: number | null;
    market_cap?: number | null;
    total_volume?: number | null;
    price_change_24h?: number | null;
    price_change_percentage_24h?: number | null;
    total_value_locked?: number | null;
    raw_data?: Json | null;
  };
  Update: {
    id?: number;
    created_at?: string;
    coin_id?: string;
    symbol?: string;
    name?: string;
    current_price?: number | null;
    market_cap?: number | null;
    total_volume?: number | null;
    price_change_24h?: number | null;
    price_change_percentage_24h?: number | null;
    total_value_locked?: number | null;
    raw_data?: Json | null;
  };
  Relationships: {
    foreignKeyName: string;
    columns: string[];
    isOneToOne: boolean;
    referencedRelation: string;
    referencedColumns: string[];
  }[];
}

/**
 * Represents partitioned DeFi market data
 */
export interface DefiMarketDataPartitioned extends DefiMarketData {}
export interface DefiMarketDataY2024M01 extends DefiMarketData {}
export interface DefiMarketDataY2024M02 extends DefiMarketData {}