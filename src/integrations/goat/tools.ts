import { walletClient } from '../wallet/config';
import { BlockchainAction, TransactionResult } from './types';
import { parseEther } from 'viem';

class OnChainTools {
  private wallet;

  constructor(wallet: any) {
    this.wallet = wallet;
    console.log('OnChainTools initialized with wallet');
  }

  async executeAction(action: BlockchainAction): Promise<TransactionResult> {
    console.log('Executing blockchain action:', action);
    
    try {
      switch (action.type) {
        case 'SEND_ETH':
          return await this.sendETH(action.params.to, action.params.value);
        case 'TRANSFER_TOKEN':
          return await this.transferToken(
            action.params.to, 
            action.params.value,
            action.params.token!
          );
        default:
          throw new Error(`Unsupported action type: ${action.type}`);
      }
    } catch (error) {
      console.error('Error executing blockchain action:', error);
      throw error;
    }
  }

  private async sendETH(to: string, value: string): Promise<TransactionResult> {
    try {
      const hash = await this.wallet.sendTransaction({
        to,
        value: parseEther(value),
      });

      return {
        hash,
        status: 'success',
      };
    } catch (error) {
      console.error('Error sending ETH:', error);
      return {
        hash: '',
        status: 'failed',
        details: error,
      };
    }
  }

  private async transferToken(
    to: string,
    value: string,
    token: string
  ): Promise<TransactionResult> {
    // This is a placeholder for ERC20 token transfers
    // Would need to be implemented with actual contract calls
    console.log('Token transfer requested:', { to, value, token });
    throw new Error('Token transfers not yet implemented');
  }
}

export const onChainTools = new OnChainTools(walletClient);