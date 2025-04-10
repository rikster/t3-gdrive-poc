import { vi } from "vitest";
import "@testing-library/jest-dom";

// Mock fetch
global.fetch = vi.fn();

// Mock window.location
const originalLocation = window.location;
Object.defineProperty(window, "location", {
  configurable: true,
  enumerable: true,
  value: {
    ...originalLocation,
    href: "",
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
});

// Mock console methods to avoid cluttering test output
console.error = vi.fn();
console.warn = vi.fn();
console.log = vi.fn();
