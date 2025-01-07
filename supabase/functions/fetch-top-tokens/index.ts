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
    console.log('Starting data fetch for top 4000 tokens...')
    
    const cgApiKey = Deno.env.get('COINGECKO_API_KEY')
    if (!cgApiKey) {
      throw new Error('COINGECKO_API_KEY is not set')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // First, get existing tokens from our database
    const { data: existingTokens, error: dbError } = await supabase
      .from('token_metadata')
      .select('coingecko_id')
      .not('coingecko_id', 'is', null);

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    const existingIds = new Set(existingTokens?.map(t => t.coingecko_id) || []);
    console.log(`Found ${existingIds.size} existing tokens in database`);

    // Fetch CoinGecko data in smaller batches
    const batchSize = 100 // Reduced from 250 to 100
    const numberOfBatches = 40 // 40 * 100 = 4000 tokens
    const cgData = []
    let newTokensFound = 0;

    for (let page = 1; page <= numberOfBatches; page++) {
      console.log(`Fetching CoinGecko batch ${page}/${numberOfBatches}...`)
      
      try {
        const cgResponse = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${batchSize}&page=${page}&sparkline=false&price_change_percentage=24h&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`,
          {
            headers: {
              'x-cg-demo-api-key': cgApiKey
            }
          }
        )

        if (!cgResponse.ok) {
          console.error(`CoinGecko API error on page ${page}: ${cgResponse.status}`)
          // Skip this batch and continue with the next one
          continue
        }

        const batchData = await cgResponse.json()
        
        // Filter out tokens we already have
        const newTokens = batchData.filter((token: any) => !existingIds.has(token.id))
        cgData.push(...newTokens)
        newTokensFound += newTokens.length;
        
        console.log(`Batch ${page}: Found ${newTokens.length} new tokens out of ${batchData.length} total`)
        
        // Add longer delay between batches to prevent resource exhaustion
        if (page < numberOfBatches) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      } catch (error) {
        console.error(`Error fetching batch ${page}:`, error)
        // Skip this batch and continue with the next one
        continue
      }
    }

    console.log(`Found ${newTokensFound} new tokens to process`)

    // Process and store data in smaller batches
    const processedCount = {
      marketData: 0,
      tokenMetadata: 0
    }

    // Process CoinGecko data in smaller batches
    const batchInsertSize = 25 // Reduced from 50 to 25
    const insertPromises = []

    for (let i = 0; i < cgData.length; i += batchInsertSize) {
      const batch = cgData.slice(i, i + batchInsertSize)
      
      const batchPromises = batch.map(async (coin) => {
        try {
          // Store market data
          const { error: marketError } = await supabase
            .from('defi_market_data')
            .upsert({
              coin_id: coin.id,
              symbol: coin.symbol.toUpperCase(),
              name: coin.name,
              current_price: coin.current_price,
              market_cap: coin.market_cap,
              total_volume: coin.total_volume,
              price_change_24h: coin.price_change_24h,
              price_change_percentage_24h: coin.price_change_percentage_24h,
              raw_data: coin
            }, {
              onConflict: 'coin_id'
            })

          if (!marketError) processedCount.marketData++

          // Only insert token metadata if we don't already have it
          if (!existingIds.has(coin.id)) {
            const { error: metadataError } = await supabase
              .from('token_metadata')
              .insert({
                symbol: coin.symbol.toUpperCase(),
                name: coin.name,
                coingecko_id: coin.id,
                market_data: {
                  current_price: { usd: coin.current_price },
                  market_cap: { usd: coin.market_cap },
                  total_volume: { usd: coin.total_volume },
                  price_change_24h: coin.price_change_24h,
                  price_change_percentage_24h: coin.price_change_percentage_24h
                },
                metadata: {
                  image: coin.image,
                  last_updated: new Date().toISOString(),
                  additional_metrics: {
                    market_cap_rank: coin.market_cap_rank
                  }
                }
              })

            if (!metadataError) processedCount.tokenMetadata++
          }
        } catch (error) {
          console.error('Error processing coin:', coin.name, error)
          // Skip this coin and continue with the next one
          return
        }
      })

      insertPromises.push(...batchPromises)

      // Add delay between insert batches
      if (i + batchInsertSize < cgData.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Wait for all promises to complete
    await Promise.all(insertPromises)

    const summary = {
      success: true,
      processed: processedCount,
      newTokensFound,
      existingTokens: existingIds.size,
      timestamp: new Date().toISOString()
    }

    console.log('Processing complete:', summary)

    return new Response(JSON.stringify(summary), {
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