import { TokenMetadata } from '@/types/token/metadata';

export const tokenMetadata = new Map<string, TokenMetadata>([
  ['BTC', {
    symbol: 'BTC',
    commonNames: ['bitcoin', 'btc', 'xbt'],
    decimals: 8,
    chainData: {
      1: { address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', verified: true },
      56: { address: '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c', verified: true }
    }
  }],
  ['ETH', {
    symbol: 'ETH',
    commonNames: ['ethereum', 'eth', 'ether'],
    decimals: 18,
    chainData: {
      1: { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', verified: true },
      56: { address: '0x2170ed0880ac9a755fd29b2688956bd959f933f8', verified: true }
    }
  }],
  ['PENGU', {
    symbol: 'PENGU',
    commonNames: ['pengu', 'pudgypenguins', 'pudgy'],
    decimals: 18,
    chainData: {
      1: { address: '0x2Fd9a39ACF071Aa61f92F3D7A98332c68d6B6602', verified: true }
    }
  }]
]);

// Create reverse lookup for efficient symbol resolution
export const symbolLookup = new Map<string, string>();
for (const [symbol, data] of tokenMetadata.entries()) {
  for (const name of data.commonNames) {
    symbolLookup.set(name.toLowerCase(), symbol);
  }
}