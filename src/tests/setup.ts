import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend expect with jest-dom matchers
expect.extend(matchers);

// Mock console.log for test commands
vi.spyOn(console, 'log').mockImplementation((message) => {
  if (typeof message === 'string' && message.startsWith('Test command detected:')) {
    // Allow test commands to pass through
    return;
  }
  // Normal console.log behavior for other messages
  console.info(message);
});

// runs a cleanup after each test case
afterEach(() => {
  cleanup();
});