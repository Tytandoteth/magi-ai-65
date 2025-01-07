import { describe, it, expect } from 'vitest';
import { TokenResolver } from '@/services/token/TokenResolver';

describe('TokenResolver', () => {
  describe('resolveTokenSymbol', () => {
    it('should resolve PENGU correctly', () => {
      const result = TokenResolver.resolveTokenSymbol('$PENGU');
      expect(result).toBe('PENGU');
    });

    it('should resolve ETH correctly', () => {
      const result = TokenResolver.resolveTokenSymbol('$ETH');
      expect(result).toBe('ETH');
    });

    it('should handle invalid symbol gracefully', () => {
      const result = TokenResolver.resolveTokenSymbol('$INVALID');
      expect(result).toBeNull();
    });

    it('should resolve lowercase symbols', () => {
      const result = TokenResolver.resolveTokenSymbol('pengu');
      expect(result).toBe('PENGU');
    });

    it('should handle empty input', () => {
      const result = TokenResolver.resolveTokenSymbol('');
      expect(result).toBeNull();
    });

    it('should handle special characters', () => {
      const result = TokenResolver.resolveTokenSymbol('$PENGU!');
      expect(result).toBe('PENGU');
    });
  });

  describe('getSuggestionMessage', () => {
    it('should return guidance for empty input', () => {
      const result = TokenResolver.getSuggestionMessage('');
      expect(result).toBe('Please provide a valid token symbol using the $ symbol (e.g., $ETH).');
    });

    it('should return success message for valid token', () => {
      const result = TokenResolver.getSuggestionMessage('$PENGU');
      expect(result).toBe('Token found: $PENGU. Use this symbol to fetch data.');
    });

    it('should return error message for invalid token', () => {
      const result = TokenResolver.getSuggestionMessage('$INVALID');
      expect(result).toContain('could not be resolved');
    });
  });
});