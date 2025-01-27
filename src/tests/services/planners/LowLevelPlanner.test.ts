import { describe, it, expect, beforeEach } from 'vitest';
import { LowLevelPlanner } from '../../../services/planners/LowLevelPlanner';
import { HighLevelAction } from '@/types/actions';

describe('LowLevelPlanner', () => {
  let planner: LowLevelPlanner;

  beforeEach(() => {
    planner = new LowLevelPlanner();
  });

  it('should handle TOKEN_INFO action', async () => {
    const action: HighLevelAction = {
      type: 'TOKEN_INFO',
      params: {
        symbol: 'ETH'
      }
    };

    const result = await planner.executeTask(action, {
      messages: [],
      token: 'ETH',
      percentage: '50'
    });

    expect(result).toBeDefined();
  });

  it('should handle UNKNOWN action', async () => {
    const action: HighLevelAction = {
      type: 'UNKNOWN',
      params: {}
    };

    const result = await planner.executeTask(action, {
      messages: []
    });

    expect(result).toContain("I'm not sure how to handle");
  });

  it('should handle TOKEN_INFO action with missing token', async () => {
    const action: HighLevelAction = {
      type: 'TOKEN_INFO',
      params: {
        symbol: 'UNKNOWN'
      }
    };

    const result = await planner.executeTask(action, {
      messages: [],
      token: 'UNKNOWN'
    });

    expect(result).toBeDefined();
  });
});