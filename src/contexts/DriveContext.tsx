'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ServiceType } from '~/lib/session';

export interface DriveContextType {
  isAuthenticated: boolean;
  authenticateService: (serviceId: string) => void;
  disconnectService: (serviceId: string) => void;
  logout: () => void;
  currentService: string | null;
  activeServices: string[];
  isAuthenticating: boolean;
}

const DriveContext = createContext<DriveContextType | undefined>(undefined);
export { DriveContext }; // Export the context for testing

export function DriveProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentService, setCurrentService] = useState<string | null>(null);
  const [activeServices, setActiveServices] = useState<string[]>([]);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Check if we have stored tokens (done on client side to prevent hydration issues)
  useEffect(() => {
    const checkAuthStatus = async () => {
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
  }, [currentService]);

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
        setCurrentService(updatedServices.length > 0 ? updatedServices[0] : null);
      }
      
      // Update authentication status
      setIsAuthenticated(updatedServices.length > 0);
    } catch (error) {
      console.error(`Failed to disconnect service ${serviceId}:`, error);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setCurrentService(null);
      setActiveServices([]);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  return (
    <DriveContext.Provider value={{ 
      isAuthenticated, 
      authenticateService,
      disconnectService,
      logout, 
      currentService,
      activeServices,
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
