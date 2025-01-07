import { TokenData, ProtocolData } from "@/types/token";

export class TokenOperations {
  validateTokenSymbol(symbol: string): string {
    if (!symbol) {
      throw new Error("Token symbol is required");
    }
    return symbol.replace('$', '').toUpperCase();
  }

  isTVLQuery(symbol: string): boolean {
    return symbol.toLowerCase().includes('tvl');
  }

  combineTokenData(
    tokenData: TokenData | null,
    protocolData: ProtocolData | null
  ): { success: boolean; data?: TokenData; protocolData?: ProtocolData; error?: string } {
    if (!tokenData && !protocolData) {
      return {
        success: false,
        error: "No data available for this token"
      };
    }

    return {
      success: true,
      data: tokenData || undefined,
      protocolData: protocolData || undefined
    };
  }
}