import { searchTweets } from "./twitter/client.ts";
import { supabase } from "../utils/supabaseClient.ts";

interface TokenProfile {
  symbol: string;
  name: string;
  price?: number;
  marketCap?: number;
  volume24h?: number;
  description?: string;
  defiMetrics?: {
    tvl?: number;
    change24h?: number;
    category?: string;
    chains?: string[];
    apy?: number;
    protocol?: string;
  };
  socialMetrics?: {
    twitterMentions: number;
    sentiment: number;
    recentTweets: {
      text: string;
      engagement: number;
      timestamp: string;
    }[];
  };
}

async function fetchCoinGeckoData(symbol: string): Promise<any> {
  try {
    console.log('Fetching CoinGecko data for:', symbol);
    const apiKey = Deno.env.get('COINGECKO_API_KEY');
    
    // First try to get from our database
    const { data: storedData, error: dbError } = await supabase
      .from('token_metadata')
      .select('*')
      .ilike('symbol', symbol)
      .order('last_updated', { ascending: false })
      .limit(1);

    if (dbError) {
      console.error('Error fetching from database:', dbError);
    } else if (storedData && storedData.length > 0) {
      const lastUpdated = new Date(storedData[0].last_updated);
      const now = new Date();
      // If data is less than 1 hour old, use it
      if ((now.getTime() - lastUpdated.getTime()) < 3600000) {
        console.log('Using cached token data');
        return storedData[0];
      }
    }

    // Search CoinGecko API
    const searchResponse = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${symbol}`,
      {
        headers: {
          'x-cg-demo-api-key': apiKey || ''
        }
      }
    );

    if (!searchResponse.ok) {
      throw new Error(`CoinGecko search API error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    const topResult = searchData.coins[0];

    if (!topResult) {
      console.log('No results found for symbol:', symbol);
      return null;
    }

    // Fetch detailed data for the top result
    const detailResponse = await fetch(
      `https://api.coingecko.com/api/v3/coins/${topResult.id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`,
      {
        headers: {
          'x-cg-demo-api-key': apiKey || ''
        }
      }
    );

    if (!detailResponse.ok) {
      throw new Error(`CoinGecko detail API error: ${detailResponse.status}`);
    }

    const tokenData = await detailResponse.json();
    console.log('Fetched token data:', tokenData);

    // Store in our database
    const { error: insertError } = await supabase
      .from('token_metadata')
      .insert({
        symbol: tokenData.symbol.toUpperCase(),
        name: tokenData.name,
        coingecko_id: tokenData.id,
        description: tokenData.description?.en,
        categories: tokenData.categories,
        platforms: tokenData.platforms,
        market_data: tokenData.market_data,
        last_updated: new Date().toISOString(),
        metadata: tokenData
      });

    if (insertError) {
      console.error('Error storing token data:', insertError);
    }

    return tokenData;
  } catch (error) {
    console.error('Error fetching CoinGecko data:', error);
    return null;
  }
}

async function fetchDefiLlamaData(symbol: string): Promise<any> {
  try {
    console.log('Fetching DeFi Llama data for:', symbol);
    
    // Query our cached DeFi Llama data first
    const { data: protocolData, error } = await supabase
      .from('defi_llama_protocols')
      .select('*')
      .or(`symbol.ilike.${symbol},name.ilike.%${symbol}%`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching DeFi Llama data from cache:', error);
      return null;
    }

    if (protocolData && protocolData.length > 0) {
      console.log('Found cached DeFi Llama data:', protocolData[0]);
      return protocolData[0];
    }

    return null;
  } catch (error) {
    console.error('Error fetching DeFi Llama data:', error);
    return null;
  }
}

export async function createTokenProfile(symbol: string): Promise<TokenProfile | null> {
  try {
    console.log('Creating token profile for symbol:', symbol);
    
    // Clean up symbol (remove $ if present)
    const cleanSymbol = symbol.replace('$', '').toUpperCase();
    
    // Fetch CoinGecko data
    const tokenData = await fetchCoinGeckoData(cleanSymbol);
    console.log('CoinGecko data:', tokenData);

    // Fetch DeFi Llama data
    const defiLlamaData = await fetchDefiLlamaData(cleanSymbol);
    console.log('DeFi Llama data:', defiLlamaData);

    // Fetch Twitter data
    const twitterData = await searchTweets(`$${cleanSymbol}`, 10);
    console.log('Twitter data for token:', twitterData);

    // Process Twitter metrics
    const tweets = twitterData?.data || [];
    const recentTweets = tweets.map(tweet => ({
      text: tweet.text,
      engagement: tweet.public_metrics ? 
        (tweet.public_metrics.like_count + tweet.public_metrics.retweet_count) : 0,
      timestamp: tweet.created_at
    }));

    // Calculate sentiment based on tweet content and engagement
    const sentiment = calculateSentiment(tweets);

    if (!tokenData) {
      console.log('No token data found for symbol:', cleanSymbol);
      return null;
    }

    return {
      symbol: cleanSymbol,
      name: tokenData.name,
      price: tokenData.market_data?.current_price?.usd,
      marketCap: tokenData.market_data?.market_cap?.usd,
      volume24h: tokenData.market_data?.total_volume?.usd,
      description: tokenData.description?.en,
      defiMetrics: defiLlamaData ? {
        tvl: defiLlamaData.tvl,
        change24h: defiLlamaData.change_1d,
        category: defiLlamaData.category,
        chains: defiLlamaData.chains,
        apy: defiLlamaData.apy,
        protocol: defiLlamaData.name
      } : undefined,
      socialMetrics: {
        twitterMentions: tweets.length,
        sentiment,
        recentTweets
      }
    };
  } catch (error) {
    console.error('Error creating token profile:', error);
    return null;
  }
}

function calculateSentiment(tweets: any[]): number {
  if (!tweets.length) return 0;

  // Simple sentiment calculation based on engagement
  const totalEngagement = tweets.reduce((sum, tweet) => {
    const metrics = tweet.public_metrics || {};
    return sum + (metrics.like_count || 0) + (metrics.retweet_count || 0);
  }, 0);

  // Normalize to a 0-1 scale, with a base of 0.5 for neutral sentiment
  return Math.min(0.5 + (totalEngagement / (tweets.length * 100)), 1);
}