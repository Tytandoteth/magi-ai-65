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
    const cgApiKey = Deno.env.get('COINGECKO_API_KEY')
    if (!cgApiKey) {
      throw new Error('COINGECKO_API_KEY is not set')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Fetching top 1000 tokens data...')
    
    // Fetch tokens in batches of 250 (CoinGecko's max per page)
    const batchSize = 250
    const numberOfBatches = 4 // 4 batches of 250 = 1000 tokens
    const cgData = []

    for (let page = 1; page <= numberOfBatches; page++) {
      console.log(`Fetching batch ${page} of ${numberOfBatches}...`)
      
      const cgResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${batchSize}&page=${page}&sparkline=false`,
        {
          headers: {
            'x-cg-demo-api-key': cgApiKey
          }
        }
      )

      if (!cgResponse.ok) {
        throw new Error(`CoinGecko API error: ${cgResponse.status} on page ${page}`)
      }

      const batchData = await cgResponse.json()
      cgData.push(...batchData)
      
      // Add delay between batches to respect rate limits
      if (page < numberOfBatches) {
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
    }

    console.log(`Fetched ${cgData.length} tokens from CoinGecko`)

    // Fetch protocols from DeFi Llama
    const dlResponse = await fetch('https://api.llama.fi/protocols')
    if (!dlResponse.ok) {
      throw new Error(`DeFi Llama API error: ${dlResponse.status}`)
    }

    const dlData = await dlResponse.json()
    console.log(`Fetched ${dlData.length} protocols from DeFi Llama`)

    // Process and store data
    const processedCount = {
      defiLlama: 0,
      marketData: 0,
      tokenMetadata: 0
    }

    // Store DeFi Llama protocols (top 1000 by TVL)
    for (const protocol of dlData.slice(0, 1000)) {
      try {
        const { error } = await supabase
          .from('defi_llama_protocols')
          .insert({
            protocol_id: protocol.slug,
            name: protocol.name,
            symbol: protocol.symbol,
            category: protocol.category,
            tvl: protocol.tvl,
            change_1h: protocol.change_1h,
            change_1d: protocol.change_1d,
            change_7d: protocol.change_7d,
            staking: protocol.staking,
            derivatives: protocol.derivatives,
            raw_data: protocol
          })

        if (error) {
          console.error('Error inserting protocol:', protocol.name, error)
          continue
        }
        processedCount.defiLlama++
      } catch (error) {
        console.error('Error processing protocol:', protocol.name, error)
      }
    }

    // Store CoinGecko market data in batches
    const batchInsertSize = 50 // Process in smaller batches to avoid timeouts
    for (let i = 0; i < cgData.length; i += batchInsertSize) {
      const batch = cgData.slice(i, i + batchInsertSize)
      
      for (const coin of batch) {
        try {
          // Store market data
          const { error: marketError } = await supabase
            .from('defi_market_data')
            .insert({
              coin_id: coin.id,
              symbol: coin.symbol.toUpperCase(),
              name: coin.name,
              current_price: coin.current_price,
              market_cap: coin.market_cap,
              total_volume: coin.total_volume,
              price_change_24h: coin.price_change_24h,
              price_change_percentage_24h: coin.price_change_percentage_24h,
              raw_data: coin
            })

          if (marketError) {
            console.error('Error inserting market data:', coin.name, marketError)
            continue
          }
          processedCount.marketData++

          // Store token metadata
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

          if (metadataError) {
            console.error('Error inserting token metadata:', coin.name, metadataError)
            continue
          }
          processedCount.tokenMetadata++
        } catch (error) {
          console.error('Error processing coin:', coin.name, error)
        }
      }

      // Add small delay between batches
      if (i + batchInsertSize < cgData.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    const summary = {
      success: true,
      processed: processedCount,
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