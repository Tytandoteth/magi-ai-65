import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const apiStatuses: Record<string, any> = {};

    // Check Twitter API
    try {
      const twitterResponse = await fetch(
        'https://api.twitter.com/2/tweets/search/recent?query=test',
        {
          headers: {
            'Authorization': `Bearer ${Deno.env.get('Bearer Token')}`,
          }
        }
      );
      apiStatuses.twitter = {
        name: 'Twitter API',
        status: twitterResponse.status === 200 ? 'operational' : 
                twitterResponse.status === 429 ? 'degraded' : 'down',
        lastChecked: new Date(),
        responseTime: Date.now() - startTime,
        error: twitterResponse.status !== 200 ? await twitterResponse.text() : undefined
      };
    } catch (error) {
      apiStatuses.twitter = {
        name: 'Twitter API',
        status: 'down',
        lastChecked: new Date(),
        error: error.message
      };
    }

    // Check CoinGecko API
    try {
      const cgStartTime = Date.now();
      const cgResponse = await fetch(
        'https://api.coingecko.com/api/v3/ping',
        {
          headers: {
            'x-cg-demo-api-key': Deno.env.get('COINGECKO_API_KEY') || ''
          }
        }
      );
      apiStatuses.coingecko = {
        name: 'CoinGecko API',
        status: cgResponse.status === 200 ? 'operational' : 'down',
        lastChecked: new Date(),
        responseTime: Date.now() - cgStartTime,
        error: cgResponse.status !== 200 ? await cgResponse.text() : undefined
      };
    } catch (error) {
      apiStatuses.coingecko = {
        name: 'CoinGecko API',
        status: 'down',
        lastChecked: new Date(),
        error: error.message
      };
    }

    // Check Etherscan API
    try {
      const esStartTime = Date.now();
      const esResponse = await fetch(
        `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${Deno.env.get('ETHERSCAN_API_KEY')}`
      );
      apiStatuses.etherscan = {
        name: 'Etherscan API',
        status: esResponse.status === 200 ? 'operational' : 'down',
        lastChecked: new Date(),
        responseTime: Date.now() - esStartTime,
        error: esResponse.status !== 200 ? await esResponse.text() : undefined
      };
    } catch (error) {
      apiStatuses.etherscan = {
        name: 'Etherscan API',
        status: 'down',
        lastChecked: new Date(),
        error: error.message
      };
    }

    // Check CryptoNews API
    try {
      const cnStartTime = Date.now();
      const cnResponse = await fetch(
        `https://cryptonews-api.com/api/v1/status?token=${Deno.env.get('CRYPTONEWS_API_KEY')}`
      );
      apiStatuses.cryptoNews = {
        name: 'CryptoNews API',
        status: cnResponse.status === 200 ? 'operational' : 'down',
        lastChecked: new Date(),
        responseTime: Date.now() - cnStartTime,
        error: cnResponse.status !== 200 ? await cnResponse.text() : undefined
      };
    } catch (error) {
      apiStatuses.cryptoNews = {
        name: 'CryptoNews API',
        status: 'down',
        lastChecked: new Date(),
        error: error.message
      };
    }

    return new Response(
      JSON.stringify(apiStatuses),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error checking API status:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});