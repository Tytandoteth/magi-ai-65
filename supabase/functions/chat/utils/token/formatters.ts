export const formatTokenProfile = (profile: any) => {
  if (!profile || !profile.price) {
    return `I apologize, but I cannot provide complete information about this token at the moment due to data availability issues.`;
  }

  const formatNumber = (num: number) => {
    if (num >= 1e9) {
      return `$${(num / 1e9).toFixed(2)} billion`;
    } else if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(2)} million`;
    }
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(2)}%`;
  };

  let response = `Here are the current metrics for ${profile.name} (${profile.symbol}):\n\n`;

  if (profile.price) {
    response += `Current Price: ${formatNumber(profile.price)}\n`;
  }

  if (profile.marketCap) {
    response += `Market Cap: ${formatNumber(profile.marketCap)}\n`;
  }

  if (profile.volume24h) {
    response += `24h Trading Volume: ${formatNumber(profile.volume24h)}\n`;
  }

  if (profile.defiMetrics?.tvl) {
    response += `\nProtocol Metrics:\n`;
    response += `Total Value Locked (TVL): ${formatNumber(profile.defiMetrics.tvl)}\n`;
    
    if (profile.defiMetrics.change24h) {
      response += `24h TVL Change: ${formatPercentage(profile.defiMetrics.change24h)}\n`;
    }
  }

  if (profile.socialMetrics) {
    response += `\nSocial Metrics:\n`;
    response += `Twitter Mentions (24h): ${profile.socialMetrics.twitterMentions}\n`;
    if (profile.socialMetrics.sentiment) {
      response += `Social Sentiment Score: ${profile.socialMetrics.sentiment.toFixed(2)}\n`;
    }
  }

  response += `\nPlease note that cryptocurrency investments carry risks. Always conduct thorough research before making investment decisions.`;

  return response;
};