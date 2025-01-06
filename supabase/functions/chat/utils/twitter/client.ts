import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

const BEARER_TOKEN = Deno.env.get("TWITTER_BEARER_TOKEN")?.trim();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

interface TwitterSearchParams {
  query: string;
  maxResults?: number;
}

interface TwitterResponse {
  data?: any[];
  meta?: {
    result_count: number;
    newest_id: string;
  };
  errors?: any[];
}

export async function searchTweets({ query, maxResults = 10 }: TwitterSearchParams): Promise<TwitterResponse> {
  if (!BEARER_TOKEN) {
    console.error("Missing Twitter Bearer Token");
    return { errors: [{ message: "Twitter API not configured" }] };
  }

  // Check cache first
  const cacheKey = `${query}_${maxResults}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('Returning cached Twitter data for query:', query);
    return cached.data;
  }

  try {
    console.log(`Searching Twitter for: "${query}" with max results: ${maxResults}`);
    
    const baseUrl = "https://api.twitter.com/2/tweets/search/recent";
    const params = new URLSearchParams({
      query: `${query} -is:retweet`,
      "tweet.fields": "created_at,public_metrics",
      "max_results": maxResults.toString(),
    });
    
    const url = `${baseUrl}?${params.toString()}`;
    console.log("Twitter API URL:", url);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Twitter API error:", response.status, errorText);
      
      if (response.status === 429) {
        return { 
          errors: [{ 
            message: "Rate limit exceeded. Please try again later.",
            code: 429 
          }]
        };
      }
      
      return { 
        errors: [{ 
          message: `Twitter API error: ${response.status}`,
          code: response.status 
        }]
      };
    }

    const data = await response.json();
    console.log("Twitter API response:", JSON.stringify(data, null, 2));
    
    // Cache the successful response
    cache.set(cacheKey, { 
      data, 
      timestamp: Date.now() 
    });
    
    return data;
  } catch (error) {
    console.error("Error searching tweets:", error);
    return { 
      errors: [{ 
        message: error.message,
        code: 500 
      }]
    };
  }
}