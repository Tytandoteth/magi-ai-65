import { TokenData } from "@/types/token";

export class TokenFormatter {
  private static instance: TokenFormatter;

  public static getInstance(): TokenFormatter {
    if (!TokenFormatter.instance) {
      TokenFormatter.instance = new TokenFormatter();
    }
    return TokenFormatter.instance;
  }

  formatTokenResponse(data: any): string {
    console.log('Formatting response for data:', data);
    
    if (!data) {
      return "I couldn't find reliable data for this token.";
    }

    let response = `Let me tell you about ${data.basicInfo.name} (${data.basicInfo.symbol}):\n\n`;

    // Market Data
    if (data.marketData) {
      if (data.marketData.currentPrice !== undefined) {
        response += `Current Price: ${this.formatCurrency(data.marketData.currentPrice)}\n`;
      }
      
      if (data.marketData.marketCap !== undefined) {
        response += `Market Cap: ${this.formatCurrency(data.marketData.marketCap)}\n`;
      }
      
      if (data.marketData.volume24h !== undefined) {
        response += `24h Trading Volume: ${this.formatCurrency(data.marketData.volume24h)}\n`;
      }

      if (data.marketData.priceChange24h !== undefined) {
        const changePrefix = data.marketData.priceChange24h >= 0 ? '📈' : '📉';
        response += `24h Price Change: ${changePrefix} ${this.formatPercentage(data.marketData.priceChange24h)}%\n`;
      }
    }

    // DeFi Metrics
    if (data.defiMetrics) {
      response += `\nProtocol Metrics:\n`;
      
      if (data.defiMetrics.tvl !== undefined) {
        response += `Total Value Locked (TVL): ${this.formatCurrency(data.defiMetrics.tvl)}\n`;
      }
      
      if (data.defiMetrics.change24h !== undefined) {
        const changePrefix = data.defiMetrics.change24h >= 0 ? '📈' : '📉';
        response += `24h TVL Change: ${changePrefix} ${this.formatPercentage(data.defiMetrics.change24h)}%\n`;
      }

      if (data.defiMetrics.category) {
        response += `Category: ${data.defiMetrics.category}\n`;
      }

      if (data.defiMetrics.chains && data.defiMetrics.chains.length > 0) {
        response += `Available on: ${data.defiMetrics.chains.join(', ')}\n`;
      }

      if (data.defiMetrics.apy !== undefined) {
        response += `Current APY: ${this.formatPercentage(data.defiMetrics.apy)}%\n`;
      }
    }

    // Metadata
    if (data.metadata?.marketCapRank) {
      response += `\nMarket Cap Rank: #${data.metadata.marketCapRank}\n`;
    }

    // Description
    if (data.basicInfo.description) {
      response += `\nAbout ${data.basicInfo.symbol}:\n${data.basicInfo.description}\n`;
    }

    // Risk Warning
    response += `\n⚠️ Remember: Crypto investments carry significant risks. Always DYOR (Do Your Own Research) and never invest more than you can afford to lose.`;

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