'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface DriveContextType {
  isAuthenticated: boolean;
  authenticateService: (serviceId: string) => void;
  logout: () => void;
  currentService: string | null;
  isAuthenticating: boolean;
}

const DriveContext = createContext<DriveContextType | undefined>(undefined);

export function DriveProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentService, setCurrentService] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Check if we have stored tokens (done on client side to prevent hydration issues)
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        setIsAuthenticated(data.isAuthenticated);
        if (data.service) {
          setCurrentService(data.service);
        }
      } catch (error) {
        console.error('Failed to check auth status:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, []);

  const authenticateService = async (serviceId: string) => {
    setIsAuthenticating(true);
    
    if (serviceId === 'google') {
      try {
        const response = await fetch(`/api/google`);
        const data = await response.json();
        
        if (data.url) {
          // Need to authenticate
          window.location.href = data.url;
          // Note: We don't set isAuthenticating to false here because we're redirecting
        }
      } catch (error) {
        console.error('Failed to authenticate:', error);
        setIsAuthenticating(false);
      }
    } else {
      alert(`Authentication for ${serviceId} not implemented yet.`);
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setCurrentService(null);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <DriveContext.Provider value={{ 
      isAuthenticated, 
      authenticateService, 
      logout, 
      currentService,
      isAuthenticating 
    }}>
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
