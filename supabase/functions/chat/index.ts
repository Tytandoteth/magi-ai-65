import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  console.log('Received request:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

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

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Enhanced system message for more contextual responses
    const systemMessage = {
      role: "system",
      content: `You are Magi, a highly knowledgeable and context-aware AI assistant. When responding:
- Always acknowledge the user's previous messages and reference relevant context
- If the conversation has a specific topic or theme, maintain continuity
- Provide clear explanations and examples when needed
- Be concise but thorough in your responses
- If you're unsure about something, acknowledge that uncertainty
- Use a friendly and professional tone

Current conversation context: This is a chat interface where users can interact with you directly.`
    };

    // Add the system message at the start of the conversation
    const enhancedMessages = [
      systemMessage,
      ...messages.map(({ role, content }) => ({
        role,
        content,
      }))
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: enhancedMessages,
        temperature: 0.7, // Slightly increased for more natural responses
        max_tokens: 500, // Increased to allow for more detailed responses
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error(error.error?.message || 'Failed to get response from OpenAI');
    }

    const data = await response.json();
    console.log('OpenAI response:', data);

    return new Response(
      JSON.stringify({ response: data.choices[0].message }),
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