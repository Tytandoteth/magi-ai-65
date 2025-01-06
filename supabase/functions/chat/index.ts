import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { createSystemMessage } from './utils/systemMessage.ts';
import { fetchExternalData } from './utils/api.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const { messages } = await req.json();
    console.log('Received messages:', messages);

    const apiStatuses = [];
    const startTime = Date.now();

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

      // Get OpenAI response
      const openAiKey = Deno.env.get('OPENAI_API_KEY');
      if (!openAiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: openAiMessages,
          temperature: 0.8,
          max_tokens: 500,
        }),
      });

      if (!openAiResponse.ok) {
        const error = await openAiResponse.json();
        console.error('OpenAI API error:', error);
        apiStatuses.push({
          name: 'OpenAI API',
          status: 'error',
          error: error.error?.message || 'Failed to get response from OpenAI'
        });
        throw new Error(error.error?.message || 'Failed to get response from OpenAI');
      }

      apiStatuses.push({
        name: 'OpenAI API',
        status: 'success',
        responseTime: Date.now() - startTime
      });

      const completion = await openAiResponse.json();
      const response = completion.choices[0].message;
      console.log('OpenAI response:', response);

      // Store assistant response
      const { error: resMsgError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversation.id,
          role: 'assistant',
          content: response.content,
        });

      if (resMsgError) {
        throw new Error(`Error storing response: ${resMsgError.message}`);
      }

      return new Response(
        JSON.stringify({ 
          response,
          apiStatuses 
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          },
          status: 200
        }
      );
    } catch (error) {
      console.error('Error in chat function:', error);
      return new Response(
        JSON.stringify({ 
          error: error.message,
          details: error.stack,
          apiStatuses
        }),
        { 
          status: 500, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
  } catch (error) {
    console.error('Error parsing request:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});