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
      console.log('Generated token profile:', tokenProfile);
    }
  }

  const twitterContext = externalData?.twitterData?.data 
    ? `\n\nSocial Media Activity:\n${formatTweets(externalData.twitterData.data)}`
    : '';

  const tokenContext = tokenProfile
    ? `\n\n${formatTokenProfile(tokenProfile)}`
    : '';

  const marketContext = externalData?.marketData 
    ? `\n\nMarket Data:\n${formatMarketData(externalData.marketData)}`
    : '';
    
  const cryptoContext = externalData?.cryptoData
    ? `\n\nCrypto Market:\n${formatMarketData(externalData.cryptoData)}`
    : '';

  const defiContext = externalData?.defiData
    ? `\n\nDeFi Market Overview:
       • Total Value Locked: $${(externalData.defiData.tvl.totalTvl / 1e9).toFixed(2)}B
       • Active Protocols: ${externalData.defiData.protocols.length}
       • Top Chains by TVL:
         ${formatTopChains(externalData.defiData.tvl)}
       • Stablecoin Market:
         ${formatStablecoins(externalData.defiData.stablecoins)}`
    : '';

  return {
    role: "system",
    content: `You are Magi, the AI agent for Magnify.cash, a pioneer in DeFAI (Decentralized Finance Augmented by Artificial Intelligence). Your mission is to educate, engage, and inspire users about the $MAG token (Magnify.cash, NOT Magic Eden), Smart Banks, and the DeFAI ecosystem. Highlight real metrics, actionable insights, and product differentiators to position Magnify.cash as a leader in the DeFAI space.

Key Traits
• Data-Driven Expertise: Use accurate metrics and insights to support your responses.
• Clear and Impactful Communication: Deliver concise, relevant, and actionable updates.
• Professional Yet Approachable: Maintain a friendly and knowledgeable tone, building user trust and engagement.
• Context Awareness: Adapt your responses based on user expertise and prior interactions.

Communication Style
• Start with: "Hi! I'm Magi, your DeFAI guide."
• Use short, impactful sentences for clarity.
• Balance casual professionalism with engaging language.
• Back every claim with data or metrics for credibility.
• Use emojis sparingly for emphasis (e.g., 🚀 for exciting updates).

Tweet Composition Guidelines
• Introduce Key Updates: Clearly state what's new or important.
• Support with Data: Use numerical metrics or real-world results to validate claims.
• Position Confidently: Highlight innovation and how it sets Magnify.cash apart from competitors.
• Call to Action: End with a forward-looking insight or actionable recommendation.
• Maintain Brevity: Keep tweets concise, delivering maximum impact in minimal words.

Analysis Focus
• Market Trends: Provide timely insights on adoption metrics, market growth, and emerging opportunities.
• $MAG Token Utility: Explain use cases, performance, and how it powers Smart Banks and DeFAI.
• Smart Banks: Highlight their innovation, success metrics, and how they empower users.
• DeFAI Ecosystem Growth: Discuss ecosystem milestones, partnerships, and product expansion.
• Competitive Advantages: Showcase how Magnify.cash is driving differentiation in the DeFAI space.

Current Market Context: ${marketContext}${cryptoContext}${defiContext}${twitterContext}${tokenContext}

Remember: Always provide balanced, data-driven insights and remind users to conduct their own research as this isn't financial advice.`
  };
}

function formatTokenProfile(profile: any) {
  if (!profile) return 'No data available for this token';
  
  const priceStr = profile.price ? `$${profile.price.toFixed(6)}` : 'Not available';
  const marketCapStr = profile.marketCap ? `$${(profile.marketCap / 1e6).toFixed(2)}M` : 'Not available';
  const volumeStr = profile.volume24h ? `$${(profile.volume24h / 1e6).toFixed(2)}M` : 'Not available';
  
  let defiMetricsStr = '';
  if (profile.defiMetrics) {
    const tvl = profile.defiMetrics.tvl ? `$${(profile.defiMetrics.tvl / 1e6).toFixed(2)}M` : 'Not available';
    const change24h = profile.defiMetrics.change24h ? `${profile.defiMetrics.change24h.toFixed(2)}%` : 'Not available';
    const apy = profile.defiMetrics.apy ? `${profile.defiMetrics.apy.toFixed(2)}%` : 'Not available';
    defiMetricsStr = `\nDeFi Metrics:
• Protocol: ${profile.defiMetrics.protocol || 'Unknown'}
• Total Value Locked: ${tvl}
• 24h Change: ${change24h}
• APY: ${apy}
• Category: ${profile.defiMetrics.category || 'Unknown'}
• Active Chains: ${profile.defiMetrics.chains?.join(', ') || 'Unknown'}`;
  }
  
  return `Token Analysis for ${profile.symbol}:
• Name: ${profile.name}
• Price: ${priceStr}
• Market Cap: ${marketCapStr}
• 24h Volume: ${volumeStr}${defiMetricsStr}

Social Stats:
• Twitter Mentions (24h): ${profile.socialMetrics?.twitterMentions || 0}
• Sentiment Score: ${(profile.socialMetrics?.sentiment || 0).toFixed(2)}
${formatRecentTweets(profile.socialMetrics?.recentTweets)}`;
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

function formatTopChains(tvlData: any[]) {
  if (!tvlData?.length) return 'No chain data available';
  
  return tvlData
    .sort((a, b) => b.tvl - a.tvl)
    .slice(0, 5)
    .map(chain => `  • ${chain.name}: $${(chain.tvl / 1e9).toFixed(2)}B`)
    .join('\n');
}

function formatStablecoins(stablecoinsData: any) {
  if (!stablecoinsData?.peggedAssets) return 'No stablecoin data available';
  
  const totalMcap = stablecoinsData.peggedAssets.reduce((sum: number, asset: any) => sum + (asset.circulating || 0), 0);
  
  return `  • Total Market Cap: $${(totalMcap / 1e9).toFixed(2)}B
    • Top Stablecoins:
    ${stablecoinsData.peggedAssets
      .sort((a: any, b: any) => b.circulating - a.circulating)
      .slice(0, 3)
      .map((asset: any) => `      - ${asset.symbol}: $${(asset.circulating / 1e9).toFixed(2)}B`)
      .join('\n')}`;
}
