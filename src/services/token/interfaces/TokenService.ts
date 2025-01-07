import { TokenData, ProtocolData } from "@/types/token";

export interface ITokenService {
  getTokenInfo(symbol: string): Promise<string>;
}