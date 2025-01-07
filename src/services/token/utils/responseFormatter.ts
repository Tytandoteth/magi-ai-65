interface TokenResponse {
  name: string;
  symbol: string;
  market_data?: {
    current_price?: { usd?: number };
    market_cap?: { usd?: number };
    total_volume?: { usd?: number };
    price_change_percentage_24h?: number;
  };
  metadata?: {
    additional_metrics?: {
      market_cap_rank?: number;
    };
  };
  description?: string;
}

interface ProtocolData {
  tvl?: number;
  change_1d?: number;
  category?: string;
}

export function formatTokenResponse(
  tokenData: TokenResponse | null, 
  protocolData: ProtocolData | null, 
  isTVLQuery: boolean
): string {
  if (!tokenData && !protocolData) {
    return "Token data not found";
  }

  // If it's a TVL query and we have protocol data, prioritize that information
  if (isTVLQuery && protocolData?.tvl) {
    let response = `${tokenData?.name} (${tokenData?.symbol}) TVL Metrics:\n\n`;
    response += `Total Value Locked (TVL): $${protocolData.tvl.toLocaleString()}\n`;
    
    if (protocolData.change_1d) {
      response += `24h TVL Change: ${protocolData.change_1d.toFixed(2)}%\n`;
    }

    if (protocolData.category) {
      response += `Protocol Category: ${protocolData.category}\n`;
    }

    // Add market context for reference
    if (tokenData?.market_data?.current_price?.usd) {
      response += `\nToken Price: $${tokenData.market_data.current_price.usd.toLocaleString()}\n`;
    }

    if (tokenData?.market_data?.market_cap?.usd) {
      response += `Market Cap: $${tokenData.market_data.market_cap.usd.toLocaleString()}\n`;
    }

    response += `\nIMPORTANT: Cryptocurrency investments carry significant risks. Always conduct thorough research, verify information from multiple sources, and never invest more than you can afford to lose.`;
    
    return response;
  }

  // Regular token information format
  let response = `Here are the current metrics for ${tokenData?.name} (${tokenData?.symbol}):\n\n`;

  if (tokenData?.market_data) {
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

  // Add TVL data if available
  if (protocolData?.tvl) {
    response += `Total Value Locked (TVL): $${protocolData.tvl.toLocaleString()}\n`;
    
    if (protocolData.change_1d) {
      response += `24h TVL Change: ${protocolData.change_1d.toFixed(2)}%\n`;
    }

    if (protocolData.category) {
      response += `Protocol Category: ${protocolData.category}\n`;
    }
  }

  if (tokenData?.metadata?.additional_metrics?.market_cap_rank) {
    response += `Market Cap Rank: #${tokenData.metadata.additional_metrics.market_cap_rank}\n`;
  }

  if (tokenData?.description) {
    response += `\nDescription: ${tokenData.description}\n`;
  }

  response += `\nIMPORTANT: Cryptocurrency investments carry significant risks. Always conduct thorough research, verify information from multiple sources, and never invest more than you can afford to lose.`;

  return response;
}