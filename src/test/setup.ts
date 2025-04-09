import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock fetch
global.fetch = vi.fn();

// Mock window.location
const originalLocation = window.location;
delete window.location;
window.location = {
  ...originalLocation,
  href: '',
};

// Mock console methods to avoid cluttering test output
console.error = vi.fn();
console.warn = vi.fn();
console.log = vi.fn();
