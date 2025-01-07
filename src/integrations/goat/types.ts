export interface BlockchainAction {
  type: 'SEND_ETH' | 'TRANSFER_TOKEN';
  params: {
    to: string;
    value: string;
    token?: string;
  };
}

export interface OnChainToolsConfig {
  wallet: any;
  plugins?: any[];
}

export interface TransactionResult {
  hash: string;
  status: 'success' | 'pending' | 'failed';
  details?: any;
}