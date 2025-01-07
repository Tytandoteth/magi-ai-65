# Magi AI API Documentation

## External APIs

### CoinGecko
- Purpose: Fetch token prices and market data
- Endpoint: `https://api.coingecko.com/api/v3`
- Rate Limits: 50 calls/minute
- Error Handling: Implements exponential backoff

### DefiLlama
- Purpose: Protocol TVL and metrics
- Endpoint: `https://api.llama.fi`
- Rate Limits: 30 calls/minute
- Cache Duration: 5 minutes

### Etherscan
- Purpose: On-chain data
- Endpoint: `https://api.etherscan.io/api`
- Rate Limits: 5 calls/second
- Required Headers: API key

## Internal APIs

### Chat API
- Purpose: Message handling
- Endpoint: `/api/chat`
- Methods: POST
- Authentication: Required
- Rate Limits: 100 requests/minute

### Market Data API
- Purpose: Aggregated market metrics
- Endpoint: `/api/market-data`
- Methods: GET
- Cache Duration: 1 minute
- Rate Limits: 300 requests/minute

## Error Codes

- 1000: Rate limit exceeded
- 1001: Invalid API key
- 1002: Service unavailable
- 1003: Invalid request format
- 1004: Authentication failed

## Response Formats

### Success Response
```json
{
  "status": "success",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "status": "error",
  "error": {
    "code": 1000,
    "message": "Rate limit exceeded"
  }
}
```