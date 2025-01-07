// Maps for token name resolution
export const commonTokens = new Map([
  ['bitcoin', 'BTC'],
  ['ethereum', 'ETH'],
  ['solana', 'SOL'],
  ['cardano', 'ADA'],
  ['dogecoin', 'DOGE'],
  ['ripple', 'XRP'],
  ['polkadot', 'DOT'],
  ['pudgy penguins', 'PENGU'],
  ['pudgypenguins', 'PENGU'],
  ['pengu', 'PENGU']
]);

export const tokenAliases = new Map([
  ['eth', 'ethereum'],
  ['btc', 'bitcoin'],
  ['sol', 'solana'],
  ['doge', 'dogecoin'],
  ['xrp', 'ripple'],
  ['dot', 'polkadot'],
  ['pengu', 'pudgy penguins'],
  ['pudgy', 'pudgy penguins']
]);