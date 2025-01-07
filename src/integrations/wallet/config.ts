import { createWalletClient, http } from 'viem';
import { base } from 'viem/chains';

export const walletClient = createWalletClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
});

console.log('Wallet client initialized');