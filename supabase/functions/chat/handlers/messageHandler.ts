import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";
import { formatTokenResponse } from "../utils/formatters.ts";
import { TokenResolver } from "../utils/token/tokenResolver.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);
const openAiKey = Deno.env.get('OPENAI_API_KEY');

async function getOpenAIResponse(messages: any[]) {
  if (!openAiKey) {
    throw new Error('OpenAI API key not configured');
  }

  console.log('Sending request to OpenAI with messages:', messages);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // Using the recommended fast model
      messages: [
        {
          role: 'system',
          content: 'You are Magi, a DeFi and crypto expert assistant. Provide accurate, concise information about tokens, market trends, and DeFi protocols. Always include relevant disclaimers about investment risks.'
        },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('OpenAI API error:', error);
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  console.log('OpenAI response:', data);
  return data.choices[0].message.content;
}

export async function handleChatMessage(messages: any[]) {
  console.log('Processing messages in handler:', messages);
  
  const lastMessage = messages[messages.length - 1];
  const content = lastMessage.content.toLowerCase();

  try {
    // Handle MAG token queries
    if (content.includes('$mag')) {
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

    // Handle other token queries
    if (content.includes('$')) {
      const symbol = content.split('$')[1].split(' ')[0];
      console.log('Resolving token:', symbol);
      const tokenData = await TokenResolver.resolveToken(symbol);
      return {
        content: formatTokenResponse(tokenData)
      };
    }

    // For general queries, use OpenAI
    console.log('Processing general query with OpenAI');
    const aiResponse = await getOpenAIResponse(messages);
    
    return {
      content: aiResponse
    };

  } catch (error) {
    console.error('Error in message handler:', error);
    throw error;
  }
}
