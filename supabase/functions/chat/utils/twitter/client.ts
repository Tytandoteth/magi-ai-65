import { createHmac } from "node:crypto";

const BEARER_TOKEN = Deno.env.get("TWITTER_BEARER_TOKEN")?.trim();

// Cache for storing recent API responses
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
        throw new Error('Rate limit exceeded and max retries reached');
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

export async function searchTweets(query = "", maxResults = 10) {
  try {
    if (!BEARER_TOKEN) {
      console.error("Missing Twitter Bearer Token");
      return null;
    }

    // Check cache first
    const cacheKey = `${query}_${maxResults}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('Returning cached Twitter data for query:', query);
      return cached.data;
    }

    console.log(`Fetching tweets for query: "${query}" with max results: ${maxResults}`);

    const baseUrl = "https://api.twitter.com/2/tweets/search/recent";
    const queryParams = new URLSearchParams({
      query: `${query} -is:retweet`,
      "tweet.fields": "created_at,public_metrics",
      "max_results": maxResults.toString(),
    });
    
    const url = `${baseUrl}?${queryParams.toString()}`;
    console.log("Twitter API URL:", url);
    
    const response = await fetchWithRetry(url, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Twitter API error:", response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log("Twitter API response:", JSON.stringify(data, null, 2));
    
    // Cache the successful response
    cache.set(cacheKey, { data, timestamp: Date.now() });
    
    return data;
  } catch (error) {
    console.error("Error fetching tweets:", error);
    return null;
  }
}