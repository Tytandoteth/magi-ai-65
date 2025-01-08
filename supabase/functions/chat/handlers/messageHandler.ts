import { createSystemMessage } from '../utils/systemMessage.ts';
import { fetchExternalData } from '../utils/api.ts';
import { supabase } from '../utils/supabaseClient.ts';
import { fetchMagTokenData } from '../../../src/utils/token/etherscanFetcher.ts';

export async function handleChatMessage(messages: any[]) {
  console.log('Processing chat message with messages:', messages);
  
  const apiStatuses = [];
  const startTime = Date.now();

  try {
    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    let contextData = {};

    // Check if the message is about MAG token
    if (lastMessage.includes('$mag') || lastMessage.includes('magnify')) {
      console.log('MAG token request detected, fetching from Etherscan');
      const magData = await fetchMagTokenData();
      contextData = { magData };
      
      apiStatuses.push({
        name: 'Etherscan',
        status: 'success',
        responseTime: Date.now() - startTime
      });
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

${contextData.magData ? `When discussing the MAG token, use this real-time data from Etherscan:
Total Supply: ${contextData.magData.totalSupply}
Holders: ${contextData.magData.holders}
Last Updated: ${contextData.magData.timestamp}
Contract: ${contextData.magData.tokenInfo?.contractAddress || MAG_CONTRACT_ADDRESS}` : ''}

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