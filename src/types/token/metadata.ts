export interface TokenData {
  symbol: string;
  name: string;
  decimals: number;
  address?: string;
  chainId?: number;
}

export interface TokenMetadata {
  symbol: string;
  commonNames: string[];
  decimals: number;
  chainData: {
    [chainId: number]: {
      address: string;
      verified: boolean;
    };
  };
}