import { Message } from "@/types/chat";
import { HighLevelAction } from "@/types/actions";

export class HighLevelPlanner {
  async planAction(messages: Message[]): Promise<HighLevelAction> {
    const lastMessage = messages[messages.length - 1];
    console.log('Planning action for message:', lastMessage.content);
    
    const content = lastMessage.content.toLowerCase();

    // Token info request
    if (content.includes('$') || content.includes('tell me about')) {
      const symbol = content.includes('$') ? 
        content.split('$')[1].split(' ')[0].toUpperCase() :
        content.split('tell me about')[1].trim().toUpperCase();
      
      console.log('Detected token info request for:', symbol);
      return {
        type: 'TOKEN_INFO',
        params: { symbol }
      };
    }

    // DeFi TVL request
    if (content.includes('tvl') || content.includes('top defi protocols')) {
      console.log('Detected TVL ranking request');
      return {
        type: 'DEFI_TVL_RANKING',
        params: {}
      };
    }

    // Market analysis request
    if (content.includes('market') && (content.includes('analysis') || content.includes('conditions'))) {
      console.log('Detected market analysis request');
      return {
        type: 'MARKET_ANALYSIS',
        params: {}
      };
    }

    // Latest crypto news request
    if (content.includes('latest') || content.includes('news') || content.includes('developments')) {
      console.log('Detected crypto news request');
      return {
        type: 'CRYPTO_NEWS',
        params: {}
      };
    }

    // DeFi strategies request
    if (content.includes('strategies') || content.includes('yield')) {
      console.log('Detected DeFi strategies request');
      return {
        type: 'DEFI_STRATEGIES',
        params: {}
      };
    }

    console.log('No specific action type detected, defaulting to unknown');
    return {
      type: 'UNKNOWN',
      params: {}
    };
  }
}