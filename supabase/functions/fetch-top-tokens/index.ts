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
  try {
    const response = await fetch(
      `https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false&locale=en&x_cg_pro_api_key=${COINGECKO_API_KEY}`
    )
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText} - ${errorText}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error fetching page ${page}:`, error)
    throw error
  }
}

async function processTokenBatch(tokens: any[]) {
  console.log(`Processing batch of ${tokens.length} tokens`)
  const existingTokens = new Set()
  
  // Get existing tokens
  const { data: existing } = await supabase
    .from('token_metadata')
    .select('coingecko_id, symbol')
  
  existing?.forEach(token => {
    existingTokens.add(token.coingecko_id)
    // Add to symbol lookup for token resolution
    if (token.symbol) {
      symbolLookup.set(token.symbol.toLowerCase(), token.symbol)
    }
  })
  
  // Filter out existing tokens
  const newTokens = tokens.filter(token => !existingTokens.has(token.id))
  
  if (newTokens.length === 0) {
    console.log('No new tokens to process in this batch')
    return { processed: 0, existing: tokens.length }
  }
  
  // Process in smaller sub-batches to avoid rate limits
  const batchSize = 20
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
        price_change_percentage_24h: token.price_change_percentage_24h
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
    
    // Add delay between batches to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1500))
  }

  return { processed, existing: existingTokens.size }
}

// Initialize symbol lookup map for token resolution
const symbolLookup = new Map<string, string>()

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting enhanced token fetch process')
    const tokensPerPage = 100 // CoinGecko's max per page
    const totalPages = 45 // To get 4500 tokens (45 * 100)
    let totalProcessed = 0
    let totalExisting = 0
    let failedPages = []

    for (let page = 1; page <= totalPages; page++) {
      try {
        console.log(`Fetching page ${page}/${totalPages}`)
        const tokens = await fetchTokens(page, tokensPerPage)
        const { processed, existing } = await processTokenBatch(tokens)
        totalProcessed += processed
        totalExisting += existing

        console.log(`Completed page ${page}/${totalPages}`)
        console.log(`Running totals - Processed: ${totalProcessed}, Existing: ${totalExisting}`)
        
        // Add delay between pages to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (error) {
        console.error(`Error processing page ${page}:`, error)
        failedPages.push(page)
        // Continue with next page despite errors
        continue
      }
    }

    // Retry failed pages once
    if (failedPages.length > 0) {
      console.log(`Retrying ${failedPages.length} failed pages`)
      for (const page of failedPages) {
        try {
          const tokens = await fetchTokens(page, tokensPerPage)
          const { processed, existing } = await processTokenBatch(tokens)
          totalProcessed += processed
          totalExisting += existing
          
          // Remove from failed pages if successful
          failedPages = failedPages.filter(p => p !== page)
          
          await new Promise(resolve => setTimeout(resolve, 2000))
        } catch (error) {
          console.error(`Retry failed for page ${page}:`, error)
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: {
          tokenMetadata: totalProcessed,
          marketData: totalProcessed
        },
        existingTokens: totalExisting,
        failedPages: failedPages.length > 0 ? failedPages : undefined
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('Fatal error:', error)
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