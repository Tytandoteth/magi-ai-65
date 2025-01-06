import { fetchWithRetry } from '../utils/fetch.ts';
import { ApiStatus } from '../types.ts';

export async function checkEtherscanAPI(): Promise<ApiStatus> {
  console.log('Checking Etherscan API...');
  const startTime = Date.now();
  
  try {
    const esApiKey = Deno.env.get('ETHERSCAN_API_KEY');
    if (!esApiKey) {
      throw new Error('Etherscan API key not configured');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetchWithRetry(
      `https://api.etherscan.io/api?module=stats&action=ethsupply&apikey=${esApiKey}`,
      { signal: controller.signal }
    );

    clearTimeout(timeout);
    const data = await response.text();
    console.log('Etherscan API response:', data);

    return {
      name: 'Etherscan API',
      status: response.status === 200 ? 'operational' : 'down',
      lastChecked: new Date(),
      responseTime: Date.now() - startTime,
      error: response.status !== 200 ? data : undefined
    };
  } catch (error) {
    console.error('Etherscan API error:', error);
    return {
      name: 'Etherscan API',
      status: 'down',
      lastChecked: new Date(),
      error: error.message
    };
  }
}