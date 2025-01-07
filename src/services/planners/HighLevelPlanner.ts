import { Message } from "@/types/chat";
import { HighLevelAction } from "@/types/actions";
import { TokenResolver } from "../token/TokenResolver";
import { onChainTools } from "@/integrations/goat/tools";

export class HighLevelPlanner {
  async planAction(messages: Message[]): Promise<HighLevelAction> {
    console.log('Planning high-level action based on messages:', messages);
    
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) {
      return { type: 'UNKNOWN', description: 'No message provided' };
    }

    // Extract token symbol from message
    const content = lastMessage.content.toLowerCase();
    console.log('Analyzing content:', content);

    // Check for blockchain actions
    if (content.includes('send eth') || content.includes('transfer eth')) {
      const amountMatch = content.match(/(\d+\.?\d*)\s*eth/i);
      const addressMatch = content.match(/(0x[a-fA-F0-9]{40})/);
      
      if (amountMatch && addressMatch) {
        return {
          type: 'BLOCKCHAIN_ACTION',
          description: 'Send ETH transaction',
          params: {
            actionType: 'SEND_ETH',
            to: addressMatch[1],
            value: amountMatch[1]
          }
        };
      }
    }

    // Look for token symbols with $ prefix
    const tokenMatch = content.match(/\$([A-Za-z]+)/);
    if (tokenMatch) {
      const tokenSymbol = tokenMatch[1].toUpperCase();
      console.log('Found token symbol in message:', tokenSymbol);
      
      const resolvedSymbol = TokenResolver.resolveTokenSymbol(tokenSymbol);
      console.log('Resolved token symbol:', resolvedSymbol);

      if (resolvedSymbol) {
        return {
          type: 'GET_TOKEN_INFO',
          description: 'Get token information',
          params: {
            symbol: resolvedSymbol
          }
        };
      }
    }

    // Look for percentage calculations
    const percentageMatch = content.match(/(\d+\.?\d*)%/);
    if (percentageMatch) {
      return {
        type: 'CALCULATE_PERCENTAGE',
        description: 'Calculate percentage value',
        params: {
          value: percentageMatch[1]
        }
      };
    }

    return {
      type: 'UNKNOWN',
      description: 'Could not determine action from message'
    };
  }
}