import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LowLevelPlanner } from '@/services/planners/LowLevelPlanner';
import { InventoryManager } from '@/services/inventory/InventoryManager';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { total_value_locked: 1000000 },
              error: null
            }))
          }))
        }))
      }))
    }))
  }
}));

describe('LowLevelPlanner', () => {
  let planner: LowLevelPlanner;
  let mockInventoryManager: InventoryManager;

  beforeEach(() => {
    vi.clearAllMocks();
    mockInventoryManager = InventoryManager.getInstance();
    planner = new LowLevelPlanner();
  });

  describe('executeTask', () => {
    it('should handle PRICE_CHECK task', async () => {
      vi.spyOn(mockInventoryManager, 'getItem').mockReturnValue({
        priceAlert: '${token} price changed by ${percentage}%'
      });

      const result = await planner.executeTask('PRICE_CHECK', {
        token: 'ETH',
        percentage: '5.2'
      });

      expect(result).toContain('ETH');
      expect(result).toContain('5.2');
    });

    it('should handle MARKET_UPDATE task', async () => {
      const result = await planner.executeTask('MARKET_UPDATE', {});
      expect(result).toContain('Total Value Locked: $1,000,000');
    });

    it('should handle TOKEN_INFO task', async () => {
      const result = await planner.executeTask('TOKEN_INFO', { token: 'ETH' });
      expect(result).toContain('ETH');
    });
  });
});