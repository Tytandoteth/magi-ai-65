import { Database as BaseDatabase } from './base';
import { ChatConversation, ChatMessage, AIAgentMetrics } from './chat';
import { CryptoNews, DefiMarketData } from './crypto';
import { MagTokenAnalytics, EtherscanScraper } from './token';

/**
 * Extends the base Database type with specific table definitions
 * This is the main database type used throughout the application
 */
export interface Database extends BaseDatabase {
  public: {
    Tables: {
      chat_conversations: ChatConversation;
      chat_messages: ChatMessage;
      ai_agent_metrics: AIAgentMetrics;
      crypto_news: CryptoNews;
      defi_market_data: DefiMarketData;
      mag_token_analytics: MagTokenAnalytics;
      etherscan_scraper: EtherscanScraper;
      "etherscan scraper": EtherscanScraper;
    };
  };
}

// Re-export types for convenience
export * from './base';
export * from './chat';
export * from './crypto';
export * from './token';