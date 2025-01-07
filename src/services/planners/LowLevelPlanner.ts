import { TokenService } from "../token/TokenService";
import { HighLevelAction } from "@/types/actions";
import { Message } from "@/types/chat";
import { onChainTools } from "@/integrations/goat/tools";

export class LowLevelPlanner {
  private tokenService: TokenService;

  constructor() {
    this.tokenService = TokenService.getInstance();
  }

  async executeTask(action: HighLevelAction, params: {
    messages: Message[];
    token?: string;
    percentage?: string;
  }): Promise<string> {
    console.log('Executing task:', { action, params });

    if (action.type === 'BLOCKCHAIN_ACTION' && action.params) {
      try {
        console.log('Executing blockchain action:', action.params);
        const result = await onChainTools.executeAction({
          type: action.params.actionType,
          params: {
            to: action.params.to,
            value: action.params.value,
            token: action.params.token
          }
        });

        if (result.status === 'success') {
          return `Transaction successful! Hash: ${result.hash}`;
        } else {
          return `Transaction failed. Please try again.`;
        }
      } catch (error: any) {
        console.error('Blockchain action error:', error);
        return `Failed to execute blockchain action: ${error.message}`;
      }
    }

    if (action.type === 'GET_TOKEN_INFO' && action.params?.symbol) {
      try {
        return await this.tokenService.getTokenInfo(action.params.symbol);
      } catch (error) {
        console.error('Error getting token info:', error);
        return `I couldn't find reliable data for ${action.params.symbol}. This might be because:
1. The token is not listed on major exchanges
2. The token is too new
3. There might be a temporary issue with our data provider

Try checking the token symbol and asking again, or ask about another token like $ETH, $BTC, or $MAG.`;
      }
    }

    if (action.type === 'CALCULATE_PERCENTAGE' && params.percentage) {
      const percentage = parseFloat(params.percentage);
      if (isNaN(percentage)) {
        return `I couldn't understand the percentage value. Please provide a valid number.`;
      }
      return `${percentage}% is equal to ${percentage / 100} in decimal form.`;
    }

    if (action.type === 'UNKNOWN') {
      const lastMessage = params.messages[params.messages.length - 1];
      
      if (lastMessage.content.toLowerCase().includes('what can you do')) {
        return `I'm your AI-powered DeFi assistant! Here's what I can help you with:

1. Token Information: Ask about any token using $ (e.g., $ETH, $BTC, $MAG)
2. Market Updates: Get real-time market data and trends
3. DeFi Protocols: Learn about different protocols and their metrics
4. Transactions: Help you send ETH transactions (just provide amount and address)
5. Price Calculations: Help with token calculations and conversions

Just ask me about any of these topics and I'll be happy to help!`;
      }

      return `I'm not sure how to help with that specific request. Here are some things you can try:

1. Get token information by using $ (e.g., $ETH, $BTC, $MAG)
2. Ask about market updates or DeFi protocols
3. Send ETH transactions by providing an amount and address
4. Ask "what can you do" to see all my capabilities`;
    }

    return `I don't know how to handle that type of request yet. Please try asking about specific tokens or market information.`;
  }
}