export interface ApiStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  lastChecked: Date;
  responseTime?: number;
  error?: string;
}

export interface ApiStatusResponse {
  twitter: ApiStatus;
  coingecko: ApiStatus;
  etherscan: ApiStatus;
  cryptoNews: ApiStatus;
}