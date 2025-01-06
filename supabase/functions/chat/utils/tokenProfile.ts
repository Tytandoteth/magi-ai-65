import { searchTweets } from "./twitter/client.ts";
import { supabase } from "../utils/supabaseClient.ts";

interface TokenProfile {
  symbol: string;
  name: string;
  price?: number;
  marketCap?: number;
  volume24h?: number;
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

    console.log('Market data for token:', marketData);

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
      name: latestMarketData?.name || `${cleanSymbol} Token`,
      price: latestMarketData?.current_price,
      marketCap: latestMarketData?.market_cap,
      volume24h: latestMarketData?.total_volume,
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