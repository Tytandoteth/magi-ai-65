import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";
import { formatTokenResponse } from "../utils/formatters.ts";
import { TokenResolver } from "../utils/token/tokenResolver.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function handleChatMessage(messages: any[]) {
  console.log('Processing messages in handler:', messages);
  
  const lastMessage = messages[messages.length - 1];
  const content = lastMessage.content.toLowerCase();

  try {
    // Handle MAG token queries
    if (content.includes('$mag')) {
      console.log('Fetching MAG token data');
      const { data: magData, error } = await supabase
        .from('mag_token_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching MAG data:', error);
        throw new Error('Failed to fetch MAG token data');
      }

      if (!magData) {
        return {
          content: "I apologize, but I couldn't fetch the latest MAG token data at the moment. Please try again in a few moments."
        };
      }

      console.log('Retrieved MAG data:', magData);

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
        content: response
      };
    }

    // Handle other token queries
    if (content.includes('$')) {
      const symbol = content.split('$')[1].split(' ')[0];
      console.log('Resolving token:', symbol);
      const tokenData = await TokenResolver.resolveToken(symbol);
      return {
        content: formatTokenResponse(tokenData)
      };
    }

    // Default response for other queries
    return {
      content: "I'm here to help with crypto and DeFi information! Try asking about specific tokens using the $ symbol (e.g., $ETH or $MAG) or ask for help to see what I can do."
    };

  } catch (error) {
    console.error('Error in message handler:', error);
    throw error;
  }
}