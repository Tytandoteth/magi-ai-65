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
      return "🤔 Hmm, I couldn't find any data for this token. Double-check the symbol or try again in a bit!";
    }

    let response = `Let's take a quick look at ${data.basicInfo.name} (${data.basicInfo.symbol}):\n\n`;

    // Market Data
    if (data.marketData) {
      if (data.marketData.currentPrice !== undefined) {
        response += `💵 Price: ${this.formatCurrency(data.marketData.currentPrice)}\n`;
      }
      
      if (data.marketData.marketCap !== undefined) {
        response += `🌍 Market Cap: ${this.formatCurrency(data.marketData.marketCap)}\n`;
      }
      
      if (data.marketData.volume24h !== undefined) {
        response += `📊 24h Trading Volume: ${this.formatCurrency(data.marketData.volume24h)}\n`;
      }

      if (data.marketData.priceChange24h !== undefined) {
        const changePrefix = data.marketData.priceChange24h >= 0 ? '🔺' : '🔻';
        response += `${changePrefix} Price Movement (24h): ${this.formatPercentage(data.marketData.priceChange24h)}%\n`;
      }
    }

    // DeFi Metrics
    if (data.defiMetrics) {
      response += `\nAnd here's a little extra:\n🔒 Protocol Metrics:\n`;
      
      if (data.defiMetrics.tvl !== undefined) {
        response += `TVL: ${this.formatCurrency(data.defiMetrics.tvl)}\n`;
      }
      
      if (data.defiMetrics.change24h !== undefined) {
        const changePrefix = data.defiMetrics.change24h >= 0 ? '🔺' : '🔻';
        response += `TVL Change (24h): ${this.formatPercentage(data.defiMetrics.change24h)}%\n`;
      }

      if (data.defiMetrics.category) {
        response += `Category: ${data.defiMetrics.category}\n`;
      }
    }

    // Description
    if (data.basicInfo.description) {
      response += `\nWhat's ${data.basicInfo.name} all about?\n"${data.basicInfo.description}"\n`;
    }

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