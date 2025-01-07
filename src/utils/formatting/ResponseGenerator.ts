import { TokenData, MarketData, DefiData, ResponseType, ProtocolData } from '@/types/formatting';
import { FormatUtils } from './FormatUtils';
import { DISCLAIMERS } from './constants';

export class ResponseGenerator {
  static createTokenResponse(data: TokenData & { protocolData?: ProtocolData }): string {
    console.log('Generating token response for:', data);
    const { name, symbol, price, priceChange24h, metrics, protocolData } = data;
    
    const baseResponse = `
${name} (${symbol}) Analysis:
Current Price: ${FormatUtils.number(price, { style: 'currency' })}
24h Change: ${FormatUtils.number(priceChange24h, { style: 'percent' })}

Key Metrics:
${FormatUtils.formatMetrics(metrics)}`;

    const protocolSection = protocolData ? `
Protocol Metrics:
${FormatUtils.formatMetrics(protocolData.metrics)}
Risk Level: ${protocolData.riskLevel}` : '';

    return `${baseResponse}${protocolSection}

${DISCLAIMERS.token(data)}`.trim();
  }

  static createMarketResponse(data: MarketData): string {
    console.log('Generating market response for:', data);
    return `
Market Overview:
${data.marketCondition}

Key Metrics:
${FormatUtils.formatMetrics(data.keyMetrics)}

Analysis:
${data.analysis}

${DISCLAIMERS.market()}`.trim();
  }

  static createDefiResponse(data: DefiData): string {
    console.log('Generating DeFi response for:', data);
    return `
${data.name} Protocol Analysis:
${FormatUtils.formatMetrics(data.metrics)}
Risk Level: ${data.riskLevel}

Strategy Details:
${data.details}

Key Considerations:
${data.considerations.map(c => `- ${c}`).join('\n')}

${DISCLAIMERS.defi(data)}`.trim();
  }

  static createResponse(
    data: TokenData | MarketData | DefiData | { response: string; context: string },
    type: ResponseType
  ): string {
    try {
      console.log('Creating response of type:', type);
      
      switch (type) {
        case 'token':
          return this.createTokenResponse(data as TokenData & { protocolData?: ProtocolData });
        case 'market':
          return this.createMarketResponse(data as MarketData);
        case 'defi':
          return this.createDefiResponse(data as DefiData);
        case 'general':
          const generalData = data as { response: string; context: string };
          return `${generalData.response}\n\nAdditional Context:\n${generalData.context}\n\n${DISCLAIMERS.general()}`;
        default:
          throw new Error(`Unsupported response type: ${type}`);
      }
    } catch (error) {
      console.error(`Error generating ${type} response:`, error);
      throw new Error(`Failed to generate ${type} response: ${error.message}`);
    }
  }
}