import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';
import { useChat } from '@/hooks/use-chat';
import { useMagi } from '@/hooks/use-magi';

// Mock dependencies
vi.mock('@/hooks/use-magi', () => ({
  useMagi: vi.fn(() => ({
    processMessage: vi.fn(async () => 'Mocked response'),
    isProcessing: false
  }))
}));

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add user message and get AI response', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.handleSendMessage('Hello');
    });

    expect(result.current.chatState.messages).toHaveLength(2);
    expect(result.current.chatState.messages[0].role).toBe('user');
    expect(result.current.chatState.messages[1].role).toBe('assistant');
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(useMagi).mockImplementation(() => ({
      processMessage: vi.fn().mockRejectedValue(new Error('API Error')),
      isProcessing: false
    }));

    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.handleSendMessage('Hello');
    });

    expect(result.current.chatState.error).toBeTruthy();
  });
});