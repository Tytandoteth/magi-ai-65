import { fetchLatestTweets } from './twitter.ts';

interface TokenProfile {
  symbol: string;
  name: string;
  marketCap?: number;
  price?: number;
  volume24h?: number;
  holders?: number;
  socialMetrics?: {
    twitterMentions: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    recentTweets?: {
      text: string;
      engagement: number;
      timestamp: string;
    }[];
  };
}

async function searchCoinGecko(query: string): Promise<any> {
  const apiKey = Deno.env.get('COINGECKO_API_KEY');
  try {
    console.log('Searching CoinGecko for:', query);
    const response = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
      {
        headers: {
          'x-cg-demo-api-key': apiKey
        }
      }
    );
    const data = await response.json();
    console.log('CoinGecko Search Results:', data);
    return data.coins?.[0] || null;
  } catch (error) {
    console.error('Error searching CoinGecko:', error);
    return null;
  }
}

async function getTokenMarketData(coinId: string): Promise<any> {
  const apiKey = Deno.env.get('COINGECKO_API_KEY');
  try {
    console.log('Fetching market data for:', coinId);
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=true&developer_data=false`,
      {
        headers: {
          'x-cg-demo-api-key': apiKey
        }
      }
    );
    const data = await response.json();
    console.log('CoinGecko Market Data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching market data:', error);
    return null;
  }
}

async function analyzeSentiment(tweets: any[]): Promise<{
  sentiment: 'positive' | 'neutral' | 'negative';
  recentTweets: any[];
}> {
  if (!tweets || tweets.length === 0) {
    console.log('No tweets to analyze');
    return { 
      sentiment: 'neutral',
      recentTweets: []
    };
  }
  
  console.log('Analyzing sentiment for tweets:', tweets.length);
  
  // Process tweets and calculate engagement
  const processedTweets = tweets.map(tweet => {
    const metrics = tweet.public_metrics || {};
    const engagement = (metrics.like_count || 0) + 
                      (metrics.retweet_count || 0) * 2 + 
                      (metrics.reply_count || 0) * 3;
    
    return {
      text: tweet.text,
      engagement,
      timestamp: tweet.created_at
    };
  });

  // Sort by engagement and get top tweets
  const topTweets = processedTweets
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, 3);
  
  // Calculate overall sentiment based on engagement
  const totalEngagement = processedTweets.reduce((acc, tweet) => acc + tweet.engagement, 0);
  const averageEngagement = totalEngagement / tweets.length;
  
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (averageEngagement > 1000) sentiment = 'positive';
  else if (averageEngagement < 100) sentiment = 'negative';
  
  console.log('Sentiment analysis complete:', { sentiment, topTweetsCount: topTweets.length });
  
  return {
    sentiment,
    recentTweets: topTweets
  };
}

export async function createTokenProfile(symbol: string): Promise<TokenProfile | null> {
  console.log(`Creating token profile for ${symbol}...`);
  
  // Search for token on CoinGecko
  const coinGeckoData = await searchCoinGecko(symbol.replace('$', ''));
  if (!coinGeckoData) {
    console.log('Token not found on CoinGecko');
    return null;
  }
  
  // Get detailed market data
  const marketData = await getTokenMarketData(coinGeckoData.id);
  
  // Get Twitter mentions with enhanced search
  const searchQueries = [
    `${symbol} crypto`,
    `${symbol} token`,
    coinGeckoData.name
  ];
  
  console.log('Fetching tweets for queries:', searchQueries);
  
  const twitterPromises = searchQueries.map(query => fetchLatestTweets(query, 10));
  const twitterResults = await Promise.all(twitterPromises);
  
  // Combine and deduplicate tweets
  const allTweets = twitterResults
    .flatMap(result => result?.data || [])
    .filter((tweet, index, self) => 
      index === self.findIndex(t => t.id === tweet.id)
    );
  
  console.log(`Found ${allTweets.length} unique tweets for ${symbol}`);
  
  // Analyze sentiment and get top tweets
  const { sentiment, recentTweets } = await analyzeSentiment(allTweets);
  
  const profile: TokenProfile = {
    symbol: symbol,
    name: coinGeckoData.name,
    marketCap: marketData?.market_data?.market_cap?.usd,
    price: marketData?.market_data?.current_price?.usd,
    volume24h: marketData?.market_data?.total_volume?.usd,
    socialMetrics: {
      twitterMentions: allTweets.length,
      sentiment: sentiment,
      recentTweets: recentTweets
    }
  };
  
  console.log('Created token profile:', profile);
  return profile;
}