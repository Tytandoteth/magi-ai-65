import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Fetching crypto news...')
    
    // For this example, we'll use a mock news API response
    // In a real implementation, you would integrate with a proper news API
    const mockNews = [
      {
        title: "Bitcoin Reaches New Heights",
        url: "https://example.com/news/1",
        source: "Crypto News",
        published_at: new Date().toISOString(),
        sentiment: 0.8,
        categories: ["bitcoin", "market"]
      },
      {
        title: "DeFi Protocol Launch",
        url: "https://example.com/news/2",
        source: "DeFi Daily",
        published_at: new Date().toISOString(),
        sentiment: 0.6,
        categories: ["defi", "launch"]
      }
    ]

    // Store news in Supabase
    for (const article of mockNews) {
      const { data: insertedData, error } = await supabase
        .from('crypto_news')
        .insert({
          title: article.title,
          url: article.url,
          source: article.source,
          published_at: article.published_at,
          sentiment: article.sentiment,
          categories: article.categories,
          raw_data: article
        })

      if (error) {
        console.error('Error inserting news:', error)
        throw error
      }
      console.log('Inserted news article:', article.title)
    }

    return new Response(JSON.stringify({ success: true, data: mockNews }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})