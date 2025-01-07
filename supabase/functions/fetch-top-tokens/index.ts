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
    const cgApiKey = Deno.env.get('COINGECKO_API_KEY')
    if (!cgApiKey) {
      throw new Error('COINGECKO_API_KEY is not set')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Starting data fetch for top 1000 tokens...')
    
    // Fetch CoinGecko data in batches
    const batchSize = 250
    const numberOfBatches = 4
    const cgData = []

    for (let page = 1; page <= numberOfBatches; page++) {
      console.log(`Fetching CoinGecko batch ${page}/${numberOfBatches}...`)
      
      const cgResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${batchSize}&page=${page}&sparkline=false&price_change_percentage=24h&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`,
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
      
      // Respect rate limits
      if (page < numberOfBatches) {
        await new Promise(resolve => setTimeout(resolve, 1500))
      }
    }

    console.log(`Fetched ${cgData.length} tokens from CoinGecko`)

    // Fetch DeFi Llama protocols
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
    const defiLlamaPromises = dlData.slice(0, 1000).map(async (protocol) => {
      try {
        const { error } = await supabase
          .from('defi_llama_protocols')
          .upsert({
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
          }, {
            onConflict: 'protocol_id'
          })

        if (!error) processedCount.defiLlama++
      } catch (error) {
        console.error('Error processing protocol:', protocol.name, error)
      }
    })

    // Process CoinGecko data in smaller batches
    const batchInsertSize = 50
    const coinGeckoPromises = []

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

          // Store token metadata
          const { error: metadataError } = await supabase
            .from('token_metadata')
            .upsert({
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
            }, {
              onConflict: 'coingecko_id'
            })

          if (!metadataError) processedCount.tokenMetadata++
        } catch (error) {
          console.error('Error processing coin:', coin.name, error)
        }
      })

      coinGeckoPromises.push(...batchPromises)

      // Add small delay between batches
      if (i + batchInsertSize < cgData.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    // Wait for all promises to complete
    await Promise.all([...defiLlamaPromises, ...coinGeckoPromises])

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