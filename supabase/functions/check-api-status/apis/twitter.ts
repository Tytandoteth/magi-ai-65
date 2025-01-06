import { fetchWithRetry } from '../utils/fetch.ts';
import { getCachedData, setCachedData } from '../utils/cache.ts';
import { ApiStatus } from '../types.ts';

export async function checkTwitterAPI(): Promise<ApiStatus> {
  console.log('Checking Twitter API...');
  const startTime = Date.now();
  
  try {
    const twitterBearerToken = Deno.env.get('TWITTER_BEARER_TOKEN');
    if (!twitterBearerToken) {
      throw new Error('Twitter Bearer Token not configured');
    }

    const cachedData = getCachedData('twitter');
    if (cachedData) return cachedData;

    const response = await fetchWithRetry(
      'https://api.twitter.com/2/tweets/search/recent?query=crypto',
      {
        headers: {
          'Authorization': `Bearer ${twitterBearerToken}`,
        }
      }
    );

    const data = await response.text();
    console.log('Twitter API response:', data);

    const status = {
      name: 'Twitter API',
      status: response.status === 200 ? 'operational' : 
              response.status === 429 ? 'degraded' : 'down',
      lastChecked: new Date(),
      responseTime: Date.now() - startTime,
      error: response.status !== 200 ? data : undefined
    };

    setCachedData('twitter', status);
    return status;
  } catch (error) {
    console.error('Twitter API error:', error);
    return {
      name: 'Twitter API',
      status: 'down',
      lastChecked: new Date(),
      error: error.message
    };
  }
}