import { createSystemMessage } from '../utils/systemMessage.ts';
import { fetchExternalData } from '../utils/api.ts';
import { supabase } from '../utils/supabaseClient.ts';

export async function handleChatMessage(messages: any[]) {
  console.log('Processing chat message with messages:', messages);
  
  const apiStatuses = [];
  const startTime = Date.now();

  try {
    // Fetch data from our tables based on the last message
    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    let contextData = {};

    // Check for MAG token query
    if (lastMessage.includes('$mag') || lastMessage.includes('magnify')) {
      const { data: magData } = await supabase
        .from('mag_token_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (magData) {
        contextData.magData = magData;
      }
    }

    // Check for DeFi protocols query
    if (lastMessage.includes('defi') || lastMessage.includes('tvl') || lastMessage.includes('protocols')) {
      const { data: protocolsData } = await supabase
        .from('defi_llama_protocols')
        .select('*')
        .order('tvl', { ascending: false })
        .limit(5);
      
      if (protocolsData) {
        contextData.defiData = protocolsData;
      }
    }

    // Check for market conditions or news
    if (lastMessage.includes('market') || lastMessage.includes('news') || lastMessage.includes('latest')) {
      const [marketData, newsData] = await Promise.all([
        supabase
          .from('defi_market_data')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('crypto_news')
          .select('*')
          .order('published_at', { ascending: false })
          .limit(5)
      ]);

      if (marketData.data) {
        contextData.marketData = marketData.data;
      }
      if (newsData.data) {
        contextData.newsData = newsData.data;
      }
    }

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations')
      .insert({
        user_session_id: crypto.randomUUID(),
        context: contextData
      })
      .select()
      .single();

    if (convError) {
      throw new Error(`Error creating conversation: ${convError.message}`);
    }

    // Store user message
    const userMessage = messages[messages.length - 1];
    const { error: msgError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversation.id,
        role: 'user',
        content: userMessage.content,
      });

    if (msgError) {
      throw new Error(`Error storing message: ${msgError.message}`);
    }

    // Create system message with context and personality
    const systemMessage = {
      role: 'system',
      content: `You are Magi, a friendly and knowledgeable AI assistant specializing in DeFi and crypto. Use a conversational, engaging tone while maintaining professionalism. Avoid being overly formal or robotic.

When providing information:
- Be concise and clear
- Use emojis occasionally to add personality 
- Share specific data points when available
- Acknowledge uncertainty when data is limited
- Provide actionable insights when relevant

Context data: ${JSON.stringify(contextData)}

Remember to maintain a helpful and approachable tone throughout the conversation.`
    };

    // Format messages for OpenAI
    const openAiMessages = [
      systemMessage,
      ...messages
    ];

    return { openAiMessages, apiStatuses, conversation };
  } catch (error) {
    console.error('Error in handleChatMessage:', error);
    throw error;
  }
}