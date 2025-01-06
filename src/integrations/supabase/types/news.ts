import { Json } from './base';

/**
 * Represents cryptocurrency news articles and their metadata
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