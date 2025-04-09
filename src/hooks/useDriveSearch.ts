"use client";

import { useState, useCallback } from "react";
import type { SearchResult } from "~/types/drive";

interface UseDriveSearchResult {
  /**
   * The current search query
   */
  searchQuery: string;
  
  /**
   * Function to set the search query
   */
  setSearchQuery: (query: string) => void;
  
  /**
   * Whether a search is currently in progress
   */
  isSearching: boolean;
  
  /**
   * The search results
   */
  searchResults: SearchResult[];
  
  /**
   * Function to perform a search with the given query
   */
  performSearch: (query: string) => Promise<void>;
  
  /**
   * Function to clear the search query and results
   */
  clearSearch: () => void;
}

/**
 * Hook for searching files across connected drive services
 * 
 * @returns Search state and functions
 */
export function useDriveSearch(): UseDriveSearchResult {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  /**
   * Perform a search with the given query
   */
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`,
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Search error:", errorData.error || response.statusText);
        throw new Error(errorData.error || "Failed to search files");
      }
      
      const data = await response.json();
      setSearchResults(data.files || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  /**
   * Clear the search query and results
   */
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    isSearching,
    searchResults,
    performSearch,
    clearSearch,
  };
}
