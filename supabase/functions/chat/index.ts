import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    console.log('Received messages:', messages);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create a new conversation
    const { data: conversation, error: convError } = await supabase
      .from('chat_conversations')
      .insert({
        user_session_id: crypto.randomUUID(),
      })
      .select()
      .single();

    if (convError) {
      throw new Error(`Error creating conversation: ${convError.message}`);
    }

    // Store user message
    const { error: msgError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversation.id,
        role: 'user',
        content: messages[messages.length - 1].content,
      });

    if (msgError) {
      throw new Error(`Error storing message: ${msgError.message}`);
    }

    // For now, return a simple response
    // This will be enhanced later with actual AI processing
    const response = {
      role: 'assistant',
      content: 'Hello! I am your AI assistant. How can I help you today?'
    };

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
      JSON.stringify({ response }),
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