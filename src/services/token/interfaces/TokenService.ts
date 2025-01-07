import { TokenData, ProtocolData, TokenResponse } from "@/types/token";

export interface ITokenService {
  getTokenInfo(symbol: string): Promise<string>;
  fetchTokenData(symbol: string): Promise<TokenData | null>;
  fetchProtocolData(symbol: string): Promise<ProtocolData | null>;
}