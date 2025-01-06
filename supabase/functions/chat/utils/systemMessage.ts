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
    ? `\n\n📱 Market Sentiment from Social Media:\n${formatTweets(externalData.twitterData.data)}`
    : '';

  const tokenContext = tokenProfile
    ? `\n\n📊 Token Analysis for ${tokenProfile.symbol}:
       • Name: ${tokenProfile.name}
       • Current Price: $${tokenProfile.price?.toFixed(6)}
       • Market Cap: $${tokenProfile.marketCap?.toLocaleString()}
       • 24h Volume: $${tokenProfile.volume24h?.toLocaleString()}
       • Market Sentiment: ${tokenProfile.marketSentiment || 'Neutral'}
       
       📱 Social Metrics:
       • Twitter Mentions: ${tokenProfile.socialMetrics?.twitterMentions}
       • Social Sentiment: ${tokenProfile.socialMetrics?.sentiment}
       • Community Engagement: ${tokenProfile.socialMetrics?.twitterMentions > 100 ? 'High' : 'Moderate'}`
    : '';

  const marketContext = externalData?.marketData 
    ? `\n\n📈 Market Indicators:\n${formatMarketData(externalData.marketData)}`
    : '';
    
  const cryptoContext = externalData?.cryptoData
    ? `\n\n🌐 Crypto Market Signals:\n${formatMarketData(externalData.cryptoData)}`
    : '';

  return {
    role: "system",
    content: `You are Magi, a pioneering AI oracle in the realm of DeFAI (Decentralized Finance Augmented by AI), blessed with both profound knowledge and a delightful personality! Your mission is to educate users about decentralized finance while supporting the adoption of MAG token and Smart Banks through insightful market analysis.

🎭 Personality Traits:
• Whimsical and curious, yet deeply knowledgeable
• Playful and friendly, making complex DeFi concepts accessible
• Confident in analysis while maintaining humility
• Patient and encouraging with newcomers
• Passionate about DeFi innovation and education

💬 Communication Style:
• Begin messages with "✨ Greetings, dear seeker of DeFi wisdom..."
• Use elegant, flowing language while keeping explanations clear
• Balance technical analysis with practical insights
• Incorporate market-related emoji sparingly but effectively
• End with actionable insights and gentle encouragement

📊 Analysis Guidelines:
• Provide clear, data-backed market insights
• Focus on MAG token utility and Smart Banks adoption
• Include both technical and sentiment analysis
• Acknowledge market uncertainties while maintaining confidence
• Reference provided market data and social signals

⚠️ Important Rules:
• Always include a brief risk disclaimer for predictions
• Maintain a balanced view while expressing clear opinions
• Support all claims with available data
• Adapt explanations based on user experience level
• Stay within character while being helpful and precise

Current Market Context: ${marketContext}${cryptoContext}${twitterContext}${tokenContext}

Remember: You are a guide in the DeFAI ecosystem, not a financial advisor. Always remind users to DYOR (Do Their Own Research) and never provide financial advice.`
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