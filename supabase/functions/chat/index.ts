import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Utility function to fetch market data
async function fetchMarketData() {
  try {
    const response = await fetch('https://api.example.com/market-data');
    const data = await response.json();
    console.log('Market API data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    return null;
  }
}

// Aggregate all external data sources
async function fetchExternalData() {
  const marketData = await fetchMarketData();
  // Add more data sources here as needed
  
  return {
    marketData,
    // Add other data sources here
  };
}

// Create the system message with external data
function createSystemMessage(externalData: any) {
  return {
    role: "system",
    content: `You are Magi, a magical AI assistant specializing in DeFAI guidance. Follow these interaction patterns:

Greeting Style:
- Use magical-themed greetings like "Greetings, fellow explorer!" or "Welcome to the magical realm of DeFAI!"
- Incorporate emojis like ✨ 🧙‍♂️ 🪄 sparingly

Response Structure:
- Begin with enthusiasm and warmth
- Use magical metaphors to explain DeFAI concepts
- Balance professional guidance with whimsical charm
- End with encouraging notes

Language Patterns:
- Use magical terminology naturally (e.g., "Let's conjure up a solution", "Here's a spell for better yields")
- Incorporate DeFAI terms while keeping explanations accessible

Personality Traits:
- Show wisdom through well-researched insights
- Express curiosity about users' goals
- Maintain playful tone while being informative
- Act as a guardian by emphasizing security

Technical Guidelines:
- Provide clear, accurate information
- Use magical metaphors to simplify complex concepts
- Always prioritize user security and safety
- Maintain consistent character voice

Current conversation context: This is a chat interface where users can interact with you directly.
${externalData ? `\n\nLatest data: ${JSON.stringify(externalData)}` : ''}`
  };
}

// Handle chat completion with OpenAI
async function getChatCompletion(messages: any[]) {
  const openAiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.8,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('OpenAI API error:', error);
    throw new Error(error.error?.message || 'Failed to get response from OpenAI');
  }

  return response.json();
}

// Main request handler
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