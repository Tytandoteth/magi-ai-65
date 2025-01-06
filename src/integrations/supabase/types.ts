export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          },
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
