import { TokenData } from "@/types/token";

export class TokenFormatter {
  private static instance: TokenFormatter;

  public static getInstance(): TokenFormatter {
    if (!TokenFormatter.instance) {
      TokenFormatter.instance = new TokenFormatter();
    }
    return TokenFormatter.instance;
  }

  formatTokenResponse(data: TokenData): string {
    console.log('Formatting response for data:', data);
    
    let response = `Here are the current metrics for ${data.name} (${data.symbol}):\n\n`;

    // Market Data
    if (data.market_data) {
      if (data.market_data.current_price?.usd !== undefined) {
        response += `Current Price: ${this.formatCurrency(data.market_data.current_price.usd)}\n`;
      }
      
      if (data.market_data.market_cap?.usd !== undefined) {
        response += `Market Cap: ${this.formatCurrency(data.market_data.market_cap.usd)}\n`;
      }
      
      if (data.market_data.total_volume?.usd !== undefined) {
        response += `24h Trading Volume: ${this.formatCurrency(data.market_data.total_volume.usd)}\n`;
      }

      if (data.market_data.price_change_percentage_24h !== undefined) {
        response += `24h Price Change: ${this.formatPercentage(data.market_data.price_change_percentage_24h)}%\n`;
      }
    }

    // Protocol Data
    if (data.protocol_data) {
      response += `\nProtocol Metrics:\n`;
      
      if (data.protocol_data.tvl !== undefined) {
        response += `Total Value Locked (TVL): ${this.formatCurrency(data.protocol_data.tvl)}\n`;
      }
      
      if (data.protocol_data.change_24h !== undefined) {
        response += `24h TVL Change: ${this.formatPercentage(data.protocol_data.change_24h)}%\n`;
      }

      if (data.protocol_data.category) {
        response += `Category: ${data.protocol_data.category}\n`;
      }

      if (data.protocol_data.chains && data.protocol_data.chains.length > 0) {
        response += `Chains: ${data.protocol_data.chains.join(', ')}\n`;
      }

      if (data.protocol_data.apy !== undefined) {
        response += `APY: ${this.formatPercentage(data.protocol_data.apy)}%\n`;
      }
    }

    // Metadata
    if (data.metadata?.additional_metrics?.market_cap_rank) {
      response += `\nMarket Cap Rank: #${data.metadata.additional_metrics.market_cap_rank}\n`;
    }

    // Description
    if (data.description) {
      response += `\nDescription:\n${data.description}\n`;
    }

    // Risk Warning
    response += `\nIMPORTANT: Cryptocurrency investments carry significant risks. Always conduct thorough research, verify information from multiple sources, and never invest more than you can afford to lose.`;

    return response;
  }

  private formatCurrency(value: number): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: value >= 1 ? 2 : 8,
      notation: value >= 1_000_000 ? 'compact' : 'standard',
      compactDisplay: 'short'
    });
    
    return formatter.format(value);
  }

  private formatPercentage(value: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
}