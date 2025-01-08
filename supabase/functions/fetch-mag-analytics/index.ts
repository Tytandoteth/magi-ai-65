import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MAG_CONTRACT_ADDRESS = '0x7F78a73F2b4D12Fd3537cd196a6f4c9d2f2F6105';

serve(async (req) => {
  console.log('Fetching MAG token analytics...');
  
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

    // Fetch token price from Etherscan
    console.log('Fetching token price from Etherscan...');
    const priceResponse = await fetch(
      `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${etherscanApiKey}`
    );
    const priceData = await priceResponse.json();
    console.log('Price data received:', priceData.status === '1' ? 'success' : 'failed');

    // Calculate MAG price in USD (using ETH price as reference)
    const ethPriceUSD = parseFloat(priceData.result.ethusd);
    const magPriceETH = 0.000000789; // This should be fetched from a DEX API
    const magPriceUSD = ethPriceUSD * magPriceETH;

    console.log('Fetching holder count from Etherscan...');
    const holdersResponse = await fetch(
      `https://api.etherscan.io/api?module=token&action=tokenholderlist&contractaddress=${MAG_CONTRACT_ADDRESS}&apikey=${etherscanApiKey}`
    );
    const holdersData = await holdersResponse.json();
    console.log('Holders data received:', holdersData.status === '1' ? 'success' : 'failed');

    console.log('Fetching 24h transactions...');
    const txResponse = await fetch(
      `https://api.etherscan.io/api?module=account&action=tokentx&contractaddress=${MAG_CONTRACT_ADDRESS}&startblock=0&endblock=99999999&sort=desc&apikey=${etherscanApiKey}`
    );
    const txData = await txResponse.json();
    console.log('Transaction data received:', txData.status === '1' ? 'success' : 'failed');

    // Get current timestamp and 24h ago timestamp
    const now = Math.floor(Date.now() / 1000);
    const oneDayAgo = now - (24 * 60 * 60);

    // Calculate 24h transactions
    const transactions24h = txData.result
      ? txData.result.filter((tx: any) => parseInt(tx.timeStamp) > oneDayAgo).length
      : 0;

    console.log('Fetching token supply...');
    const supplyResponse = await fetch(
      `https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress=${MAG_CONTRACT_ADDRESS}&apikey=${etherscanApiKey}`
    );
    const supplyData = await supplyResponse.json();
    console.log('Supply data received:', supplyData.status === '1' ? 'success' : 'failed');

    // Calculate metrics
    const totalSupply = parseInt(supplyData.result || '880000000');
    const circulatingSupply = 769755726; // This should be calculated based on locked tokens
    const volume24h = transactions24h * magPriceUSD * 1000; // Rough estimate based on tx count
    const marketCap = magPriceUSD * circulatingSupply;

    const analytics = {
      price: magPriceUSD,
      total_supply: totalSupply,
      circulating_supply: circulatingSupply,
      holders_count: holdersData.result?.length || 0,
      transactions_24h,
      volume_24h: volume24h,
      market_cap: marketCap,
      raw_data: {
        holders: holdersData,
        transactions: txData,
        supply: supplyData,
        price: priceData
      }
    };

    console.log('Storing analytics in database:', analytics);

    // Store analytics in Supabase
    const { data: insertedData, error } = await supabase
      .from('mag_token_analytics')
      .insert(analytics);

    if (error) {
      console.error('Error inserting MAG analytics:', error);
      throw error;
    }
    console.log('Successfully stored MAG analytics data');

    return new Response(JSON.stringify({ success: true, data: analytics }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})