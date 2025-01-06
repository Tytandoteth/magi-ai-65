import { searchTweets } from "../twitter/client.ts";

export async function fetchSocialMetrics(symbol: string) {
  try {
    const twitterData = await searchTweets(`$${symbol}`, 10);
    console.log('Twitter data for token:', twitterData);

    const tweets = twitterData?.data || [];
    const recentTweets = tweets.map(tweet => ({
      text: tweet.text,
      engagement: tweet.public_metrics ? 
        (tweet.public_metrics.like_count + tweet.public_metrics.retweet_count) : 0,
      timestamp: tweet.created_at
    }));

    return {
      twitterMentions: tweets.length,
      sentiment: calculateSentiment(tweets),
      recentTweets
    };
  } catch (error) {
    console.error('Error fetching social metrics:', error);
    return {
      twitterMentions: 0,
      sentiment: 0,
      recentTweets: []
    };
  }
}

function calculateSentiment(tweets: any[]): number {
  if (!tweets.length) return 0;

  const totalEngagement = tweets.reduce((sum, tweet) => {
    const metrics = tweet.public_metrics || {};
    return sum + (metrics.like_count || 0) + (metrics.retweet_count || 0);
  }, 0);

  return Math.min(0.5 + (totalEngagement / (tweets.length * 100)), 1);
}