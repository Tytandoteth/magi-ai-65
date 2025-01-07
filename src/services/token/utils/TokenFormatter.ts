import { TokenData, ProtocolData } from "@/types/token";

export class TokenFormatter {
  formatResponse(data: TokenData & { defiMetrics?: ProtocolData }): string {
    console.log('Formatting response for data:', data);
    
    if (!data) {
      return "Token data not found";
    }

    let response = `Here are the current metrics for ${data.name} (${data.symbol}):\n\n`;

    // Format market data
    if (data.market_data) {
      if (data.market_data.current_price?.usd) {
        response += `Current Price: ${this.formatCurrency(data.market_data.current_price.usd)}\n`;
      }
      
      if (data.market_data.market_cap?.usd) {
        response += `Market Cap: ${this.formatCurrency(data.market_data.market_cap.usd)}\n`;
      }
      
      if (data.market_data.total_volume?.usd) {
        response += `24h Trading Volume: ${this.formatCurrency(data.market_data.total_volume.usd)}\n`;
      }

      if (data.market_data.price_change_percentage_24h) {
        response += `24h Price Change: ${this.formatPercentage(data.market_data.price_change_percentage_24h)}%\n`;
      }
    }

    // Add protocol metrics if available
    if (data.defiMetrics) {
      response += `\nProtocol Metrics:\n`;
      if (data.defiMetrics.tvl) {
        response += `Total Value Locked (TVL): ${this.formatCurrency(data.defiMetrics.tvl)}\n`;
      }
      
      if (data.defiMetrics.change_1d) {
        response += `24h TVL Change: ${this.formatPercentage(data.defiMetrics.change_1d)}%\n`;
      }

      if (data.defiMetrics.category) {
        response += `Category: ${data.defiMetrics.category}\n`;
      }
    }

    // Add market cap rank if available
    if (data.metadata?.additional_metrics?.market_cap_rank) {
      response += `\nMarket Cap Rank: #${data.metadata.additional_metrics.market_cap_rank}\n`;
    }

    // Add description if available
    if (data.description) {
      response += `\nDescription:\n${data.description}\n`;
    }

    // Add disclaimer
    response += `\nIMPORTANT: Cryptocurrency investments carry significant risks. Always conduct thorough research, verify information from multiple sources, and never invest more than you can afford to lose.`;

    return response;
  }

  private formatCurrency(value: number): string {
    if (value >= 1) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    } else {
      // For values less than 1, use more decimal places
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 8
      }).format(value);
    }
  }

  private formatPercentage(value: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
}