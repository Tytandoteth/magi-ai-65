import { HighLevelAction } from "@/types/actions";
import { supabase } from "@/integrations/supabase/client";
import { TokenService } from "@/services/token/TokenService";

export class LowLevelPlanner {
  private tokenService: TokenService;

  constructor() {
    this.tokenService = TokenService.getInstance();
  }

  async executeTask(action: HighLevelAction, context: any): Promise<string> {
    console.log('Executing task:', action.type, 'with context:', context);

    try {
      switch (action.type) {
        case 'TOKEN_INFO':
          return await this.tokenService.getTokenInfo(action.params.symbol);

        case 'DEFI_TVL_RANKING':
          return await this.getTopDefiProtocols();

        case 'MARKET_ANALYSIS':
          return await this.getMarketAnalysis();

        case 'CRYPTO_NEWS':
          return await this.getLatestNews();

        case 'DEFI_STRATEGIES':
          return await this.getDefiStrategies();

        default:
          return "I'm not sure how to handle that just yet. Try asking about specific tokens (e.g., $MAG, $ETH) or market data!";
      }
    } catch (error) {
      console.error('Error executing task:', error);
      throw error;
    }
  }

  private async getTopDefiProtocols(): Promise<string> {
    const { data: protocols, error } = await supabase
      .from('defi_llama_protocols')
      .select('*')
      .order('tvl', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching DeFi protocols:', error);
      throw error;
    }

    if (!protocols.length) {
      return "I couldn't find any DeFi protocol data at the moment. Please try again later.";
    }

    let response = "🏆 Top DeFi Protocols by TVL:\n\n";
    protocols.forEach((protocol, index) => {
      response += `${index + 1}. ${protocol.name}\n`;
      response += `   💰 TVL: $${protocol.tvl?.toLocaleString()}\n`;
      response += `   📊 24h Change: ${protocol.change_1d?.toFixed(2)}%\n`;
      if (protocol.category) {
        response += `   🏷️ Category: ${protocol.category}\n`;
      }
      response += '\n';
    });

    return response;
  }

  private async getMarketAnalysis(): Promise<string> {
    const { data: marketData, error } = await supabase
      .from('defi_market_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching market data:', error);
      throw error;
    }

    if (!marketData.length) {
      return "I couldn't fetch the latest market data. Please try again later.";
    }

    let response = "📊 Current Market Analysis:\n\n";
    marketData.forEach(token => {
      response += `${token.name} (${token.symbol})\n`;
      response += `💵 Price: $${token.current_price?.toLocaleString()}\n`;
      response += `📈 24h Change: ${token.price_change_percentage_24h?.toFixed(2)}%\n\n`;
    });

    return response;
  }

  private async getLatestNews(): Promise<string> {
    const { data: news, error } = await supabase
      .from('crypto_news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching crypto news:', error);
      throw error;
    }

    if (!news.length) {
      return "I couldn't fetch the latest crypto news. Please try again later.";
    }

    let response = "📰 Latest Crypto Developments:\n\n";
    news.forEach((item, index) => {
      response += `${index + 1}. ${item.title}\n`;
      response += `   🔗 Source: ${item.source}\n`;
      response += `   📅 Published: ${new Date(item.published_at).toLocaleDateString()}\n\n`;
    });

    return response;
  }

  private async getDefiStrategies(): Promise<string> {
    const { data: protocols, error } = await supabase
      .from('defi_llama_protocols')
      .select('*')
      .order('tvl', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching DeFi protocols:', error);
      throw error;
    }

    if (!protocols.length) {
      return "I couldn't fetch DeFi strategy data at the moment. Please try again later.";
    }

    let response = "💎 Top DeFi Opportunities:\n\n";
    protocols.forEach((protocol, index) => {
      response += `${index + 1}. ${protocol.name}\n`;
      response += `   💰 Total Value Locked: $${protocol.tvl?.toLocaleString()}\n`;
      if (protocol.staking) {
        response += `   🔒 Staking Available: $${protocol.staking?.toLocaleString()}\n`;
      }
      response += `   📊 24h Change: ${protocol.change_1d?.toFixed(2)}%\n`;
      response += `   🏷️ Category: ${protocol.category || 'Various'}\n\n`;
    });

    response += "\n⚠️ IMPORTANT: DeFi investments carry significant risks. Always conduct thorough research and never invest more than you can afford to lose.";

    return response;
  }
}