import { Json } from './base';

export interface Database {
  public: {
    Tables: {
      ai_agent_metrics: {
        Row: {
          completion_tokens: number | null
          context_tokens: number | null
          created_at: string
          effectiveness_score: number | null
          feedback: Json | null
          id: number
          market_context: Json | null
          message_id: number | null
          response_time_ms: number | null
          tokens_total: number | null
        }
        Insert: {
          completion_tokens?: number | null
          context_tokens?: number | null
          created_at?: string
          effectiveness_score?: number | null
          feedback?: Json | null
          id?: number
          market_context?: Json | null
          message_id?: number | null
          response_time_ms?: number | null
          tokens_total?: number | null
        }
        Update: {
          completion_tokens?: number | null
          context_tokens?: number | null
          created_at?: string
          effectiveness_score?: number | null
          feedback?: Json | null
          id?: number
          market_context?: Json | null
          message_id?: number | null
          response_time_ms?: number | null
          tokens_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_agent_metrics_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_conversations: {
        Row: {
          context: Json | null
          created_at: string
          id: number
          metadata: Json | null
          user_session_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: number
          metadata?: Json | null
          user_session_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: number
          metadata?: Json | null
          user_session_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: number | null
          created_at: string
          id: number
          metadata: Json | null
          role: string
          tokens_used: number | null
        }
        Insert: {
          content: string
          conversation_id?: number | null
          created_at?: string
          id?: number
          metadata?: Json | null
          role: string
          tokens_used?: number | null
        }
        Update: {
          content?: string
          conversation_id?: number | null
          created_at?: string
          id?: number
          metadata?: Json | null
          role?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_news: {
        Row: {
          categories: string[] | null
          created_at: string
          id: number
          published_at: string
          raw_data: Json | null
          sentiment: number | null
          source: string
          title: string
          url: string
        }
        Insert: {
          categories?: string[] | null
          created_at?: string
          id?: number
          published_at: string
          raw_data?: Json | null
          sentiment?: number | null
          source: string
          title: string
          url: string
        }
        Update: {
          categories?: string[] | null
          created_at?: string
          id?: number
          published_at?: string
          raw_data?: Json | null
          sentiment?: number | null
          source?: string
          title?: string
          url?: string
        }
        Relationships: []
      }
      defi_llama_news: {
        Row: {
          category: string | null
          created_at: string
          id: number
          link: string
          published_at: string
          raw_data: Json | null
          sentiment: number | null
          source: string
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: number
          link: string
          published_at: string
          raw_data?: Json | null
          sentiment?: number | null
          source: string
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: number
          link?: string
          published_at?: string
          raw_data?: Json | null
          sentiment?: number | null
          source?: string
          title?: string
        }
        Relationships: []
      }
      defi_llama_protocols: {
        Row: {
          category: string | null
          change_1d: number | null
          change_1h: number | null
          change_7d: number | null
          created_at: string
          derivatives: number | null
          id: number
          name: string
          protocol_id: string
          raw_data: Json | null
          staking: number | null
          symbol: string | null
          tvl: number | null
        }
        Insert: {
          category?: string | null
          change_1d?: number | null
          change_1h?: number | null
          change_7d?: number | null
          created_at?: string
          derivatives?: number | null
          id?: number
          name: string
          protocol_id: string
          raw_data?: Json | null
          staking?: number | null
          symbol?: string | null
          tvl?: number | null
        }
        Update: {
          category?: string | null
          change_1d?: number | null
          change_1h?: number | null
          change_7d?: number | null
          created_at?: string
          derivatives?: number | null
          id?: number
          name?: string
          protocol_id?: string
          raw_data?: Json | null
          staking?: number | null
          symbol?: string | null
          tvl?: number | null
        }
        Relationships: []
      }
      defi_market_data: {
        Row: {
          coin_id: string
          created_at: string
          current_price: number | null
          id: number
          market_cap: number | null
          name: string
          price_change_24h: number | null
          price_change_percentage_24h: number | null
          raw_data: Json | null
          symbol: string
          total_value_locked: number | null
          total_volume: number | null
        }
        Insert: {
          coin_id: string
          created_at?: string
          current_price?: number | null
          id?: number
          market_cap?: number | null
          name: string
          price_change_24h?: number | null
          price_change_percentage_24h?: number | null
          raw_data?: Json | null
          symbol: string
          total_value_locked?: number | null
          total_volume?: number | null
        }
        Update: {
          coin_id?: string
          created_at?: string
          current_price?: number | null
          id?: number
          market_cap?: number | null
          name?: string
          price_change_24h?: number | null
          price_change_percentage_24h?: number | null
          raw_data?: Json | null
          symbol?: string
          total_value_locked?: number | null
          total_volume?: number | null
        }
        Relationships: []
      }
      defi_market_data_partitioned: {
        Row: {
          coin_id: string
          created_at: string
          current_price: number | null
          id: number
          market_cap: number | null
          name: string
          price_change_24h: number | null
          price_change_percentage_24h: number | null
          raw_data: Json | null
          symbol: string
          total_value_locked: number | null
          total_volume: number | null
        }
        Insert: {
          coin_id: string
          created_at: string
          current_price?: number | null
          id: number
          market_cap?: number | null
          name: string
          price_change_24h?: number | null
          price_change_percentage_24h?: number | null
          raw_data?: Json | null
          symbol: string
          total_value_locked?: number | null
          total_volume?: number | null
        }
        Update: {
          coin_id?: string
          created_at?: string
          current_price?: number | null
          id?: number
          market_cap?: number | null
          name?: string
          price_change_24h?: number | null
          price_change_percentage_24h?: number | null
          raw_data?: Json | null
          symbol?: string
          total_value_locked?: number | null
          total_volume?: number | null
        }
        Relationships: []
      }
      defi_market_data_y2024m01: {
        Row: {
          coin_id: string
          created_at: string
          current_price: number | null
          id: number
          market_cap: number | null
          name: string
          price_change_24h: number | null
          price_change_percentage_24h: number | null
          raw_data: Json | null
          symbol: string
          total_value_locked: number | null
          total_volume: number | null
        }
        Insert: {
          coin_id: string
          created_at: string
          current_price?: number | null
          id: number
          market_cap?: number | null
          name: string
          price_change_24h?: number | null
          price_change_percentage_24h?: number | null
          raw_data?: Json | null
          symbol: string
          total_value_locked?: number | null
          total_volume?: number | null
        }
        Update: {
          coin_id?: string
          created_at?: string
          current_price?: number | null
          id?: number
          market_cap?: number | null
          name?: string
          price_change_24h?: number | null
          price_change_percentage_24h?: number | null
          raw_data?: Json | null
          symbol?: string
          total_value_locked?: number | null
          total_volume?: number | null
        }
        Relationships: []
      }
      defi_market_data_y2024m02: {
        Row: {
          coin_id: string
          created_at: string
          current_price: number | null
          id: number
          market_cap: number | null
          name: string
          price_change_24h: number | null
          price_change_percentage_24h: number | null
          raw_data: Json | null
          symbol: string
          total_value_locked: number | null
          total_volume: number | null
        }
        Insert: {
          coin_id: string
          created_at: string
          current_price?: number | null
          id: number
          market_cap?: number | null
          name: string
          price_change_24h?: number | null
          price_change_percentage_24h?: number | null
          raw_data?: Json | null
          symbol: string
          total_value_locked?: number | null
          total_volume?: number | null
        }
        Update: {
          coin_id?: string
          created_at?: string
          current_price?: number | null
          id?: number
          market_cap?: number | null
          name?: string
          price_change_24h?: number | null
          price_change_percentage_24h?: number | null
          raw_data?: Json | null
          symbol?: string
          total_value_locked?: number | null
          total_volume?: number | null
        }
        Relationships: []
      }
      "etherscan scraper": {
        Row: {
          address: string | null
          created_at: string
          holders: number | null
          id: number
        }
        Insert: {
          address?: string | null
          created_at?: string
          holders?: number | null
          id?: number
        }
        Update: {
          address?: string | null
          created_at?: string
          holders?: number | null
          id?: number
        }
        Relationships: []
      }
      etherscan_scraper: {
        Row: {
          address: string | null
          created_at: string
          holders: number | null
          id: number
        }
        Insert: {
          address?: string | null
          created_at?: string
          holders?: number | null
          id?: number
        }
        Update: {
          address?: string | null
          created_at?: string
          holders?: number | null
          id?: number
        }
        Relationships: []
      }
      mag_token_analytics: {
        Row: {
          circulating_supply: number | null
          created_at: string
          holders_count: number | null
          id: number
          market_cap: number | null
          price: number | null
          raw_data: Json | null
          total_supply: number | null
          transactions_24h: number | null
          volume_24h: number | null
        }
        Insert: {
          circulating_supply?: number | null
          created_at?: string
          holders_count?: number | null
          id?: number
          market_cap?: number | null
          price?: number | null
          raw_data?: Json | null
          total_supply?: number | null
          transactions_24h?: number | null
          volume_24h?: number | null
        }
        Update: {
          circulating_supply?: number | null
          created_at?: string
          holders_count?: number | null
          id?: number
          market_cap?: number | null
          price?: number | null
          raw_data?: Json | null
          total_supply?: number | null
          transactions_24h?: number | null
          volume_24h?: number | null
        }
        Relationships: []
      }
      token_metadata: {
        Row: {
          categories: string[] | null
          coingecko_id: string | null
          created_at: string
          description: string | null
          id: number
          last_updated: string | null
          market_data: Json | null
          metadata: Json | null
          name: string
          platforms: Json | null
          symbol: string
        }
        Insert: {
          categories?: string[] | null
          coingecko_id?: string | null
          created_at?: string
          description?: string | null
          id?: number
          last_updated?: string | null
          market_data?: Json | null
          metadata?: Json | null
          name: string
          platforms?: Json | null
          symbol: string
        }
        Update: {
          categories?: string[] | null
          coingecko_id?: string | null
          created_at?: string
          description?: string | null
          id?: number
          last_updated?: string | null
          market_data?: Json | null
          metadata?: Json | null
          name?: string
          platforms?: Json | null
          symbol?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
