import { fetchWithRetry } from '../utils/fetch';
import { ApiStatus } from '../types';

export async function checkCryptoNewsAPI(): Promise<ApiStatus> {
  console.log('Checking CryptoNews API...');
  const startTime = Date.now();
  
  try {
    const cnApiKey = Deno.env.get('CRYPTONEWS_API_KEY');
    if (!cnApiKey) {
      throw new Error('CryptoNews API key not configured');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetchWithRetry(
      `https://cryptonews-api.com/api/v1/category?section=general&items=1&token=${cnApiKey}`,
      { signal: controller.signal }
    );

    clearTimeout(timeout);
    const data = await response.text();
    console.log('CryptoNews API response:', data);

    return {
      name: 'CryptoNews API',
      status: response.status === 200 ? 'operational' : 'down',
      lastChecked: new Date(),
      responseTime: Date.now() - startTime,
      error: response.status !== 200 ? data : undefined
    };
  } catch (error) {
    console.error('CryptoNews API error:', error);
    return {
      name: 'CryptoNews API',
      status: 'down',
      lastChecked: new Date(),
      error: error.message
    };
  }
}