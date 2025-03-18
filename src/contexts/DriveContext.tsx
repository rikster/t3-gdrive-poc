"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ServiceType, ServiceAccount } from "~/lib/session";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";

export interface DriveContextType {
  isAuthenticated: boolean;
  isClerkAuthenticated: boolean;
  authenticateService: (serviceId: string) => void;
  addNewAccount: (serviceId: string) => void;
  disconnectService: (serviceId: string) => void;
  disconnectAccount: (serviceId: string, accountId: string) => void;
  logout: () => void;
  currentService: string | null;
  activeServices: string[];
  serviceAccounts: ServiceAccount[];
  isAuthenticating: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
  searchResults: Array<unknown>;
  performSearch: (query: string) => Promise<void>;
  clearSearch: () => void;
  isRecursiveSearch: boolean;
  openFile: (
    fileId: string,
    service: string,
    accountId?: string,
  ) => Promise<void>;
}

const DriveContext = createContext<DriveContextType>({
  isAuthenticated: false,
  isClerkAuthenticated: false,
  authenticateService: () => undefined,
  addNewAccount: () => undefined,
  disconnectService: () => undefined,
  disconnectAccount: () => undefined,
  logout: () => undefined,
  currentService: null,
  activeServices: [],
  serviceAccounts: [],
  isAuthenticating: false,
  searchQuery: "",
  setSearchQuery: () => undefined,
  isSearching: false,
  searchResults: [],
  performSearch: async () => undefined,
  clearSearch: () => undefined,
  isRecursiveSearch: false,
  openFile: async () => undefined,
});

export function DriveProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { signOut } = useClerk();
  const { isSignedIn } = useUser();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClerkAuthenticated, setIsClerkAuthenticated] = useState(false);
  const [currentService, setCurrentService] = useState<string | null>(null);
  const [activeServices, setActiveServices] = useState<string[]>([]);
  const [serviceAccounts, setServiceAccounts] = useState<ServiceAccount[]>([]);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<unknown>>([]);
  const [isRecursiveSearch, setIsRecursiveSearch] = useState(true);

  useEffect(() => {
    setIsClerkAuthenticated(!!isSignedIn);
  }, [isSignedIn]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (!isSignedIn) {
        setIsAuthenticated(false);
        setActiveServices([]);
        setServiceAccounts([]);
        return;
      }

      try {
        const response = await fetch("/api/auth/status");
        const data = (await response.json()) as {
          isAuthenticated: boolean;
          activeServices?: string[];
          serviceAccounts?: ServiceAccount[];
        };
        setIsAuthenticated(data.isAuthenticated);

        if (data.activeServices && Array.isArray(data.activeServices)) {
          setActiveServices(data.activeServices);

          if (data.activeServices.length > 0 && !currentService) {
            setCurrentService(data.activeServices[0]);
          }
        }

        if (data.serviceAccounts && Array.isArray(data.serviceAccounts)) {
          setServiceAccounts(data.serviceAccounts);
        }
      } catch (error) {
        console.error("Failed to check auth status:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, [currentService, isSignedIn]);

  const authenticateService = async (serviceId: string) => {
    setIsAuthenticating(true);

    try {
      const response = await fetch(`/api/${serviceId}`);
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setIsAuthenticating(false);
    } catch (error) {
      console.error(`Failed to authenticate with ${serviceId}:`, error);
      setIsAuthenticating(false);
    }
  };

  const addNewAccount = async (serviceId: string) => {
    setIsAuthenticating(true);

    try {
      const response = await fetch(`/api/${serviceId}?addAccount=true`);
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setIsAuthenticating(false);
    } catch (error) {
      console.error(`Failed to add new account for ${serviceId}:`, error);
      setIsAuthenticating(false);
    }
  };

  const disconnectService = async (serviceId: string) => {
    try {
      await fetch(`/api/auth/disconnect?service=${serviceId}`, {
        method: "POST",
      });

      setActiveServices((prevServices) =>
        prevServices.filter((service) => service !== serviceId),
      );

      setServiceAccounts((prevAccounts) =>
        prevAccounts.filter((account) => account.service !== serviceId),
      );

      if (currentService === serviceId) {
        setCurrentService(null);
      }

      if (activeServices.length <= 1) {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Failed to disconnect service:", error);
    }
  };

  const disconnectAccount = async (serviceId: string, accountId: string) => {
    try {
      await fetch(
        `/api/auth/disconnect?service=${serviceId}&accountId=${accountId}`,
        { method: "POST" },
      );

      setServiceAccounts((prevAccounts) =>
        prevAccounts.filter(
          (account) =>
            !(account.service === serviceId && account.id === accountId),
        ),
      );

      const remainingAccountsForService = serviceAccounts.filter(
        (account) => account.service === serviceId && account.id !== accountId,
      );

      if (remainingAccountsForService.length === 0) {
        setActiveServices((prevServices) =>
          prevServices.filter((service) => service !== serviceId),
        );

        if (currentService === serviceId) {
          setCurrentService(null);
        }
      }

      const newTotalAccounts = serviceAccounts.length - 1;
      if (newTotalAccounts <= 0) {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Failed to disconnect account:", error);
    }
  };

  const logout = () => {
    if (signOut) signOut();
  };

  const performSearch = async (query: string) => {
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
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  const openFile = async (
    fileId: string,
    service: string,
    accountId?: string,
  ) => {
    try {
      const accountParam = accountId ? `&accountId=${accountId}` : "";
      const response = await fetch(
        `/api/${service}/open?fileId=${fileId}${accountParam}`,
      );
      const data = await response.json();

      if (data.url) {
        window.open(data.url, "_blank");
      } else if (data.error) {
        console.error("Error opening file:", data.error);
      }
    } catch (error) {
      console.error("Failed to open file:", error);
    }
  };

  return (
    <DriveContext.Provider
      value={{
        isAuthenticated,
        isClerkAuthenticated,
        authenticateService,
        addNewAccount,
        disconnectService,
        disconnectAccount,
        logout,
        currentService,
        activeServices,
        serviceAccounts,
        isAuthenticating,
        searchQuery,
        setSearchQuery,
        isSearching,
        searchResults,
        performSearch,
        clearSearch,
        isRecursiveSearch,
        openFile,
      }}
    >
      {children}
    </DriveContext.Provider>
  );
}

export function useDrive() {
  return useContext(DriveContext);
}
