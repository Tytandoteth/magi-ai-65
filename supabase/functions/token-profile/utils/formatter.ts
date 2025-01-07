export function formatTokenResponse(tokenData: any): string {
  let response = `Here are the current metrics for ${tokenData.name} (${tokenData.symbol.toUpperCase()}):\n\n`;

  if (tokenData.market_data) {
    const marketData = tokenData.market_data;
    
    if (marketData.current_price?.usd) {
      response += `Current Price: $${marketData.current_price.usd.toLocaleString()}\n`;
    }
    
    if (marketData.market_cap?.usd) {
      response += `Market Cap: $${marketData.market_cap.usd.toLocaleString()}\n`;
    }
    
    if (marketData.total_volume?.usd) {
      response += `24h Trading Volume: $${marketData.total_volume.usd.toLocaleString()}\n`;
    }

    if (marketData.price_change_percentage_24h) {
      response += `24h Price Change: ${marketData.price_change_percentage_24h.toFixed(2)}%\n`;
    }
  }

  if (tokenData.metadata?.additional_metrics?.market_cap_rank) {
    response += `Market Cap Rank: #${tokenData.metadata.additional_metrics.market_cap_rank}\n`;
  }

  if (tokenData.description) {
    response += `\nDescription: ${tokenData.description}\n`;
  }

  response += `\nIMPORTANT: Cryptocurrency investments carry significant risks. Always conduct thorough research and never invest more than you can afford to lose.`;

  return response;
}