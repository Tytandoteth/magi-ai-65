import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Cache implementation
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1000; // 1 second

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES, backoff = INITIAL_BACKOFF): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    if (response.status === 429) {
      if (retries === 0) {
        console.log('Rate limit exceeded and max retries reached');
        return response;
      }
      
      console.log(`Rate limit hit, waiting ${backoff}ms before retry. ${retries} retries left`);
      await sleep(backoff);
      
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    
    return response;
  } catch (error) {
    if (retries === 0) throw error;
    
    console.error(`Fetch error: ${error.message}. Retrying...`);
    await sleep(backoff);
    return fetchWithRetry(url, options, retries - 1, backoff * 2);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const startTime = Date.now();
    const apiStatuses: Record<string, any> = {};

    // Check Twitter API
    try {
      console.log('Checking Twitter API...');
      const twitterBearerToken = Deno.env.get('TWITTER_BEARER_TOKEN');
      if (!twitterBearerToken) {
        throw new Error('Twitter Bearer Token not configured');
      }

      const cachedTwitterData = cache.get('twitter');
      if (cachedTwitterData && Date.now() - cachedTwitterData.timestamp < CACHE_TTL) {
        console.log('Using cached Twitter API status');
        apiStatuses.twitter = cachedTwitterData.data;
      } else {
        const twitterResponse = await fetchWithRetry(
          'https://api.twitter.com/2/tweets/search/recent?query=crypto',
          {
            headers: {
              'Authorization': `Bearer ${twitterBearerToken}`,
            }
          }
        );

        const twitterData = await twitterResponse.text();
        console.log('Twitter API response:', twitterData);

        const status = twitterResponse.status === 200 ? 'operational' : 
                      twitterResponse.status === 429 ? 'degraded' : 'down';

        apiStatuses.twitter = {
          name: 'Twitter API',
          status,
          lastChecked: new Date(),
          responseTime: Date.now() - startTime,
          error: twitterResponse.status !== 200 ? twitterData : undefined
        };

        cache.set('twitter', {
          data: apiStatuses.twitter,
          timestamp: Date.now()
        });
      }
    } catch (error) {
      console.error('Twitter API error:', error);
      apiStatuses.twitter = {
        name: 'Twitter API',
        status: 'down',
        lastChecked: new Date(),
        error: error.message
      };
    }

    // Check CoinGecko API
    try {
      console.log('Checking CoinGecko API...');
      const cgStartTime = Date.now();
      const cgApiKey = Deno.env.get('COINGECKO_API_KEY');
      
      const cgResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
        {
          headers: {
            'x-cg-demo-api-key': cgApiKey || ''
          }
        }
      );

      const cgData = await cgResponse.text();
      console.log('CoinGecko API response:', cgData);

      apiStatuses.coingecko = {
        name: 'CoinGecko API',
        status: cgResponse.status === 200 ? 'operational' : 'down',
        lastChecked: new Date(),
        responseTime: Date.now() - cgStartTime,
        error: cgResponse.status !== 200 ? cgData : undefined
      };
    } catch (error) {
      console.error('CoinGecko API error:', error);
      apiStatuses.coingecko = {
        name: 'CoinGecko API',
        status: 'down',
        lastChecked: new Date(),
        error: error.message
      };
    }

    // Check Etherscan API
    try {
      console.log('Checking Etherscan API...');
      const esStartTime = Date.now();
      const esApiKey = Deno.env.get('ETHERSCAN_API_KEY');
      if (!esApiKey) {
        throw new Error('Etherscan API key not configured');
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const esResponse = await fetch(
        `https://api.etherscan.io/api?module=stats&action=ethsupply&apikey=${esApiKey}`,
        { signal: controller.signal }
      );

      clearTimeout(timeout);
      const esData = await esResponse.text();
      console.log('Etherscan API response:', esData);

      apiStatuses.etherscan = {
        name: 'Etherscan API',
        status: esResponse.status === 200 ? 'operational' : 'down',
        lastChecked: new Date(),
        responseTime: Date.now() - esStartTime,
        error: esResponse.status !== 200 ? esData : undefined
      };
    } catch (error) {
      console.error('Etherscan API error:', error);
      apiStatuses.etherscan = {
        name: 'Etherscan API',
        status: 'down',
        lastChecked: new Date(),
        error: error.message
      };
    }

    // Check CryptoNews API
    try {
      console.log('Checking CryptoNews API...');
      const cnStartTime = Date.now();
      const cnApiKey = Deno.env.get('CRYPTONEWS_API_KEY');
      if (!cnApiKey) {
        throw new Error('CryptoNews API key not configured');
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const cnResponse = await fetch(
        `https://cryptonews-api.com/api/v1/category?section=general&items=1&token=${cnApiKey}`,
        { signal: controller.signal }
      );

      clearTimeout(timeout);
      const cnData = await cnResponse.text();
      console.log('CryptoNews API response:', cnData);

      apiStatuses.cryptoNews = {
        name: 'CryptoNews API',
        status: cnResponse.status === 200 ? 'operational' : 'down',
        lastChecked: new Date(),
        responseTime: Date.now() - cnStartTime,
        error: cnResponse.status !== 200 ? cnData : undefined
      };
    } catch (error) {
      console.error('CryptoNews API error:', error);
      apiStatuses.cryptoNews = {
        name: 'CryptoNews API',
        status: 'down',
        lastChecked: new Date(),
        error: error.message
      };
    }

    // Check DefiLlama API
    try {
      console.log('Checking DefiLlama API...');
      const dlStartTime = Date.now();
      const dlApiKey = Deno.env.get('DEFILLAMA_API_KEY');
      
      const dlResponse = await fetch('https://api.llama.fi/protocols', {
        headers: dlApiKey ? { 'Authorization': `Bearer ${dlApiKey}` } : {}
      });

      const dlData = await dlResponse.text();
      console.log('DefiLlama API response:', dlData);

      apiStatuses.defiLlama = {
        name: 'DefiLlama API',
        status: dlResponse.status === 200 ? 'operational' : 'down',
        lastChecked: new Date(),
        responseTime: Date.now() - dlStartTime,
        error: dlResponse.status !== 200 ? dlData : undefined
      };
    } catch (error) {
      console.error('DefiLlama API error:', error);
      apiStatuses.defiLlama = {
        name: 'DefiLlama API',
        status: 'down',
        lastChecked: new Date(),
        error: error.message
      };
    }

    console.log('Final API statuses:', apiStatuses);

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