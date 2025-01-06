import { fetchWithRetry } from '../utils/fetch.ts';
import { ApiStatus } from '../types.ts';

export async function checkCoinGeckoAPI(): Promise<ApiStatus> {
  console.log('Checking CoinGecko API...');
  const startTime = Date.now();
  
  try {
    const cgApiKey = Deno.env.get('COINGECKO_API_KEY');
    
    const response = await fetchWithRetry(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
      {
        headers: cgApiKey ? {
          'x-cg-demo-api-key': cgApiKey
        } : {}
      }
    );

    const data = await response.text();
    console.log('CoinGecko API response:', data);

    return {
      name: 'CoinGecko API',
      status: response.status === 200 ? 'operational' : 'down',
      lastChecked: new Date(),
      responseTime: Date.now() - startTime,
      error: response.status !== 200 ? data : undefined
    };
  } catch (error) {
    console.error('CoinGecko API error:', error);
    return {
      name: 'CoinGecko API',
      status: 'down',
      lastChecked: new Date(),
      error: error.message
    };
  }
}