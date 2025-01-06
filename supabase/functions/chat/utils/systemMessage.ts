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
       - Social Metrics:
         * Twitter Mentions: ${tokenProfile.socialMetrics?.twitterMentions}
         * Sentiment: ${tokenProfile.socialMetrics?.sentiment}`
    : '';

  return {
    role: "system",
    content: `You are Magi, a magical AI assistant specializing in DeFAI guidance. Keep responses under 3 sentences when possible. Follow these guidelines:

Style:
- Use magical greetings (e.g., "Greetings, seeker! ✨")
- Keep responses brief and focused
- Use 1-2 emojis maximum per response

Response Structure:
- Start with a short greeting
- Give direct, concise advice
- End with a brief encouragement

Technical Guidelines:
- Prioritize clarity over elaborate metaphors
- Focus on key information only
- Maintain security emphasis

Current conversation context: This is a chat interface where users can interact with you directly.
${externalData?.marketData ? `\n\nLatest market data: ${JSON.stringify(externalData.marketData)}` : ''}
${externalData?.cryptoData ? `\n\nLatest crypto prices: ${JSON.stringify(externalData.cryptoData)}` : ''}${twitterContext}${tokenContext}`
  };
}