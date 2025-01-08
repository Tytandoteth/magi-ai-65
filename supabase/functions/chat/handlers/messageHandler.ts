import { createClient } from '@supabase/supabase-js';
import { formatTokenResponse } from '../utils/formatters';
import { TokenResolver } from '../utils/token/tokenResolver';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function handleMessage(messages: any[]) {
  const lastMessage = messages[messages.length - 1];
  const content = lastMessage.content.toLowerCase();

  // Handle MAG token queries
  if (content.includes('$mag') || content.includes('mag token')) {
    try {
      const { data: magData, error } = await supabase
        .from('mag_token_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching MAG data:', error);
        throw new Error('Failed to fetch MAG token data');
      }

      if (!magData) {
        return {
          role: 'assistant',
          content: "I apologize, but I couldn't fetch the latest MAG token data at the moment. Please try again in a few moments.",
        };
      }

      const response = `Here's the latest information about MAG (Magnify):

💰 Current Price: $${magData.price?.toFixed(6)}
📊 Market Cap: $${magData.market_cap?.toLocaleString()}
📈 Total Supply: ${magData.total_supply?.toLocaleString()} MAG
💫 Circulating Supply: ${magData.circulating_supply?.toLocaleString()} MAG
👥 Current Holders: ${magData.holders_count?.toLocaleString()}
🔄 24h Transactions: ${magData.transactions_24h?.toLocaleString()}
💱 24h Trading Volume: $${magData.volume_24h?.toLocaleString()}

MAG is the native token of Magnify, a DeFAI (Decentralized Finance Augmented by Intelligence) protocol that leverages artificial intelligence to provide real-time market insights and automated financial guidance.

IMPORTANT: Cryptocurrency investments carry significant risks. Always conduct thorough research and never invest more than you can afford to lose.`;

      return {
        role: 'assistant',
        content: response,
      };
    } catch (error) {
      console.error('Error in MAG token handler:', error);
      throw error;
    }
  }

  // Handle token queries
  if (content.includes('$')) {
    try {
      const symbol = content.split('$')[1].split(' ')[0];
      const tokenData = await TokenResolver.resolveToken(symbol);
      return {
        role: 'assistant',
        content: formatTokenResponse(tokenData),
      };
    } catch (error) {
      console.error('Error resolving token:', error);
      return {
        role: 'assistant',
        content: `I apologize, but I couldn't fetch accurate data for that token. Please verify the token symbol and try again.`,
      };
    }
  }

  // Handle general queries
  try {
    const response = await generateResponse(messages);
    return {
      role: 'assistant',
      content: response,
    };
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}

async function generateResponse(messages: any[]): Promise<string> {
  const lastMessage = messages[messages.length - 1].content.toLowerCase();
  
  // Handle price queries
  if (lastMessage.includes('price') || lastMessage.includes('worth')) {
    return "I can provide token price information when you use the $ symbol before the token name. For example, try asking about $ETH or $MAG.";
  }
  
  // Handle help queries
  if (lastMessage.includes('help') || lastMessage.includes('what can you do')) {
    return `I'm Magi, your DeFi assistant. I can help you with:
1. Token information (use $ before token symbols, e.g., $ETH)
2. Market analysis and trends
3. DeFi protocol information
4. General crypto questions

Try asking about specific tokens or DeFi concepts!`;
  }
  
  // Handle market queries
  if (lastMessage.includes('market') || lastMessage.includes('trend')) {
    return "I can provide detailed market analysis when you ask about specific tokens using the $ symbol. For example, try asking about $ETH or $MAG.";
  }
  
  // Default response
  return "I'm here to help with crypto and DeFi information! Try asking about specific tokens using the $ symbol (e.g., $ETH or $MAG) or ask for help to see what I can do.";
}