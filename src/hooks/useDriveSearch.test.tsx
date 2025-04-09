import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useDriveSearch } from "./useDriveSearch";
import type { SearchResult } from "~/types/drive";

// Mock fetch
let mockFetchImplementation: any = null;

global.fetch = vi.fn().mockImplementation((url: string) => {
  if (mockFetchImplementation) {
    return mockFetchImplementation(url);
  }
  return Promise.resolve(new Response());
});

// Mock console methods
console.error = vi.fn();
console.log = vi.fn();

describe("useDriveSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockFetchImplementation = null;
  });

  it("should initialize with default values", () => {
    const { result } = renderHook(() => useDriveSearch());

    expect(result.current.searchQuery).toBe("");
    expect(result.current.isSearching).toBe(false);
    expect(result.current.searchResults).toEqual([]);
  });

  it("should update search query when setSearchQuery is called", () => {
    const { result } = renderHook(() => useDriveSearch());

    act(() => {
      result.current.setSearchQuery("test query");
    });

    expect(result.current.searchQuery).toBe("test query");
  });

  it("should clear search query and results when clearSearch is called", async () => {
    const { result } = renderHook(() => useDriveSearch());

    // Set some initial values
    act(() => {
      result.current.setSearchQuery("test query");
    });

    // Mock search results
    const mockResults: SearchResult[] = [
      {
        id: "1",
        name: "Test File",
        type: "file",
        modifiedAt: "2023-01-01",
        parentId: "root",
        service: "google",
        accountId: "account1",
      },
    ];

    // Mock the implementation to return results
    mockFetchImplementation = vi.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ files: mockResults }),
      });
    });

    // Perform search
    await act(async () => {
      await result.current.performSearch("test query");
    });

    // Verify we have results
    expect(result.current.searchResults).toEqual(mockResults);

    // Clear search
    act(() => {
      result.current.clearSearch();
    });

    // Verify cleared state
    expect(result.current.searchQuery).toBe("");
    expect(result.current.searchResults).toEqual([]);
  });

  it("should perform search successfully", async () => {
    const { result } = renderHook(() => useDriveSearch());

    // Mock search results
    const mockResults: SearchResult[] = [
      {
        id: "1",
        name: "Test File",
        type: "file",
        modifiedAt: "2023-01-01",
        parentId: "root",
        service: "google",
        accountId: "account1",
      },
    ];

    // Mock the implementation to return results
    mockFetchImplementation = vi.fn().mockImplementation((url) => {
      expect(url).toContain("/api/search?q=test%20query");
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ files: mockResults }),
      });
    });

    // Perform search
    await act(async () => {
      await result.current.performSearch("test query");
    });

    // Verify the results
    expect(result.current.searchQuery).toBe("test query");
    expect(result.current.searchResults).toEqual(mockResults);
    expect(result.current.isSearching).toBe(false);
  });

  it("should handle empty search query", async () => {
    const { result } = renderHook(() => useDriveSearch());

    // Perform search with empty query
    await act(async () => {
      await result.current.performSearch("");
    });

    // Verify no API call was made and results are empty
    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.searchResults).toEqual([]);
  });

  it("should handle API error response", async () => {
    const { result } = renderHook(() => useDriveSearch());

    // Mock an API error response
    mockFetchImplementation = vi.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: "Internal server error" }),
      });
    });

    // Perform search
    await act(async () => {
      await result.current.performSearch("test query");
    });

    // Verify error handling
    expect(console.error).toHaveBeenCalledWith(
      "Search error:",
      "Internal server error"
    );
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.isSearching).toBe(false);
  });

  it("should handle network error", async () => {
    const { result } = renderHook(() => useDriveSearch());

    // Mock a network error
    mockFetchImplementation = vi.fn().mockImplementation(() => {
      return Promise.reject(new Error("Network error"));
    });

    // Perform search
    await act(async () => {
      await result.current.performSearch("test query");
    });

    // Verify error handling
    expect(console.error).toHaveBeenCalledWith(
      "Search error:",
      expect.any(Error)
    );
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.isSearching).toBe(false);
  });
});
