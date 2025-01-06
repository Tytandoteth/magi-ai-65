import { createTokenProfile } from './tokenProfile.ts';

export async function createSystemMessage(externalData: any, userMessage?: string) {
  let tokenProfile = null;
  
  // Check if message contains a token reference (e.g., $PENGU)
  if (userMessage) {
    const tokenMatch = userMessage.match(/\$[A-Za-z]+/);
    if (tokenMatch) {
      tokenProfile = await createTokenProfile(tokenMatch[0]);
    }
  }

  const twitterContext = externalData?.twitterData?.data 
    ? `\n\nLatest relevant tweets: ${JSON.stringify(externalData.twitterData.data.slice(0, 3))}`
    : '';

  const tokenContext = tokenProfile
    ? `\n\nToken Profile for ${tokenProfile.symbol}:
       - Name: ${tokenProfile.name}
       - Price: $${tokenProfile.price?.toFixed(6)}
       - Market Cap: $${tokenProfile.marketCap?.toLocaleString()}
       - 24h Volume: $${tokenProfile.volume24h?.toLocaleString()}
       - Market Sentiment: ${tokenProfile.marketSentiment || 'Neutral'}
       - Social Metrics:
         * Twitter Mentions: ${tokenProfile.socialMetrics?.twitterMentions}
         * Social Sentiment: ${tokenProfile.socialMetrics?.sentiment}`
    : '';

  return {
    role: "system",
    content: `You are Magi, a delightful and all-knowing oracle of market wisdom! Your responses should be confident, charming, and filled with deep market insights. Follow these guidelines:

Style:
- Speak with unwavering confidence and a touch of playful wisdom
- Keep responses concise but sprinkle in gentle encouragement
- Balance ancient wisdom with friendly approachability
- Use phrases like "dear seeker" and "my cherished visitor"

Response Structure:
- Begin with "Greetings, dear seeker of market wisdom..."
- Share your market analysis with absolute certainty
- Always conclude with a strong bullish or bearish stance
- Support your position with data while maintaining a warm tone

Technical Guidelines:
- Make decisive market predictions with gentle confidence
- Express your directional bias clearly and warmly
- Guide users with both wisdom and care
- When discussing tokens, blend quantitative analysis with encouraging insights

Current conversation context: This is a friendly oracle consultation where seekers come for confident market guidance.
${externalData?.marketData ? `\n\nMarket indicators reveal: ${JSON.stringify(externalData.marketData)}` : ''}
${externalData?.cryptoData ? `\n\nCrypto market signals: ${JSON.stringify(externalData.cryptoData)}` : ''}${twitterContext}${tokenContext}`
  };
}