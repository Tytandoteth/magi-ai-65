import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Fetching crypto news...')
    
    const cryptoNewsApiKey = Deno.env.get('CRYPTONEWS_API_KEY')
    if (!cryptoNewsApiKey) {
      throw new Error('CRYPTONEWS_API_KEY not found')
    }

    // Fetch news from the API
    const response = await fetch(
      `https://cryptonews-api.com/api/v1/top-mention?&date=last7days&token=${cryptoNewsApiKey}`
    )

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log('Fetched news data:', data)

    // Store each news item
    const { data: insertedData, error } = await supabase
      .from('crypto_news')
      .upsert(
        data.data.map((item: any) => ({
          title: item.title,
          url: item.news_url,
          source: item.source_name,
          published_at: new Date(item.date).toISOString(),
          sentiment: item.sentiment,
          categories: item.categories || [],
          raw_data: item
        })),
        { onConflict: 'url' } // Avoid duplicates based on URL
      )

    if (error) {
      console.error('Error inserting news:', error)
      throw error
    }

    console.log('Successfully stored news articles')
    return new Response(
      JSON.stringify({ success: true, count: data.data.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})