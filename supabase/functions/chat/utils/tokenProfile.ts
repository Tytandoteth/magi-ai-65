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
  };
}

async function searchCoinGecko(query: string): Promise<any> {
  const apiKey = Deno.env.get('COINGECKO_API_KEY');
  try {
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

async function analyzeSentiment(tweets: any[]): Promise<'positive' | 'neutral' | 'negative'> {
  if (!tweets || tweets.length === 0) return 'neutral';
  
  // Simple sentiment analysis based on tweet metrics
  const totalEngagement = tweets.reduce((acc, tweet) => {
    const metrics = tweet.public_metrics || {};
    return acc + (metrics.like_count || 0) + (metrics.retweet_count || 0);
  }, 0);
  
  const averageEngagement = totalEngagement / tweets.length;
  
  if (averageEngagement > 100) return 'positive';
  if (averageEngagement > 50) return 'neutral';
  return 'negative';
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
  
  // Get Twitter mentions
  const { fetchLatestTweets } = await import('./twitter.ts');
  const twitterData = await fetchLatestTweets(`${symbol} crypto`, 10);
  const tweets = twitterData?.data || [];
  
  // Analyze sentiment
  const sentiment = await analyzeSentiment(tweets);
  
  const profile: TokenProfile = {
    symbol: symbol,
    name: coinGeckoData.name,
    marketCap: marketData?.market_data?.market_cap?.usd,
    price: marketData?.market_data?.current_price?.usd,
    volume24h: marketData?.market_data?.total_volume?.usd,
    socialMetrics: {
      twitterMentions: tweets.length,
      sentiment: sentiment
    }
  };
  
  console.log('Created token profile:', profile);
  return profile;
}