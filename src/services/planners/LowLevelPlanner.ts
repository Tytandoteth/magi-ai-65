import { TokenService } from "../token/TokenService";
import { HighLevelAction } from "@/types/actions";
import { Message } from "@/types/chat";
import { onChainTools } from "@/integrations/goat/tools";

export class LowLevelPlanner {
  private tokenService: TokenService;

  constructor() {
    console.log('[LowLevelPlanner] Initializing');
    this.tokenService = TokenService.getInstance();
  }

  async executeTask(action: HighLevelAction, params: {
    messages: Message[];
    token?: string;
    percentage?: string;
  }): Promise<string> {
    console.log('[LowLevelPlanner] Executing task:', { 
      actionType: action.type,
      params: action.params,
      messageCount: params.messages.length 
    });

    if (action.type === 'BLOCKCHAIN_ACTION' && action.params) {
      console.log('[LowLevelPlanner] Executing blockchain action:', action.params);
      try {
        const result = await onChainTools.executeAction({
          type: action.params.actionType,
          params: {
            to: action.params.to,
            value: action.params.value,
            token: action.params.token
          }
        });

        console.log('[LowLevelPlanner] Blockchain action result:', {
          success: result.status === 'success',
          hash: result.hash
        });

        if (result.status === 'success') {
          return `🎉 Success! Your transaction was completed.\nHere's the hash for reference: ${result.hash}`;
        } else {
          return `😔 Uh-oh! The transaction didn't go through. Let's double-check everything and try again.`;
        }
      } catch (error: any) {
        console.error('[LowLevelPlanner] Blockchain action error:', {
          error: error.message,
          params: action.params
        });
        return `😔 Failed to execute transaction: ${error.message}. Let's try again!`;
      }
    }

    if (action.type === 'GET_TOKEN_INFO' && action.params?.symbol) {
      console.log('[LowLevelPlanner] Fetching token info for:', action.params.symbol);
      try {
        const response = await this.tokenService.getTokenInfo(action.params.symbol);
        console.log('[LowLevelPlanner] Token info fetched successfully');
        return response;
      } catch (error) {
        console.error('[LowLevelPlanner] Error getting token info:', {
          symbol: action.params.symbol,
          error: error.message
        });
        return `🤔 Hmm, I couldn't find anything on ${action.params.symbol}. It might be a newly launched or lesser-known token. Let's give it another shot later!`;
      }
    }

    if (action.type === 'CALCULATE_PERCENTAGE' && params.percentage) {
      const percentage = parseFloat(params.percentage);
      if (isNaN(percentage)) {
        return `😕 I couldn't understand that percentage value. Could you provide a valid number?`;
      }
      return `🔢 Quick Math!\n${percentage}% is the same as ${percentage / 100} in decimals.`;
    }

    if (action.type === 'UNKNOWN') {
      const lastMessage = params.messages[params.messages.length - 1];
      
      if (lastMessage.content.toLowerCase().includes('what can you do')) {
        return `Hi there! 👋 I'm your AI-powered DeFi guide. Here's what I can do for you:

1️⃣ Token Info: Ask me about tokens like $ETH, $BTC, or $MAG.
2️⃣ Market Updates: Stay in the loop with real-time trends.
3️⃣ DeFi Protocols: Dive into metrics and insights about protocols.
4️⃣ Transactions: Need help sending ETH? Just tell me the amount and address!
5️⃣ Calculations: Curious about token conversions? Let me handle the math.

Just ask away—I've got you covered! 🚀`;
      }

      return `🤔 I'm not sure how to handle that just yet. Can you try asking me about tokens, market data, or DeFi insights? I'll do my best to help!`;
    }

    return `🤔 I'm not quite sure how to help with that. Try asking about specific tokens or market information!`;
  }
}