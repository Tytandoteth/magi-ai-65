import { fetchWithRetry } from '../utils/fetch.ts';
import { ApiStatus } from '../types.ts';

export async function checkDefiLlamaAPI(): Promise<ApiStatus> {
  console.log('Checking DefiLlama API...');
  const startTime = Date.now();
  
  try {
    const dlApiKey = Deno.env.get('DEFILLAMA_API_KEY');
    
    const response = await fetchWithRetry(
      'https://api.llama.fi/protocols',
      {
        headers: dlApiKey ? { 'Authorization': `Bearer ${dlApiKey}` } : {}
      }
    );

    const data = await response.text();
    console.log('DefiLlama API response:', data);

    return {
      name: 'DefiLlama API',
      status: response.status === 200 ? 'operational' : 'down',
      lastChecked: new Date(),
      responseTime: Date.now() - startTime,
      error: response.status !== 200 ? data : undefined
    };
  } catch (error) {
    console.error('DefiLlama API error:', error);
    return {
      name: 'DefiLlama API',
      status: 'down',
      lastChecked: new Date(),
      error: error.message
    };
  }
}