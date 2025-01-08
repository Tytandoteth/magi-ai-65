import { createSystemMessage } from '../utils/systemMessage.ts';
import { fetchExternalData } from '../utils/api.ts';
import { supabase } from '../utils/supabaseClient.ts';

const MAG_TOKEN_DATA = {
  symbol: 'MAG',
  name: 'Magnify',
  marketData: {
    currentPrice: 0.001282,
    priceChange24h: 3.4,
    marketCap: 987315,
    fullyDilutedValuation: 1128718,
    volume24h: 14961.47,
    circulatingSupply: 769755726,
    totalSupply: 880000000,
    maxSupply: 880000000,
    priceRanges: {
      '24h': {
        low: 0.001064,
        high: 0.001318
      }
    },
    priceChangePercentages: {
      '1h': 0.7,
      '24h': 3.4,
      '7d': 20.0,
      '14d': 37.1,
      '30d': 45.1,
      '1y': null
    },
    btcPrice: 0.071349,
    btcPriceChange24h: 6.7,
    ethPrice: 0.063835,
    ethPriceChange24h: 7.6
  }
};

export async function handleChatMessage(messages: any[]) {
  console.log('Processing chat message with messages:', messages);
  
  const apiStatuses = [];
  const startTime = Date.now();

  try {
    // Get only essential context data based on the last message
    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    let contextData = {};

    // Check if the message is about MAG token
    if (lastMessage.includes('$mag') || lastMessage.includes('magnify')) {
      console.log('MAG token request detected, using hardcoded data');
      contextData = {
        magData: MAG_TOKEN_DATA
      };
    }

    // Create conversation with minimal data and proper error handling
    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations')
      .insert({
        user_session_id: crypto.randomUUID(),
        context: contextData
      })
      .select('id')
      .single();

    if (convError) {
      console.error('Error creating conversation:', convError);
      throw new Error(`Error creating conversation: ${convError.message}`);
    }

    if (!conversation) {
      throw new Error('No conversation was created');
    }

    // Store only the last user message with error handling
    const userMessage = messages[messages.length - 1];
    const { error: msgError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversation.id,
        role: 'user',
        content: userMessage.content,
      });

    if (msgError) {
      console.error('Error storing message:', msgError);
      throw new Error(`Error storing message: ${msgError.message}`);
    }

    // Create system message with token data context
    const systemMessage = {
      role: 'system',
      content: `You are Magi, a friendly and knowledgeable AI assistant specializing in DeFi and crypto. Use a conversational, engaging tone while maintaining professionalism.

When discussing the MAG token, always use the following accurate data:
Current Price: $${MAG_TOKEN_DATA.marketData.currentPrice}
24h Change: ${MAG_TOKEN_DATA.marketData.priceChange24h}%
Market Cap: $${MAG_TOKEN_DATA.marketData.marketCap.toLocaleString()}
24h Volume: $${MAG_TOKEN_DATA.marketData.volume24h.toLocaleString()}
Circulating Supply: ${MAG_TOKEN_DATA.marketData.circulatingSupply.toLocaleString()} MAG
Total Supply: ${MAG_TOKEN_DATA.marketData.totalSupply.toLocaleString()} MAG
24h Range: $${MAG_TOKEN_DATA.marketData.priceRanges['24h'].low} - $${MAG_TOKEN_DATA.marketData.priceRanges['24h'].high}
BTC Price: ${MAG_TOKEN_DATA.marketData.btcPrice} BTC (${MAG_TOKEN_DATA.marketData.btcPriceChange24h}%)
ETH Price: ${MAG_TOKEN_DATA.marketData.ethPrice} ETH (${MAG_TOKEN_DATA.marketData.ethPriceChange24h}%)

Remember to maintain a helpful and approachable tone throughout the conversation.`
    };

    // Format messages for OpenAI with minimal context
    const openAiMessages = [
      systemMessage,
      ...messages.slice(-3) // Only keep last 3 messages for context
    ];

    console.log('Prepared OpenAI messages:', openAiMessages);
    return { openAiMessages, apiStatuses, conversation };
  } catch (error) {
    console.error('Error in handleChatMessage:', error);
    throw error;
  }
}