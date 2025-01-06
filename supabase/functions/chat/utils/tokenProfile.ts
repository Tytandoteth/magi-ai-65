import { searchTweets } from "./twitter/client.ts";
import { supabase } from "../utils/supabaseClient.ts";

interface TokenProfile {
  symbol: string;
  name: string;
  price?: number;
  marketCap?: number;
  volume24h?: number;
  defiMetrics?: {
    tvl?: number;
    change24h?: number;
    category?: string;
    chains?: string[];
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

async function fetchDefiLlamaData(symbol: string): Promise<any> {
  try {
    console.log('Fetching DeFi Llama data for:', symbol);
    
    // Query our cached DeFi Llama data first
    const { data: protocolData, error } = await supabase
      .from('defi_llama_protocols')
      .select('*')
      .ilike('symbol', symbol)
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

    // If not in cache, try to fetch from DeFi Llama API
    const response = await fetch(`https://api.llama.fi/protocols`);
    const protocols = await response.json();
    
    const protocol = protocols.find((p: any) => 
      p.symbol?.toLowerCase() === symbol.toLowerCase()
    );

    if (protocol) {
      console.log('Found protocol in DeFi Llama API:', protocol);
      return protocol;
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
    
    // Fetch market data from our database
    const { data: marketData, error: marketError } = await supabase
      .from('defi_market_data')
      .select('*')
      .eq('symbol', cleanSymbol.toLowerCase())
      .order('created_at', { ascending: false })
      .limit(1);

    if (marketError) {
      console.error('Error fetching market data:', marketError);
    }

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

    const latestMarketData = marketData?.[0];

    return {
      symbol: cleanSymbol,
      name: latestMarketData?.name || defiLlamaData?.name || `${cleanSymbol} Token`,
      price: latestMarketData?.current_price || defiLlamaData?.price,
      marketCap: latestMarketData?.market_cap || defiLlamaData?.mcap,
      volume24h: latestMarketData?.total_volume,
      defiMetrics: defiLlamaData ? {
        tvl: defiLlamaData.tvl,
        change24h: defiLlamaData.change_1d,
        category: defiLlamaData.category,
        chains: defiLlamaData.chains
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