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

    const content = lastMessage.content.toLowerCase();
    console.log('Analyzing content:', content);

    // Check for blockchain actions
    const ethTransactionMatch = content.match(/send\s+([\d.]+)\s*eth\s+to\s+(0x[a-fA-F0-9]{40})/i);
    if (ethTransactionMatch) {
      console.log('Detected ETH transaction request:', ethTransactionMatch);
      return {
        type: 'BLOCKCHAIN_ACTION',
        description: 'Send ETH transaction',
        params: {
          actionType: 'SEND_ETH',
          to: ethTransactionMatch[2],
          value: ethTransactionMatch[1]
        }
      };
    }

    // Look for token symbols with $ prefix
    const tokenMatch = content.match(/\$([A-Za-z]+)/);
    if (tokenMatch) {
      const tokenSymbol = tokenMatch[1].toUpperCase();
      console.log('Found token symbol in message:', tokenSymbol);
      
      return {
        type: 'GET_TOKEN_INFO',
        description: 'Get token information',
        params: {
          symbol: tokenSymbol
        }
      };
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

    // Handle general queries
    if (content.includes('what can you do') || content.includes('help')) {
      return {
        type: 'UNKNOWN',
        description: 'User asking for capabilities'
      };
    }

    return {
      type: 'UNKNOWN',
      description: 'Could not determine action from message'
    };
  }
}