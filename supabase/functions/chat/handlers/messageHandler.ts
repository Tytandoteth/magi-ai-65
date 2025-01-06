import { createSystemMessage } from '../utils/systemMessage.ts';
import { fetchExternalData } from '../utils/api.ts';
import { supabase } from '../utils/supabaseClient.ts';

export async function handleChatMessage(messages: any[]) {
  console.log('Processing chat message with messages:', messages);
  
  const apiStatuses = [];
  const startTime = Date.now();

  try {
    // Fetch external data including market context
    const externalData = await fetchExternalData();
    console.log('Fetched external data:', externalData);
    
    // Track API statuses
    if (externalData.marketData) {
      apiStatuses.push({
        name: 'Market API',
        status: 'success',
        responseTime: Date.now() - startTime
      });
    }
    
    if (externalData.cryptoData) {
      apiStatuses.push({
        name: 'CoinGecko API',
        status: 'success',
        responseTime: Date.now() - startTime
      });
    }
    
    if (externalData.twitterData) {
      apiStatuses.push({
        name: 'Twitter API',
        status: 'success',
        responseTime: Date.now() - startTime
      });
    } else {
      apiStatuses.push({
        name: 'Twitter API',
        status: 'error',
        error: 'No Twitter data received'
      });
    }

    // Create conversation
    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations')
      .insert({
        user_session_id: crypto.randomUUID(),
        context: externalData
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

    // Create system message with context
    const systemMessage = await createSystemMessage(externalData, userMessage.content);
    console.log('Generated system message:', systemMessage);

    // Prepare messages for OpenAI
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