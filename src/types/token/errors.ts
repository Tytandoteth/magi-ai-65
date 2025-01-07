export type TokenErrorCode = 
  | 'INVALID_SYMBOL'
  | 'NO_DATA_FOUND'
  | 'NETWORK_ERROR'
  | 'INVALID_CHAIN'
  | 'RATE_LIMIT_EXCEEDED';

export class TokenError extends Error {
  constructor(
    message: string,
    public readonly code: TokenErrorCode,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'TokenError';
  }
}