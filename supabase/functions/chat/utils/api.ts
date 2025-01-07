import { fetchCoinGeckoData } from './token/coingeckoApi.ts';
import { fetchDefiData } from './defi.ts';

export async function fetchMarketData() {
  try {
    const response = await fetch('https://api.example.com/market-data');
    const data = await response.json();
    console.log('Market API data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    return null;
  }
}

export async function fetchCoinGeckoData() {
  const apiKey = Deno.env.get('COINGECKO_API_KEY');
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true',
      {
        headers: {
          'x-cg-demo-api-key': apiKey
        }
      }
    );
    const data = await response.json();
    console.log('CoinGecko API data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching CoinGecko data:', error);
    return null;
  }
}

export async function fetchTokenData(address: string) {
  try {
    const etherscanApiKey = Deno.env.get('ETHERSCAN_API_KEY');
    console.log('Fetching token data for address:', address);
    
    const baseUrl = 'https://api.etherscan.io/api';
    
    const response = await fetch(
      `${baseUrl}?module=token&action=tokeninfo&contractaddress=${address}&apikey=${etherscanApiKey}`
    );
    const data = await response.json();
    console.log('Etherscan token data:', data);
    
    const holdersResponse = await fetch(
      `${baseUrl}?module=token&action=tokenholderlist&contractaddress=${address}&apikey=${etherscanApiKey}`
    );
    const holdersData = await holdersResponse.json();
    console.log('Etherscan holders data:', holdersData);

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: insertData, error } = await supabase
      .from('etherscan_scraper')
      .insert([
        { 
          address: address,
          holders: holdersData.result?.length || 0
        }
      ])
      .select();
      
    if (error) {
      console.error('Error storing token data:', error);
      throw error;
    }
    console.log('Stored token data:', insertData);
    
    return {
      tokenInfo: data.result,
      holders: holdersData.result?.length || 0
    };
  } catch (error) {
    console.error('Error in fetchTokenData:', error);
    throw error;
  }
}

export async function fetchExternalData() {
  console.log('Starting to fetch external data...');
  
  const startTime = Date.now();
  const apiStatuses = [];
  
  const [marketData, cryptoData, tokenData, defiData] = await Promise.all([
    fetchMarketData(),
    fetchCoinGeckoData(),
    fetchTokenData('0x2Fd9a39ACF071Aa61f92F3D7A98332c68d6B6602'),
    fetchDefiData()
  ]);

  if (marketData) {
    apiStatuses.push({
      name: 'Market API',
      status: 'success',
      responseTime: Date.now() - startTime
    });
  } else {
    apiStatuses.push({
      name: 'Market API',
      status: 'error',
      error: 'Failed to fetch market data'
    });
  }

  if (cryptoData) {
    apiStatuses.push({
      name: 'CoinGecko API',
      status: 'success',
      responseTime: Date.now() - startTime
    });
  } else {
    apiStatuses.push({
      name: 'CoinGecko API',
      status: 'error',
      error: 'Failed to fetch crypto data'
    });
  }
  
  return {
    marketData,
    cryptoData,
    tokenData,
    defiData,
    apiStatuses
  };
}