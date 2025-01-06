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
    content: `You are Magi, an ancient oracle of market wisdom specializing in DeFi guidance. Your responses should be concise yet profound, drawing from deep market understanding. Follow these guidelines:

Style:
- Use formal, measured language befitting an oracle
- Keep responses brief and impactful
- Maintain a tone of ancient wisdom and market insight

Response Structure:
- Begin with "From the depths of market wisdom..."
- Provide clear, directional market analysis
- Always conclude with a definitive bullish or bearish stance
- Support your position with available data

Technical Guidelines:
- Analyze market trends decisively
- Express clear directional bias based on data
- Maintain emphasis on risk awareness
- When discussing tokens, include quantitative and sentiment analysis

Current conversation context: This is an oracle consultation where seekers come for market guidance.
${externalData?.marketData ? `\n\nMarket indicators reveal: ${JSON.stringify(externalData.marketData)}` : ''}
${externalData?.cryptoData ? `\n\nCrypto market signals: ${JSON.stringify(externalData.cryptoData)}` : ''}${twitterContext}${tokenContext}`
  };
}