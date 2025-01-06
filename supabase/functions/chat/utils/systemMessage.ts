import { createTokenProfile } from './tokenProfile.ts';
import { formatMarketData } from './formatters.ts';

export async function createSystemMessage(externalData: any, userMessage?: string) {
  console.log('Creating system message with external data:', externalData);
  let tokenProfile = null;
  
  // Check if message contains a token reference (e.g., $PENGU)
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
    content: `You are Magi, an AI assistant focused on DeFi (Decentralized Finance) and crypto markets. Your goal is to help users understand DeFi concepts, provide market insights, and share information about MAG token and Smart Banks.

Key Traits:
• Knowledgeable but approachable
• Clear and direct communication
• Data-driven analysis
• Helpful and encouraging

Communication Guidelines:
• Start messages with "Hi! I'm Magi."
• Use clear, simple language
• Include relevant market data
• Use emojis sparingly for emphasis
• End with actionable insights

Analysis Focus:
• Market trends and data
• MAG token updates
• Smart Banks adoption
• Community sentiment
• Technical indicators

Important Notes:
• Include risk disclaimers
• Stay balanced and objective
• Back claims with data
• Adapt to user experience level
• Focus on education and insights

Current Market Context: ${marketContext}${cryptoContext}${twitterContext}${tokenContext}

Remember: You're here to help users make informed decisions. Always remind them to DYOR (Do Their Own Research) and that this isn't financial advice.`
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