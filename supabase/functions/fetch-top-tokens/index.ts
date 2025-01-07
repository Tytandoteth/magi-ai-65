import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const COINGECKO_API_KEY = Deno.env.get('COINGECKO_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(
  SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY!
)

async function fetchTokens(page: number, perPage: number) {
  console.log(`Fetching tokens page ${page} with ${perPage} tokens per page`)
  const response = await fetch(
    `https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&locale=en&x_cg_pro_api_key=${COINGECKO_API_KEY}`
  )
  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`)
  }
  return await response.json()
}

async function processTokenBatch(tokens: any[]) {
  console.log(`Processing batch of ${tokens.length} tokens`)
  const existingTokens = new Set()
  
  // Get existing tokens
  const { data: existing } = await supabase
    .from('token_metadata')
    .select('coingecko_id')
  
  existing?.forEach(token => existingTokens.add(token.coingecko_id))
  
  // Filter out existing tokens
  const newTokens = tokens.filter(token => !existingTokens.has(token.id))
  
  if (newTokens.length === 0) {
    console.log('No new tokens to process in this batch')
    return { processed: 0, existing: tokens.length }
  }
  
  // Process in smaller sub-batches
  const batchSize = 25
  let processed = 0
  
  for (let i = 0; i < newTokens.length; i += batchSize) {
    const batch = newTokens.slice(i, i + batchSize)
    const tokenData = batch.map(token => ({
      symbol: token.symbol.toUpperCase(),
      name: token.name,
      coingecko_id: token.id,
      market_data: {
        current_price: token.current_price,
        market_cap: token.market_cap,
        total_volume: token.total_volume,
      },
      metadata: {
        image: token.image,
        last_updated: token.last_updated,
      }
    }))

    const { error } = await supabase
      .from('token_metadata')
      .insert(tokenData)

    if (error) {
      console.error('Error inserting tokens:', error)
      continue
    }

    processed += batch.length
    console.log(`Processed ${processed} new tokens`)
    
    // Add a small delay between batches
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return { processed, existing: existingTokens.size }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting token fetch process')
    const tokensPerPage = 100
    const totalPages = 40 // To get 4000 tokens
    let totalProcessed = 0
    let totalExisting = 0

    for (let page = 1; page <= totalPages; page++) {
      try {
        const tokens = await fetchTokens(page, tokensPerPage)
        const { processed, existing } = await processTokenBatch(tokens)
        totalProcessed += processed
        totalExisting += existing

        console.log(`Completed page ${page}/${totalPages}`)
        console.log(`Total processed: ${totalProcessed}, Total existing: ${totalExisting}`)
        
        // Add delay between pages to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (error) {
        console.error(`Error processing page ${page}:`, error)
        continue // Skip failed pages but continue with the next
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: {
          tokenMetadata: totalProcessed,
          marketData: totalProcessed
        },
        existingTokens: totalExisting
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})