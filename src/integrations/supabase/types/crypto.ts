import { Json } from './base';

export interface CryptoNews {
  Row: {
    id: number
    created_at: string
    title: string
    url: string
    source: string
    published_at: string
    sentiment: number | null
    categories: string[] | null
    raw_data: Json | null
  }
  Insert: {
    id?: number
    created_at?: string
    title: string
    url: string
    source: string
    published_at: string
    sentiment?: number | null
    categories?: string[] | null
    raw_data?: Json | null
  }
  Update: {
    id?: number
    created_at?: string
    title?: string
    url?: string
    source?: string
    published_at?: string
    sentiment?: number | null
    categories?: string[] | null
    raw_data?: Json | null
  }
}

export interface DefiMarketData {
  Row: {
    id: number
    created_at: string
    coin_id: string
    symbol: string
    name: string
    current_price: number | null
    market_cap: number | null
    total_volume: number | null
    price_change_24h: number | null
    price_change_percentage_24h: number | null
    total_value_locked: number | null
    raw_data: Json | null
  }
  Insert: {
    id?: number
    created_at?: string
    coin_id: string
    symbol: string
    name: string
    current_price?: number | null
    market_cap?: number | null
    total_volume?: number | null
    price_change_24h?: number | null
    price_change_percentage_24h?: number | null
    total_value_locked?: number | null
    raw_data?: Json | null
  }
  Update: {
    id?: number
    created_at?: string
    coin_id?: string
    symbol?: string
    name?: string
    current_price?: number | null
    market_cap?: number | null
    total_volume?: number | null
    price_change_24h?: number | null
    price_change_percentage_24h?: number | null
    total_value_locked?: number | null
    raw_data?: Json | null
  }
}