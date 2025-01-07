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

    // Only combine protocol data if the symbols match
    if (protocolData && tokenData && 
        protocolData.symbol && tokenData.symbol &&
        protocolData.symbol.toLowerCase() === tokenData.symbol.toLowerCase()) {
      console.log('Symbols match, combining protocol data');
      return {
        ...tokenData,
        defiMetrics: {
          tvl: protocolData.tvl,
          change24h: protocolData.change_1d,
          category: protocolData.category,
          chains: protocolData.chains,
          protocol: protocolData.name
        }
      };
    }

    // If symbols don't match, return token data without protocol metrics
    console.log('Symbols do not match, returning token data only');
    return tokenData;
  }
}