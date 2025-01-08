import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { handleChatMessage } from "./handlers/messageHandler.ts";
import { getOpenAIResponse } from "./handlers/openaiHandler.ts";
import { supabase } from "./utils/supabaseClient.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    const { messages } = await req.json();
    console.log('Processing chat request with messages:', messages);

    // Get only the last 5 messages to reduce context size
    const recentMessages = messages.slice(-5);
    
    // Process message with optimized handler
    const { openAiMessages, apiStatuses, conversation } = await handleChatMessage(recentMessages);
    
    // Get OpenAI response with reduced tokens
    const completion = await getOpenAIResponse(openAiMessages);
    const response = completion.choices[0].message;
    console.log('Generated response:', response);

    // Store assistant response efficiently
    const { error: resMsgError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversation.id,
        role: 'assistant',
        content: response.content,
      });

    if (resMsgError) {
      console.error('Error storing response:', resMsgError);
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
        details: error.stack
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
});