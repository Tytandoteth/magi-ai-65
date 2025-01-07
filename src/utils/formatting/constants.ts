import { TokenData, DefiData } from '@/types/formatting';
import { FormatUtils } from './FormatUtils';

export const RISK_LEVELS = {
  Low: 'Basic DeFi protocols with established track records',
  Medium: 'Complex DeFi protocols or newer implementations',
  High: 'Experimental protocols or complex financial instruments'
} as const;

export const DISCLAIMERS = {
  token: (data: TokenData) => `
IMPORTANT: Cryptocurrency investments carry significant risks. This token has a market cap of ${
    FormatUtils.number(data.marketCap, { style: 'currency' })
  }. Always conduct thorough research and never invest more than you can afford to lose.`,

  defi: (data: DefiData) => `
IMPORTANT: This ${RISK_LEVELS[data.riskLevel]} carries significant smart contract and economic risks. With a TVL of ${
    FormatUtils.number(data.tvl, { style: 'currency' })
  }, please conduct thorough due diligence before interacting with this protocol.`,

  market: () => `
IMPORTANT: Market conditions can change rapidly. This information should not be considered financial advice.`,

  general: () => `
IMPORTANT: This information is for educational purposes only. Always verify from multiple sources.`
} as const;