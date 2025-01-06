import { searchTweets } from "./twitter/client.ts";

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

    // Calculate average sentiment (mock implementation)
    const sentiment = 0.7; // Placeholder value

    return {
      symbol: cleanSymbol,
      name: `${cleanSymbol} Token`, // Placeholder
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