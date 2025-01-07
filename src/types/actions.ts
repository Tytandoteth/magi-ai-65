export interface HighLevelAction {
  type: 'GET_TOKEN_INFO' | 'CALCULATE_PERCENTAGE' | 'UNKNOWN';
  description: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}