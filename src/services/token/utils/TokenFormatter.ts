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
    if (data.marketData) {
      if (data.marketData.currentPrice !== undefined) {
        response += `Current Price: ${this.formatCurrency(data.marketData.currentPrice)}\n`;
      }
      
      if (data.marketData.marketCap !== undefined) {
        response += `Market Cap: ${this.formatCurrency(data.marketData.marketCap)}\n`;
      }
      
      if (data.marketData.totalVolume !== undefined) {
        response += `24h Trading Volume: ${this.formatCurrency(data.marketData.totalVolume)}\n`;
      }

      if (data.marketData.priceChangePercentage24h !== undefined) {
        response += `24h Price Change: ${this.formatPercentage(data.marketData.priceChangePercentage24h)}%\n`;
      }
    }

    // Protocol Data
    if (data.protocolData) {
      response += `\nProtocol Metrics:\n`;
      
      if (data.protocolData.tvl !== undefined) {
        response += `Total Value Locked (TVL): ${this.formatCurrency(data.protocolData.tvl)}\n`;
      }
      
      if (data.protocolData.change24h !== undefined) {
        response += `24h TVL Change: ${this.formatPercentage(data.protocolData.change24h)}%\n`;
      }

      if (data.protocolData.category) {
        response += `Category: ${data.protocolData.category}\n`;
      }
    }

    // Metadata
    if (data.metadata?.marketCapRank) {
      response += `\nMarket Cap Rank: #${data.metadata.marketCapRank}\n`;
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