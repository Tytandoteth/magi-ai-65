import { Database as BaseDatabase } from './base';
import { ChatConversation, ChatMessage } from './chat';
import { CryptoNews } from './news';
import { AIAgentMetrics } from './metrics';
import { DefiMarketData, DefiMarketDataPartitioned, DefiMarketDataY2024M01, DefiMarketDataY2024M02 } from './market';
import { MagTokenAnalytics, EtherscanScraper } from './token';

/**
 * Extends the base Database type with specific table definitions
 */
export interface Database extends BaseDatabase {
  public: {
    Tables: {
      chat_conversations: ChatConversation;
      chat_messages: ChatMessage;
      ai_agent_metrics: AIAgentMetrics;
      crypto_news: CryptoNews;
      defi_market_data: DefiMarketData;
      defi_market_data_partitioned: DefiMarketDataPartitioned;
      defi_market_data_y2024m01: DefiMarketDataY2024M01;
      defi_market_data_y2024m02: DefiMarketDataY2024M02;
      mag_token_analytics: MagTokenAnalytics;
      etherscan_scraper: EtherscanScraper;
      "etherscan scraper": EtherscanScraper;
    };
  };
}

// Re-export all types for convenience
export * from './base';
export * from './chat';
export * from './news';
export * from './metrics';
export * from './market';
export * from './token';