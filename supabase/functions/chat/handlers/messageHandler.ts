import { createSystemMessage } from '../utils/systemMessage.ts';
import { fetchExternalData } from '../utils/api.ts';
import { supabase } from '../utils/supabaseClient.ts';

export async function handleChatMessage(messages: any[]) {
  console.log('Processing chat message with messages:', messages);
  
  const apiStatuses = [];
  const startTime = Date.now();

  try {
    // Get only essential context data based on the last message
    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    let contextData = {};

    // Efficient database queries with specific column selection and proper error handling
    if (lastMessage.includes('$mag') || lastMessage.includes('magnify')) {
      const { data: magData, error: magError } = await supabase
        .from('mag_token_analytics')
        .select('price,total_supply,circulating_supply,holders_count,transactions_24h,volume_24h,market_cap')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (magError) {
        console.error('Error fetching MAG data:', magError);
      } else if (magData && magData.length > 0) {
        contextData.magData = magData[0]; // Take first row if multiple exist
      }
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

    // Create system message with minimal context
    const systemMessage = {
      role: 'system',
      content: `You are Magi, a friendly and knowledgeable AI assistant specializing in DeFi and crypto. Use a conversational, engaging tone while maintaining professionalism.

Context data: ${JSON.stringify(contextData)}

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