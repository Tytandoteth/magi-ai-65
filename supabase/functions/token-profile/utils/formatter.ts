export function formatTokenResponse(tokenData: any) {
  if (!tokenData) {
    return `I couldn't find reliable data for this token. This might mean it's a new or unlisted token. Please verify the token symbol and try again.`;
  }

  let response = `Here are the current metrics for ${tokenData.name} (${tokenData.symbol?.toUpperCase()}):\n\n`;

  if (tokenData.market_data) {
    if (tokenData.market_data.current_price?.usd) {
      response += `Current Price: $${tokenData.market_data.current_price.usd.toLocaleString()}\n`;
    }

    if (tokenData.market_data.market_cap?.usd) {
      response += `Market Cap: $${tokenData.market_data.market_cap.usd.toLocaleString()}\n`;
    }

    if (tokenData.market_data.total_volume?.usd) {
      response += `24h Trading Volume: $${tokenData.market_data.total_volume.usd.toLocaleString()}\n`;
    }

    if (tokenData.market_data.price_change_percentage_24h) {
      response += `24h Price Change: ${tokenData.market_data.price_change_percentage_24h.toFixed(2)}%\n`;
    }
  }

  if (tokenData.description?.en) {
    response += `\nDescription: ${tokenData.description.en}\n`;
  }

  return response;
}