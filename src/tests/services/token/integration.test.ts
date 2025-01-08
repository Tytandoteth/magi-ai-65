import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TokenResolver } from '@/services/token/TokenResolver';
import { fetchFromCoinGecko } from '@/services/token/utils/coingecko';

// Mock fetchFromCoinGecko
vi.mock('@/services/token/utils/coingecko', () => ({
  fetchFromCoinGecko: vi.fn()
}));

describe('Token Integration Tests', () => {
  const mockFetchFromCoinGecko = fetchFromCoinGecko as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function getTokenData(content: string, apiKey: string) {
    console.log('Getting token data for:', content);
    const resolvedSymbol = await TokenResolver.resolveTokenSymbol(content);
    
    if (!resolvedSymbol) {
      console.error('Token not resolved:', content);
      return null;
    }
    
    console.log('Resolved symbol:', resolvedSymbol);
    return await fetchFromCoinGecko(resolvedSymbol, apiKey);
  }

  it('should handle the complete flow for PENGU', async () => {
    (mockFetchFromCoinGecko as any).mockResolvedValueOnce({
      id: 'pudgy-penguins',
      symbol: 'pengu',
      name: 'Pudgy Penguins'
    });

    const result = await getTokenData('$PENGU', 'test-api-key');
    expect(result).toHaveProperty('id', 'pudgy-penguins');
  });

  it('should handle invalid tokens in the complete flow', async () => {
    const result = await getTokenData('$INVALID', 'test-api-key');
    expect(result).toBeNull();
    expect(mockFetchFromCoinGecko).not.toHaveBeenCalled();
  });

  it('should handle API errors in the complete flow', async () => {
    (mockFetchFromCoinGecko as any).mockRejectedValueOnce(new Error('API Error'));

    await expect(getTokenData('$ETH', 'test-api-key')).rejects.toThrow('API Error');
  });
});