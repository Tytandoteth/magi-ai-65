import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from './utils/cors.ts'
import { checkTwitterAPI } from './apis/twitter.ts'
import { checkCoinGeckoAPI } from './apis/coingecko.ts'
import { checkEtherscanAPI } from './apis/etherscan.ts'
import { checkCryptoNewsAPI } from './apis/cryptonews.ts'
import { checkDefiLlamaAPI } from './apis/defillama.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiStatuses = {
      twitter: await checkTwitterAPI(),
      coingecko: await checkCoinGeckoAPI(),
      etherscan: await checkEtherscanAPI(),
      cryptoNews: await checkCryptoNewsAPI(),
      defiLlama: await checkDefiLlamaAPI(),
    };

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