import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HighLevelPlanner } from '@/services/planners/HighLevelPlanner';
import { MemoryManager } from '@/services/memory/MemoryManager';
import { Message } from '@/types/chat';

describe('HighLevelPlanner', () => {
  let planner: HighLevelPlanner;
  let mockMemoryManager: MemoryManager;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    mockMemoryManager = MemoryManager.getInstance();
    planner = new HighLevelPlanner();
  });

  describe('planAction', () => {
    it('should return TOKEN_INFO for messages containing $ symbol', async () => {
      const messages: Message[] = [{
        id: '1',
        content: 'What is the price of $ETH?',
        role: 'user',
        timestamp: new Date()
      }];

      const result = await planner.planAction(messages);
      expect(result).toBe('TOKEN_INFO');
    });

    it('should return MARKET_UPDATE for market-related queries with high engagement', async () => {
      vi.spyOn(mockMemoryManager, 'retrieveData').mockReturnValue({ average: 11 });
      
      const messages: Message[] = [{
        id: '1',
        content: 'How is the market doing today?',
        role: 'user',
        timestamp: new Date()
      }];

      const result = await planner.planAction(messages);
      expect(result).toBe('MARKET_UPDATE');
    });

    it('should return PRICE_CHECK for price-related queries', async () => {
      const messages: Message[] = [{
        id: '1',
        content: 'What is the price now?',
        role: 'user',
        timestamp: new Date()
      }];

      const result = await planner.planAction(messages);
      expect(result).toBe('PRICE_CHECK');
    });
  });
});