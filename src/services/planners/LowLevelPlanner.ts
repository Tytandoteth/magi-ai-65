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
      return this.tokenService.getTokenInfo(action.params.symbol);
    }

    if (action.type === 'CALCULATE_PERCENTAGE' && params.percentage) {
      const percentage = parseFloat(params.percentage);
      if (isNaN(percentage)) {
        return `I couldn't understand the percentage value. Please provide a valid number.`;
      }
      return `${percentage}% is equal to ${percentage / 100} in decimal form.`;
    }

    if (action.type === 'UNKNOWN') {
      return `I'm not sure how to help with that request. You can ask me about specific tokens using the $ symbol (e.g., $ETH), or ask about market updates and DeFi protocols. I can also help you send ETH transactions - just provide an amount and address!`;
    }

    return `I don't know how to handle that type of request yet. Please try asking about specific tokens or market information.`;
  }
}