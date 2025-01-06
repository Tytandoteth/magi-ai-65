import { Json } from './base';

export interface MagTokenAnalytics {
  Row: {
    id: number;
    created_at: string;
    price: number | null;
    total_supply: number | null;
    circulating_supply: number | null;
    holders_count: number | null;
    transactions_24h: number | null;
    volume_24h: number | null;
    market_cap: number | null;
    raw_data: Json | null;
  };
  Insert: {
    id?: number;
    created_at?: string;
    price?: number | null;
    total_supply?: number | null;
    circulating_supply?: number | null;
    holders_count?: number | null;
    transactions_24h?: number | null;
    volume_24h?: number | null;
    market_cap?: number | null;
    raw_data?: Json | null;
  };
  Update: {
    id?: number;
    created_at?: string;
    price?: number | null;
    total_supply?: number | null;
    circulating_supply?: number | null;
    holders_count?: number | null;
    transactions_24h?: number | null;
    volume_24h?: number | null;
    market_cap?: number | null;
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

export interface EtherscanScraper {
  Row: {
    id: number;
    created_at: string;
    address: string | null;
    holders: number | null;
  };
  Insert: {
    id?: number;
    created_at?: string;
    address?: string | null;
    holders?: number | null;
  };
  Update: {
    id?: number;
    created_at?: string;
    address?: string | null;
    holders?: number | null;
  };
  Relationships: {
    foreignKeyName: string;
    columns: string[];
    isOneToOne: boolean;
    referencedRelation: string;
    referencedColumns: string[];
  }[];
}