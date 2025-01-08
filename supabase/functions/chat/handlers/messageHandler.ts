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
      
      // First verify table access
      const { data: tableTest, error: tableError } = await supabase
        .from('mag_token_analytics')
        .select('created_at')
        .limit(1);
        
      if (tableError) {
        console.error('Error accessing MAG table:', tableError);
        throw new Error(`Database access error: ${tableError.message}`);
      }
      
      console.log('Table access verified, latest record timestamp:', tableTest?.[0]?.created_at);

      // Fetch latest MAG data
      const { data: magData, error: magError } = await supabase
        .from('mag_token_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (magError) {
        console.error('Error fetching MAG data:', magError);
        throw new Error('Failed to fetch MAG token data');
      }

      if (!magData) {
        console.warn('No MAG data found in database');
        return {
          content: "I apologize, but I couldn't fetch the latest MAG token data at the moment. Please try again in a few moments."
        };
      }

      console.log('Retrieved MAG data:', JSON.stringify(magData, null, 2));

      // Validate data integrity
      const requiredFields = ['price', 'market_cap', 'total_supply', 'circulating_supply', 'holders_count', 'transactions_24h', 'volume_24h'];
      const missingFields = requiredFields.filter(field => magData[field] === null || magData[field] === undefined);
      
      if (missingFields.length > 0) {
        console.warn('Missing required fields:', missingFields);
        throw new Error(`Incomplete MAG data: missing ${missingFields.join(', ')}`);
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
        content: response
      };
    }

    // Keep existing token resolution for other tokens
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
