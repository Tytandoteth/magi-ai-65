import { formatTokenResponse } from "@/services/token/utils/responseFormatter";

export const formatContent = (content: string): string => {
  // Format numbers with commas
  content = content.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  
  // Format percentages to 2 decimal places
  content = content.replace(/(\d+\.\d+)%/g, (match) => {
    const num = parseFloat(match);
    return num.toFixed(2) + "%";
  });

  return content;
};

export const createMagiResponse = (data: any, type: 'token' | 'market' | 'defi' | 'general') => {
  switch (type) {
    case 'token':
      return formatTokenResponse(data.tokenData, data.protocolData, data.isTVLQuery);
      
    case 'market':
      return `Market Overview:
Current Market Conditions: ${data.marketCondition}
Total Market Cap: $${data.totalMarketCap.toLocaleString()}
24h Volume: $${data.volume24h.toLocaleString()}
BTC Dominance: ${data.btcDominance.toFixed(2)}%

Key Metrics:
${data.keyMetrics.map((metric: any) => `- ${metric.name}: ${metric.value}`).join('\n')}

Analysis:
${data.analysis}

IMPORTANT: Cryptocurrency investments carry significant risks. Always conduct thorough research and never invest more than you can afford to lose.`;

    case 'defi':
      return `DeFi Protocol Analysis:
Protocol: ${data.name}
TVL: $${data.tvl.toLocaleString()}
APY: ${data.apy.toFixed(2)}%
Risk Level: ${data.riskLevel}

Strategy Details:
${data.details}

Key Considerations:
${data.considerations.map((consideration: string) => `- ${consideration}`).join('\n')}

IMPORTANT: DeFi protocols carry significant smart contract and economic risks. Always conduct thorough due diligence before interacting with any protocol.`;

    case 'general':
      return `${data.response}

Additional Context:
${data.context}

IMPORTANT: This information is for educational purposes only. Always verify information from multiple sources.`;

    default:
      return "I apologize, but I couldn't process that request. Could you please rephrase or provide more details?";
  }
};