import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { handleChatMessage } from "./handlers/messageHandler.ts";
import { getOpenAIResponse } from "./handlers/openaiHandler.ts";
import { supabase } from "./utils/supabaseClient.ts";

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

    const { openAiMessages, apiStatuses, conversation } = await handleChatMessage(messages);
    
    // Get OpenAI response
    const completion = await getOpenAIResponse(openAiMessages);
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