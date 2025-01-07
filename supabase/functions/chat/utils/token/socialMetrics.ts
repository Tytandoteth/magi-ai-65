export async function fetchSocialMetrics(symbol: string) {
  console.log('Social metrics for token disabled - Twitter API at capacity');
  
  return {
    twitterMentions: 0,
    sentiment: 0,
    recentTweets: []
  };
}

function calculateSentiment(tweets: any[]): number {
  return 0;
}