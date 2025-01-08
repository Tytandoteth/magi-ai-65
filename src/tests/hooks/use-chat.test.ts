import { renderHook, act } from '@testing-library/react';
import { useChatMessages } from '../../hooks/use-chat-messages';

describe('useChatMessages', () => {
  it('should initialize with empty messages', () => {
    const { result } = renderHook(() => useChatMessages());
    
    expect(result.current.chatState.messages).toEqual([]);
    expect(result.current.chatState.isLoading).toBe(false);
    expect(result.current.chatState.error).toBeNull();
  });

  it('should add a message', () => {
    const { result } = renderHook(() => useChatMessages());
    
    act(() => {
      result.current.addMessage({
        id: '1',
        content: 'Test message',
        role: 'user',
        timestamp: new Date()
      });
    });

    expect(result.current.chatState.messages).toHaveLength(1);
    expect(result.current.chatState.messages[0].content).toBe('Test message');
  });
});