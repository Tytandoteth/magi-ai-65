import { Database as BaseDatabase } from './base';
import { ChatConversation, ChatMessage, AIAgentMetrics } from './chat';
import { CryptoNews, DefiMarketData } from './crypto';
import { MagTokenAnalytics, EtherscanScraper } from './token';

export interface Database extends BaseDatabase {
  public: {
    Tables: {
      chat_conversations: ChatConversation
      chat_messages: ChatMessage
      ai_agent_metrics: AIAgentMetrics
      crypto_news: CryptoNews
      defi_market_data: DefiMarketData
      mag_token_analytics: MagTokenAnalytics
      etherscan_scraper: EtherscanScraper
      "etherscan scraper": EtherscanScraper
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

export type * from './base';
export type * from './chat';
export type * from './crypto';
export type * from './token';