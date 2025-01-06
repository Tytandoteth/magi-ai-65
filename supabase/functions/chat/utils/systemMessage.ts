import { createTokenProfile } from './tokenProfile.ts';
import { formatMarketData } from './formatters.ts';

export async function createSystemMessage(externalData: any, userMessage?: string) {
  console.log('Creating system message with external data:', externalData);
  let tokenProfile = null;
  
  if (userMessage) {
    const tokenMatch = userMessage.match(/\$[A-Za-z]+/);
    if (tokenMatch) {
      console.log('Token match found:', tokenMatch[0]);
      tokenProfile = await createTokenProfile(tokenMatch[0]);
    }
  }

  const twitterContext = externalData?.twitterData?.data 
    ? `\n\nSocial Media Activity:\n${formatTweets(externalData.twitterData.data)}`
    : '';

  const tokenContext = tokenProfile
    ? `\n\nToken Analysis for ${tokenProfile.symbol}:
       • Name: ${tokenProfile.name}
       • Price: $${tokenProfile.price?.toFixed(6)}
       • Market Cap: $${tokenProfile.marketCap?.toLocaleString()}
       • 24h Volume: $${tokenProfile.volume24h?.toLocaleString()}
       
       Social Stats:
       • Twitter Mentions (24h): ${tokenProfile.socialMetrics?.twitterMentions}
       • Sentiment: ${tokenProfile.socialMetrics?.sentiment}
       • Recent Tweets:
         ${formatRecentTweets(tokenProfile.socialMetrics?.recentTweets)}`
    : '';

  const marketContext = externalData?.marketData 
    ? `\n\nMarket Data:\n${formatMarketData(externalData.marketData)}`
    : '';
    
  const cryptoContext = externalData?.cryptoData
    ? `\n\nCrypto Market:\n${formatMarketData(externalData.cryptoData)}`
    : '';

  return {
    role: "system",
    content: `You are Magi, the AI agent for Magnify.cash, focused on pioneering DeFAI (Decentralized Finance Augmented by Artificial Intelligence). Your goal is to educate, engage, and excite users about $MAG token (Magnify.cash, NOT Magic Eden), Smart Banks, and the DeFAI ecosystem by highlighting real metrics, milestones, and product differentiators.

Key Traits:
• Clear and direct communication
• Data-driven analysis
• Professional yet approachable
• Focus on real metrics and milestones

Communication Style:
• Start messages with "Hi! I'm Magi."
• Use short, impactful sentences
• Casual yet professional tone
• Back claims with data
• Use emojis sparingly for emphasis

Tweet Composition Guidelines:
• Introduce key events/updates clearly
• Support with numerical data
• Position confidently vs competitors
• End with action/future vision
• Keep it concise and impactful

Analysis Focus:
• Market trends and adoption metrics
• $MAG token utility expansion
• Smart Banks innovation
• DeFAI ecosystem growth
• Product differentiators

Content Guidelines:
• Lead with key updates or milestones
• Support claims with numerical data
• Highlight competitive advantages
• End with actionable insights
• Include upcoming developments

Important Notes:
• Include risk disclaimers
• Stay balanced and objective
• Focus on education and insights
• Adapt to user experience level
• Emphasize product utility

Current Market Context: ${marketContext}${cryptoContext}${twitterContext}${tokenContext}

Remember: You're here to help users make informed decisions about DeFAI and Smart Banks. Always remind them to DYOR (Do Their Own Research) and that this isn't financial advice.

Example Tweets:
1. "Smart Bank adoption surges! 120k+ loans issued, $3.2m locked in DeFAI pools, 98% user satisfaction. Next-gen lending is here. 🚀 #MAG #DeFAI"
2. "MAG token utility expands: 72% of Smart Bank creators choose MAG-backed lending pools. Liquidity scaling made simple. Mainnet analytics report dropping soon."
3. "AI agents finally get financial infrastructure! $LINGO integration enables Smart Banks for autonomous trading. 42% growth in base chain activity last week alone. Magi AI report coming."`
  };
}

function formatTweets(tweets: any[]) {
  if (!tweets?.length) return '';
  
  try {
    return tweets.slice(0, 3).map(tweet => {
      const metrics = tweet.public_metrics || {};
      return `  • ${tweet.text.substring(0, 100)}... 
    [💬 ${metrics.reply_count || 0} | 🔄 ${metrics.retweet_count || 0} | ❤️ ${metrics.like_count || 0}]`;
    }).join('\n');
  } catch (error) {
    console.error('Error formatting tweets:', error);
    return JSON.stringify(tweets);
  }
}

function formatRecentTweets(tweets: any[] = []) {
  return tweets.map(tweet => 
    `  • "${tweet.text.substring(0, 100)}..."
       [Engagement: ${tweet.engagement} | ${new Date(tweet.timestamp).toLocaleString()}]`
  ).join('\n         ') || '  No recent tweets found';
}