import { Json } from './base';

/**
 * Represents cryptocurrency news articles and their metadata
 * @property Row - The data structure for reading news records
 * @property Insert - The data structure for inserting new news articles
 * @property Update - The data structure for updating existing news articles
 */
export interface CryptoNews {
  Row: {
    id: number;
    created_at: string;
    title: string;
    url: string;
    source: string;
    published_at: string;
    sentiment: number | null;
    categories: string[] | null;
    raw_data: Json | null;
  };
  Insert: {
    id?: number;
    created_at?: string;
    title: string;
    url: string;
    source: string;
    published_at: string;
    sentiment?: number | null;
    categories?: string[] | null;
    raw_data?: Json | null;
  };
  Update: {
    id?: number;
    created_at?: string;
    title?: string;
    url?: string;
    source?: string;
    published_at?: string;
    sentiment?: number | null;
    categories?: string[] | null;
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
 * Represents DeFi market data for various cryptocurrencies
 * @property Row - The data structure for reading market data records
 * @property Insert - The data structure for inserting new market data
 * @property Update - The data structure for updating existing market data
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
