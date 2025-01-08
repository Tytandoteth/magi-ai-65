export type ActionType = 
  | 'TOKEN_INFO'
  | 'DEFI_TVL_RANKING'
  | 'MARKET_ANALYSIS'
  | 'CRYPTO_NEWS'
  | 'DEFI_STRATEGIES'
  | 'UNKNOWN';

export interface HighLevelAction {
  type: ActionType;
  params: Record<string, any>;
}