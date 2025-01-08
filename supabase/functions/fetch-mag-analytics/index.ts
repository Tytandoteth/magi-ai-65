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
    const apiKey = Deno.env.get('COINGECKO_API_KEY')
    if (!apiKey) {
      throw new Error('COINGECKO_API_KEY is not set')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Fetching MAG token data from CoinGecko...')
    
    // First try to get data from CoinGecko
    const cgResponse = await fetch(
      'https://api.coingecko.com/api/v3/simple/token_price/ethereum/0x7F78a73F2b4D12Fd3537cd196a6f4c9d2f2F6105?include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true',
      {
        headers: {
          'x-cg-demo-api-key': apiKey
        }
      }
    )

    let marketData = null
    if (cgResponse.ok) {
      const cgData = await cgResponse.json()
      console.log('CoinGecko data:', cgData)
      if (cgData['0x7F78a73F2b4D12Fd3537cd196a6f4c9d2f2F6105']) {
        marketData = cgData['0x7F78a73F2b4D12Fd3537cd196a6f4c9d2f2F6105']
      }
    } else {
      console.error('Error fetching from CoinGecko:', await cgResponse.text())
    }

    // Fetch Etherscan data for holders count
    const etherscanApiKey = Deno.env.get('ETHERSCAN_API_KEY')
    if (!etherscanApiKey) {
      throw new Error('ETHERSCAN_API_KEY is not set')
    }

    const etherscanResponse = await fetch(
      `https://api.etherscan.io/api?module=token&action=tokenholderlist&contractaddress=0x7F78a73F2b4D12Fd3537cd196a6f4c9d2f2F6105&apikey=${etherscanApiKey}`
    )

    let holdersCount = 0
    if (etherscanResponse.ok) {
      const etherscanData = await etherscanResponse.json()
      console.log('Etherscan data:', etherscanData)
      if (etherscanData.result) {
        holdersCount = etherscanData.result.length
      }
    }

    // Get transaction count for last 24h
    const txResponse = await fetch(
      `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=0x7F78a73F2b4D12Fd3537cd196a6f4c9d2f2F6105&startblock=0&endblock=99999999&sort=desc&apikey=${etherscanApiKey}`
    )

    let transactions24h = 0
    if (txResponse.ok) {
      const txData = await txResponse.json()
      if (txData.result) {
        const now = Date.now() / 1000 // current timestamp in seconds
        transactions24h = txData.result.filter((tx: any) => 
          now - parseInt(tx.timeStamp) <= 86400 // 24 hours in seconds
        ).length
      }
    }

    // Combine all data
    const analyticsData = {
      price: marketData?.usd || 0,
      market_cap: marketData?.usd_market_cap || 0,
      volume_24h: marketData?.usd_24h_vol || 0,
      holders_count: holdersCount,
      transactions_24h: transactions24h,
      total_supply: 770000000, // Fixed total supply
      circulating_supply: 770000000, // Currently all tokens are in circulation
      raw_data: {
        coingecko: marketData,
        holders: holdersCount,
        transactions_24h: transactions24h
      }
    }

    console.log('Storing analytics data:', analyticsData)

    // Store in database
    const { error: insertError } = await supabase
      .from('mag_token_analytics')
      .insert(analyticsData)

    if (insertError) {
      throw new Error(`Failed to store analytics: ${insertError.message}`)
    }

    return new Response(
      JSON.stringify({ success: true, data: analyticsData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in fetch-mag-analytics:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})