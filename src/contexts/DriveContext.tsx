'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ServiceType } from '~/lib/session';
import { useRouter } from 'next/navigation';
import { useClerk, useUser } from '@clerk/nextjs';

export interface DriveContextType {
  isAuthenticated: boolean;
  isClerkAuthenticated: boolean;
  authenticateService: (serviceId: string) => void;
  disconnectService: (serviceId: string) => void;
  logout: () => void;
  currentService: string | null;
  activeServices: string[];
  isAuthenticating: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
  searchResults: any[];
  performSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
  isRecursiveSearch: boolean;
  openFile: (fileId: string, service: string) => Promise<void>;
}

const DriveContext = createContext<DriveContextType | undefined>(undefined);
export { DriveContext }; // Export the context for testing

export function DriveProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { signOut } = useClerk();
  const { isSignedIn, user } = useUser();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClerkAuthenticated, setIsClerkAuthenticated] = useState(false);
  const [currentService, setCurrentService] = useState<string | null>(null);
  const [activeServices, setActiveServices] = useState<string[]>([]);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isRecursiveSearch, setIsRecursiveSearch] = useState(false);

  // Update Clerk authentication status
  useEffect(() => {
    setIsClerkAuthenticated(!!isSignedIn);
  }, [isSignedIn]);

  // Redirect to sign-in if not authenticated with Clerk
  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');
    }
  }, [isSignedIn, router]);

  // Check if we have stored tokens (done on client side to prevent hydration issues)
  useEffect(() => {
    const checkAuthStatus = async () => {
      // Only check cloud service auth if user is signed in with Clerk
      if (!isSignedIn) {
        setIsAuthenticated(false);
        setActiveServices([]);
        return;
      }
      
      try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);

        if (data.activeServices && Array.isArray(data.activeServices)) {
          setActiveServices(data.activeServices);

          // Set current service to the first active service if not already set
          if (data.activeServices.length > 0 && !currentService) {
            setCurrentService(data.activeServices[0]);
          }
        }
      } catch (error) {
        console.error('Failed to check auth status:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, [currentService, isSignedIn]);

  const authenticateService = async (serviceId: string) => {
    setIsAuthenticating(true);

    try {
      // Generalized approach for any service
      const response = await fetch(`/api/${serviceId}`);
      const data = await response.json();

      if (data.url) {
        // Need to authenticate
        window.location.href = data.url;
        // Note: We don't set isAuthenticating to false here because we're redirecting
        return;
      }
      setIsAuthenticating(false);
    } catch (error) {
      console.error(`Failed to authenticate with ${serviceId}:`, error);
      setIsAuthenticating(false);
    }
  };

  const disconnectService = async (serviceId: string) => {
    if (!activeServices.includes(serviceId)) return;

    try {
      await fetch(`/api/auth/logout?service=${serviceId}`, { method: 'POST' });

      // Update active services
      const updatedServices = activeServices.filter(s => s !== serviceId);
      setActiveServices(updatedServices);

      // If we disconnected the current service, switch to another active service or null
      if (serviceId === currentService) {
        if (updatedServices.length > 0) {
          // Get the first service and ensure it's defined
          const firstService = updatedServices[0];
          if (firstService) {
            setCurrentService(firstService);
          } else {
            setCurrentService(null);
          }
        } else {
          setCurrentService(null);
        }
      }
      // Update authentication status
      setIsAuthenticated(updatedServices.length > 0);
    } catch (error) {
      console.error(`Failed to disconnect service ${serviceId}:`, error);
    }
  };

  const logout = async () => {
    try {
      // First, log out from all cloud services
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setCurrentService(null);
      setActiveServices([]);
      
      // Then sign out from Clerk and redirect to the sign-in page
      await signOut(() => {
        router.push('/sign-in');
      });
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  // Perform a recursive search across all services and folders
  const performSearch = async (query: string) => {
    if (!query.trim() || !isAuthenticated || activeServices.length === 0) {
      setSearchResults([]);
      setIsRecursiveSearch(false);
      return;
    }

    setIsSearching(true);
    setSearchQuery(query);
    setIsRecursiveSearch(true);

    try {
      // Call the search API endpoint
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.error) {
        console.error('Search error:', data.error);
        setSearchResults([]);
      } else {
        setSearchResults(data.files || []);
      }
    } catch (error) {
      console.error('Failed to perform search:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear search results and reset search state
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsRecursiveSearch(false);
  };

  // Open a file in its respective service
  const openFile = async (fileId: string, service: string) => {
    if (!fileId || !service) return;

    try {
      const response = await fetch(`/api/${service}/open?fileId=${fileId}`);
      const data = await response.json();

      if (data.url) {
        // Open the file URL in a new tab
        window.open(data.url, '_blank');
      } else if (data.error) {
        console.error(`Failed to open file: ${data.error}`);
      }
    } catch (error) {
      console.error(`Failed to open file (${service}:${fileId}):`, error);
    }
  };

  return (
    <DriveContext.Provider
      value={{
        isAuthenticated,
        isClerkAuthenticated,
        authenticateService,
        disconnectService,
        logout,
        currentService,
        activeServices,
        isAuthenticating,
        searchQuery,
        setSearchQuery,
        isSearching,
        searchResults,
        performSearch,
        clearSearch,
        isRecursiveSearch,
        openFile
      }}
    >
      {children}
    </DriveContext.Provider>
  );
}

export function useDrive() {
  const context = useContext(DriveContext);
  if (context === undefined) {
    throw new Error('useDrive must be used within a DriveProvider');
  }
  return context;
}
