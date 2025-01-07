import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatMessage } from '@/components/ChatMessage';
import { Message } from '@/types/chat';

describe('ChatMessage', () => {
  it('should render user message correctly', () => {
    const message: Message = {
      id: '1',
      content: 'Hello',
      role: 'user',
      timestamp: new Date()
    };

    render(<ChatMessage message={message} />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should render assistant message with Magi label', () => {
    const message: Message = {
      id: '1',
      content: 'How can I help?',
      role: 'assistant',
      timestamp: new Date()
    };

    render(<ChatMessage message={message} />);
    expect(screen.getByText('Magi')).toBeInTheDocument();
    expect(screen.getByText('How can I help?')).toBeInTheDocument();
  });

  it('should format currency values correctly', () => {
    const message: Message = {
      id: '1',
      content: 'The price is $1234.56',
      role: 'assistant',
      timestamp: new Date()
    };

    render(<ChatMessage message={message} />);
    expect(screen.getByText('The price is $1,234.56')).toBeInTheDocument();
  });
});