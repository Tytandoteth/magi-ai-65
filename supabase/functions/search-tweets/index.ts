import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { searchTweets } from "../chat/utils/twitter/client.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, maxResults } = await req.json();
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "Query parameter is required" }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Processing Twitter search request for query: ${query}`);
    const twitterResponse = await searchTweets({ 
      query, 
      maxResults: maxResults || 10 
    });

    if (twitterResponse.errors) {
      console.error('Twitter API errors:', twitterResponse.errors);
      const status = twitterResponse.errors[0]?.code === 429 ? 429 : 500;
      
      return new Response(
        JSON.stringify({ 
          error: twitterResponse.errors[0]?.message || "Failed to search tweets" 
        }),
        { 
          status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify(twitterResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in search-tweets function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});