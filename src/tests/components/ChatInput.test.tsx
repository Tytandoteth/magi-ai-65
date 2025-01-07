import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { ChatInput } from '@/components/ChatInput';

describe('ChatInput', () => {
  it('should call onSend when send button is clicked', () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByPlaceholderText('How can I help you today?');
    fireEvent.change(input, { target: { value: 'Test message' } });
    
    const sendButton = screen.getByRole('button');
    fireEvent.click(sendButton);

    expect(mockOnSend).toHaveBeenCalledWith('Test message');
  });

  it('should not call onSend when message is empty', () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const sendButton = screen.getByRole('button');
    fireEvent.click(sendButton);

    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('should handle Enter key press', () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByPlaceholderText('How can I help you today?');
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockOnSend).toHaveBeenCalledWith('Test message');
  });

  it('should not send message on Shift+Enter', () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByPlaceholderText('How can I help you today?');
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

    expect(mockOnSend).not.toHaveBeenCalled();
  });
});