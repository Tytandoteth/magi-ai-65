export const MAX_RETRIES = 3;
export const INITIAL_BACKOFF = 1000; // 1 second

export const sleep = async (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export async function fetchWithRetry(
  url: string, 
  options: RequestInit, 
  retries = MAX_RETRIES, 
  backoff = INITIAL_BACKOFF
): Promise<Response> {
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