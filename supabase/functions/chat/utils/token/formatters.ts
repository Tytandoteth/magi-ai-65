export function formatTokenProfile(profile: any): string {
  if (!profile) return 'No data available for this token';
  
  const name = profile.name || 'Unknown';
  const priceStr = profile.price ? 
    `$${Number(profile.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}` : 
    'Not available';
  
  const marketCapStr = profile.marketCap ? 
    `$${(profile.marketCap / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M` : 
    'Not available';
  
  const volumeStr = profile.volume24h ? 
    `$${(profile.volume24h / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M` : 
    'Not available';

  let defiMetricsStr = '';
  if (profile.defiMetrics) {
    const tvl = profile.defiMetrics.tvl ? 
      `$${(profile.defiMetrics.tvl / 1e6).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M` : 
      'Not available';
    const change24h = profile.defiMetrics.change24h ? 
      `${profile.defiMetrics.change24h.toFixed(2)}%` : 
      'Not available';
    const apy = profile.defiMetrics.apy ? 
      `${profile.defiMetrics.apy.toFixed(2)}%` : 
      'Not available';
    
    defiMetricsStr = `\n\nDeFi Metrics:\n• Protocol: ${profile.defiMetrics.protocol || 'Unknown'}\n• Total Value Locked: ${tvl}\n• 24h Change: ${change24h}\n• APY: ${apy}\n• Category: ${profile.defiMetrics.category || 'Unknown'}\n• Active Chains: ${profile.defiMetrics.chains?.join(', ') || 'Unknown'}`;
  }

  const description = profile.description ? `\n\nDescription: ${profile.description}` : '';
  
  return `Hi! I'm Magi, your DeFAI guide. Let me tell you about ${name} (${profile.symbol}):

Current Price: ${priceStr}
Market Cap: ${marketCapStr}
24h Trading Volume: ${volumeStr}${defiMetricsStr}${description}

Social Activity:
• Twitter Mentions (24h): ${profile.socialMetrics?.twitterMentions || 0}
• Sentiment Score: ${(profile.socialMetrics?.sentiment || 0).toFixed(2)}

Remember to conduct your own research before making any investment decisions.`;
}