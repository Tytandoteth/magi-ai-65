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
    const etherscanApiKey = Deno.env.get('ETHERSCAN_API_KEY')
    if (!etherscanApiKey) {
      throw new Error('ETHERSCAN_API_KEY is not set')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('Fetching MAG token analytics...')
    
    // Mock data for now - in production, this would fetch real data from Etherscan
    const mockAnalytics = {
      price: 1.23,
      total_supply: 1000000,
      circulating_supply: 750000,
      holders_count: 1500,
      transactions_24h: 250,
      volume_24h: 50000,
      market_cap: 1230000
    }

    // Store analytics in Supabase
    const { data: insertedData, error } = await supabase
      .from('mag_token_analytics')
      .insert({
        ...mockAnalytics,
        raw_data: mockAnalytics
      })

    if (error) {
      console.error('Error inserting MAG analytics:', error)
      throw error
    }
    console.log('Inserted MAG analytics data')

    return new Response(JSON.stringify({ success: true, data: mockAnalytics }), {
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