export class TokenOperations {
  validateTokenSymbol(symbol: string): string {
    console.log('Validating token symbol:', symbol);
    return symbol.toUpperCase().trim();
  }

  isTVLQuery(symbol: string): boolean {
    return symbol.toLowerCase().includes('tvl');
  }

  combineTokenData(tokenData: any, protocolData: any): any {
    console.log('Combining token data:', { tokenData, protocolData });

    if (!tokenData && !protocolData) {
      return null;
    }

    // Create base combined data from token data
    const combinedData = tokenData ? { ...tokenData } : { 
      name: protocolData?.name,
      symbol: protocolData?.symbol
    };

    // Add protocol metrics if available
    if (protocolData) {
      combinedData.defiMetrics = {
        tvl: protocolData.tvl,
        change_1d: protocolData.change_1d,
        category: protocolData.category,
        chains: protocolData.chains,
        protocol: protocolData.name
      };
    }

    console.log('Combined data result:', combinedData);
    return combinedData;
  }
}