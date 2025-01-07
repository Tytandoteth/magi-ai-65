export interface HighLevelAction {
  type: 'GET_TOKEN_INFO' | 'CALCULATE_PERCENTAGE' | 'UNKNOWN' | 'BLOCKCHAIN_ACTION';
  description: string;
  params?: {
    symbol?: string;
    value?: string;
    actionType?: 'SEND_ETH' | 'TRANSFER_TOKEN';
    to?: string;
    token?: string;
  };
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}