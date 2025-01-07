export const formatTokenProfile = (profile: any) => {
  if (!profile) {
    return `I apologize, but I couldn't find reliable data for this token. This might mean it's a new or unlisted token. Please conduct thorough research before considering any investment.`;
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

  // Market Data
  const marketData = profile.market_data || {};
  if (marketData.current_price?.usd) {
    response += `Current Price: ${formatNumber(marketData.current_price.usd)}\n`;
  }

  if (marketData.market_cap?.usd) {
    response += `Market Cap: ${formatNumber(marketData.market_cap.usd)}\n`;
  }

  if (marketData.total_volume?.usd) {
    response += `24h Trading Volume: ${formatNumber(marketData.total_volume.usd)}\n`;
  }

  if (marketData.price_change_percentage_24h) {
    response += `24h Price Change: ${formatPercentage(marketData.price_change_percentage_24h)}\n`;
  }

  // Additional Metrics
  const metadata = profile.metadata?.additional_metrics || {};
  if (metadata.market_cap_rank) {
    response += `Market Cap Rank: #${metadata.market_cap_rank}\n`;
  }

  if (metadata.coingecko_score) {
    response += `CoinGecko Score: ${metadata.coingecko_score.toFixed(2)}/100\n`;
  }

  // DeFi Metrics
  if (profile.defiMetrics?.tvl) {
    response += `\nProtocol Metrics:\n`;
    response += `Total Value Locked (TVL): ${formatNumber(profile.defiMetrics.tvl)}\n`;
    
    if (profile.defiMetrics.change24h) {
      response += `24h TVL Change: ${formatPercentage(profile.defiMetrics.change24h)}\n`;
    }

    if (profile.defiMetrics.category) {
      response += `Category: ${profile.defiMetrics.category}\n`;
    }
  }

  // Description
  if (profile.description) {
    response += `\nDescription:\n${profile.description}\n`;
  }

  // Risk Warning
  response += `\nIMPORTANT: Cryptocurrency investments carry significant risks. Always conduct thorough research, verify information from multiple sources, and never invest more than you can afford to lose.`;

  return response;
};