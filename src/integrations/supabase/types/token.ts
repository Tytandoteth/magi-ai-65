import { Json } from './base';

/**
 * Represents analytics data for the MAG token
 * @property Row - The data structure for reading token analytics records
 * @property Insert - The data structure for inserting new analytics data
 * @property Update - The data structure for updating existing analytics data
 */
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
    raw_data?: number | null;
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
 * Represents data from Etherscan blockchain explorer
 * @property Row - The data structure for reading Etherscan data records
 * @property Insert - The data structure for inserting new Etherscan data
 * @property Update - The data structure for updating existing Etherscan data
 */
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