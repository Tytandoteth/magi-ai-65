import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { fetchExternalData } from "./utils/api.ts";
import { createSystemMessage } from "./utils/systemMessage.ts";
import { getChatCompletion } from "./utils/openai.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const externalData = await fetchExternalData();
    console.log('Fetched external data:', externalData);

    const systemMessage = createSystemMessage(externalData);
    const enhancedMessages = [
      systemMessage,
      ...messages.map(({ role, content }) => ({
        role,
        content,
      }))
    ];

    const data = await getChatCompletion(enhancedMessages);
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