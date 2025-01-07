import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchFromCoinGecko } from '@/services/token/utils/coingecko';

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('fetchFromCoinGecko', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should fetch Pudgy Penguins data', async () => {
    // Mock successful search response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        coins: [{
          id: 'pudgy-penguins',
          symbol: 'pengu',
          name: 'Pudgy Penguins'
        }]
      })
    });

    // Mock successful details response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'pudgy-penguins',
        symbol: 'pengu',
        name: 'Pudgy Penguins'
      })
    });

    const data = await fetchFromCoinGecko('PENGU', 'test-api-key');
    expect(data).toHaveProperty('id', 'pudgy-penguins');
  });

  it('should fetch Ethereum data', async () => {
    // Mock successful search response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        coins: [{
          id: 'ethereum',
          symbol: 'eth',
          name: 'Ethereum'
        }]
      })
    });

    // Mock successful details response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum'
      })
    });

    const data = await fetchFromCoinGecko('ETH', 'test-api-key');
    expect(data).toHaveProperty('id', 'ethereum');
  });

  it('should handle unknown tokens gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ coins: [] })
    });

    const data = await fetchFromCoinGecko('INVALID', 'test-api-key');
    expect(data).toBeNull();
  });

  it('should handle API errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'));

    await expect(fetchFromCoinGecko('ETH', 'test-api-key')).rejects.toThrow('API Error');
  });
});