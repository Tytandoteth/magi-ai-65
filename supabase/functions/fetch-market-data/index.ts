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
    const apiKey = Deno.env.get('COINGECKO_API_KEY')
    if (!apiKey) {
      throw new Error('COINGECKO_API_KEY is not set')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Fetching market data from CoinGecko...')
    
    // Fetch data for specific coins (example list)
    const coins = ['bitcoin', 'ethereum', 'solana', 'cardano', 'polkadot']
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coins.join(',')}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`,
      {
        headers: {
          'x-cg-demo-api-key': apiKey
        }
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('Received market data:', data)

    // Store data in Supabase
    for (const coin of data) {
      const { data: insertedData, error } = await supabase
        .from('defi_market_data')
        .insert({
          coin_id: coin.id,
          symbol: coin.symbol,
          name: coin.name,
          current_price: coin.current_price,
          market_cap: coin.market_cap,
          total_volume: coin.total_volume,
          price_change_24h: coin.price_change_24h,
          price_change_percentage_24h: coin.price_change_percentage_24h,
          raw_data: coin
        })

      if (error) {
        console.error('Error inserting market data:', error)
        throw error
      }
      console.log('Inserted market data for:', coin.id)
    }

    return new Response(JSON.stringify({ success: true, data }), {
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