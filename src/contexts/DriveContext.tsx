"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { ErrorDialog } from "~/components/ErrorDialog";
import type { ServiceAccount, ServiceType } from "~/types/services";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { useDriveSearch } from "~/hooks/useDriveSearch";

import type { DriveItem } from "~/types/drive";

export interface DriveContextType {
  isAuthenticated: boolean;
  isClerkAuthenticated: boolean;
  authenticateService: (serviceId: ServiceType) => void;
  addNewAccount: (serviceId: ServiceType) => void;
  disconnectService: (serviceId: ServiceType) => void;
  disconnectAccount: (serviceId: ServiceType, accountId: string) => void;
  logout: () => void;
  currentService: ServiceType | null;
  activeServices: ServiceType[];
  serviceAccounts: Record<ServiceType, ServiceAccount[]>;
  isAuthenticating: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearching: boolean;
  searchResults: DriveItem[];
  performSearch: (query: string) => void;
  clearSearch: () => void;
  isRecursiveSearch: boolean;
  openFile: (fileId: string, service: ServiceType, accountId?: string) => void;
}

export const DriveContext = createContext<DriveContextType>({
  isAuthenticated: false,
  isClerkAuthenticated: false,
  authenticateService: () => undefined,
  addNewAccount: () => undefined,
  disconnectService: () => undefined,
  disconnectAccount: () => undefined,
  logout: () => undefined,
  currentService: null,
  activeServices: [] as ServiceType[],
  serviceAccounts: {} as Record<ServiceType, ServiceAccount[]>,
  isAuthenticating: false,
  searchQuery: "",
  setSearchQuery: () => undefined,
  isSearching: false,
  searchResults: [],
  performSearch: () => undefined,
  clearSearch: () => undefined,
  isRecursiveSearch: false,
  openFile: () => undefined,
});

export function DriveProvider({ children }: { children: ReactNode }) {
  useRouter(); // Keep for potential future use
  const { signOut } = useClerk();
  const { isSignedIn } = useUser();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClerkAuthenticated, setIsClerkAuthenticated] = useState(false);
  const [currentService, setCurrentService] = useState<ServiceType | null>(
    null,
  );
  const [activeServices, setActiveServices] = useState<ServiceType[]>([]);
  const [serviceAccounts, setServiceAccounts] = useState<
    Record<ServiceType, ServiceAccount[]>
  >({ google: [], onedrive: [], dropbox: [] });
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    searchQuery,
    setSearchQuery,
    isSearching,
    searchResults,
    performSearch,
    clearSearch,
  } = useDriveSearch();
  const [isRecursiveSearch] = useState(true);

  useEffect(() => {
    setIsClerkAuthenticated(!!isSignedIn);
  }, [isSignedIn]);

  // State for error dialog
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorTitle, setErrorTitle] = useState("Error");

  // Check for error parameters in the URL and handle redirects
  useEffect(() => {
    // Only run this effect once on mount
    let isMounted = true;

    const handleErrorParams = () => {
      if (!isMounted || typeof window === "undefined") return false;

      try {
        // Check for error parameters
        const url = new URL(window.location.href);
        const error = url.searchParams.get("error");
        const message = url.searchParams.get("message");
        const timestamp = url.searchParams.get("t"); // Check for timestamp parameter
        const critical = url.searchParams.get("critical") === "true"; // Check if this is a critical error

        if (error === "duplicate_account" && message) {
          console.log(
            "Found duplicate account error in URL with timestamp:",
            timestamp,
            "Critical:",
            critical,
          );

          // Reset authentication state first to prevent infinite loops
          setIsAuthenticating(false);

          // Remove the error parameters from the URL but keep the history intact
          // This prevents the URL from showing the error parameters but doesn't navigate away
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete("error");
          cleanUrl.searchParams.delete("message");
          cleanUrl.searchParams.delete("t");
          cleanUrl.searchParams.delete("critical");
          window.history.replaceState({}, "", cleanUrl.toString());

          // Set error message and show dialog - do this last
          if (isMounted) {
            setErrorTitle("Duplicate Account");
            setErrorMessage(message);

            // For critical errors, show the dialog immediately and with higher priority
            if (critical) {
              console.log("Opening critical error dialog immediately");
              setErrorDialogOpen(true);

              // Also set a backup timeout in case the immediate setting doesn't work
              setTimeout(() => {
                if (isMounted) {
                  console.log("Backup: ensuring error dialog is open");
                  setErrorDialogOpen(true);
                }
              }, 500);
            } else {
              // For non-critical errors, use a small timeout
              setTimeout(() => {
                if (isMounted) {
                  console.log("Opening error dialog for duplicate account");
                  setErrorDialogOpen(true);
                }
              }, 50);
            }
          }
          return true; // Indicate that we found and handled an error
        }
        return false;
      } catch (e) {
        console.error("Error handling URL parameters:", e);
        return false;
      }
    };

    const handleRedirectAfterAuth = () => {
      if (!isMounted || typeof window === "undefined") return;

      try {
        // Check for redirect after authentication
        const redirectUrl = sessionStorage.getItem("redirectAfterAuth");
        if (redirectUrl) {
          // Clear the stored URL
          sessionStorage.removeItem("redirectAfterAuth");

          // Check if we're on an error page
          const url = new URL(window.location.href);
          const error = url.searchParams.get("error");

          // Only redirect if we're not on an error page
          if (!error) {
            // Use a timeout to avoid immediate redirect which could cause issues
            setTimeout(() => {
              if (isMounted) {
                window.location.href = redirectUrl;
              }
            }, 100);
          }
        }
      } catch (e) {
        console.error("Error handling redirect after auth:", e);
      }
    };

    // Handle error parameters first and only proceed with redirect if no error was found
    const errorFound = handleErrorParams();

    // Then handle redirects (with a small delay) only if no error was found
    if (!errorFound) {
      setTimeout(() => {
        handleRedirectAfterAuth();
      }, 100);
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  // We've simplified the approach to avoid infinite loops

  // Use a more simplified approach with useEffect
  useEffect(() => {
    // Only run this effect when isSignedIn changes
    const checkAuthStatus = async () => {
      if (!isSignedIn) {
        // If not signed in, reset all auth state
        setIsAuthenticated(false);
        setActiveServices([]);
        setServiceAccounts({ google: [], onedrive: [], dropbox: [] });
        return;
      }

      try {
        const response = await fetch("/api/auth/status");
        const data = (await response.json()) as {
          isAuthenticated: boolean;
          activeServices?: ServiceType[];
          serviceAccounts?: ServiceAccount[];
        };

        // Only update if the authentication state actually changed
        if (data.isAuthenticated !== isAuthenticated) {
          setIsAuthenticated(data.isAuthenticated);
        }

        if (data.activeServices && Array.isArray(data.activeServices)) {
          // Compare arrays before updating state
          const servicesChanged =
            data.activeServices.length !== activeServices.length ||
            data.activeServices.some((s, i) => activeServices[i] !== s);

          if (servicesChanged) {
            setActiveServices(data.activeServices as ServiceType[]);

            if (data.activeServices.length > 0 && !currentService) {
              // Ensure we have a valid string before setting current service
              const firstService = data.activeServices[0];
              if (typeof firstService === "string") {
                setCurrentService(firstService as ServiceType);
              }
            }
          }
        }

        if (data.serviceAccounts && Array.isArray(data.serviceAccounts)) {
          // Transform array into Record<string, ServiceAccount[]>
          const accountsByService = data.serviceAccounts.reduce<
            Record<ServiceType, ServiceAccount[]>
          >(
            (acc, account) => {
              const service = account.service as ServiceType;
              if (!acc[service]) {
                acc[service] = [];
              }
              acc[service].push(account);
              return acc;
            },
            { google: [], onedrive: [], dropbox: [] },
          );

          // Only update if the accounts have changed
          const accountsChanged = (
            Object.keys(accountsByService) as ServiceType[]
          ).some((service) => {
            return (
              JSON.stringify(accountsByService[service]) !==
              JSON.stringify(serviceAccounts[service])
            );
          });

          if (accountsChanged) {
            setServiceAccounts(accountsByService);
          }
        }
      } catch (error) {
        console.error("Failed to check auth status:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
    // Include necessary dependencies but use ESLint disable to prevent infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  const authenticateService = useCallback(
    async (serviceId: ServiceType) => {
      // Prevent multiple authentication attempts
      if (isAuthenticating) return;

      setIsAuthenticating(true);

      try {
        const response = await fetch(`/api/${serviceId}`);
        const data = await response.json();

        if (data.url) {
          // Store the current URL to redirect back after authentication
          if (typeof window !== "undefined") {
            sessionStorage.setItem("redirectAfterAuth", window.location.href);
          }
          window.location.href = data.url;
          return;
        }
        setIsAuthenticating(false);
      } catch (error) {
        console.error(`Failed to authenticate with ${serviceId}:`, error);
        setIsAuthenticating(false);
      }
    },
    [isAuthenticating],
  );

  const addNewAccount = useCallback(
    async (serviceId: ServiceType) => {
      // Prevent multiple authentication attempts
      if (isAuthenticating) return;

      setIsAuthenticating(true);

      try {
        const response = await fetch(`/api/${serviceId}?addAccount=true`);
        const data = await response.json();

        if (data.url) {
          // Store the current URL to redirect back after authentication
          if (typeof window !== "undefined") {
            sessionStorage.setItem("redirectAfterAuth", window.location.href);
          }
          window.location.href = data.url;
          return;
        }
        setIsAuthenticating(false);
      } catch (error) {
        console.error(`Failed to add new account for ${serviceId}:`, error);
        setIsAuthenticating(false);
      }
    },
    [isAuthenticating],
  );

  const disconnectService = useCallback(
    async (serviceId: ServiceType) => {
      try {
        await fetch(`/api/auth/disconnect?service=${serviceId}`, {
          method: "POST",
        });

        setActiveServices((prevServices) =>
          prevServices.filter((service) => service !== serviceId),
        );

        setServiceAccounts((prevAccounts) => {
          const newAccounts = { ...prevAccounts } as Record<
            ServiceType,
            ServiceAccount[]
          >;
          delete newAccounts[serviceId];
          return newAccounts;
        });

        if (currentService === serviceId) {
          setCurrentService(null);
        }

        // Check if this was the last service
        const remainingServices = activeServices.filter((s) => s !== serviceId);
        if (remainingServices.length === 0) {
          setIsAuthenticated(false);
        }
      } catch (error) {
        // Handle error silently
        setError("Failed to disconnect service");
      }
    },
    [activeServices, currentService],
  );

  const disconnectAccount = useCallback(
    async (serviceId: ServiceType, accountId: string) => {
      try {
        await fetch(
          `/api/auth/disconnect?service=${serviceId}&accountId=${accountId}`,
          { method: "POST" },
        );

        // Update service accounts state
        setServiceAccounts((prevAccounts) => {
          const newAccounts = { ...prevAccounts } as Record<
            ServiceType,
            ServiceAccount[]
          >;
          if (newAccounts[serviceId]) {
            newAccounts[serviceId] = newAccounts[serviceId].filter(
              (account) => account.id !== accountId,
            );
          }

          // Check if this was the last account for this service
          const remainingAccountsForService =
            newAccounts[serviceId as ServiceType] || [];

          // If no accounts left for this service, update active services
          if (remainingAccountsForService.length === 0) {
            setActiveServices((prevServices) =>
              prevServices.filter((service) => service !== serviceId),
            );

            if (currentService === serviceId) {
              setCurrentService(null);
            }
          }

          // If no accounts left at all, set not authenticated
          const hasAccounts = Object.values(newAccounts).some(
            (accounts) => accounts.length > 0,
          );
          if (!hasAccounts) {
            setIsAuthenticated(false);
          }

          return newAccounts;
        });
      } catch (error) {
        // Handle error silently
        setError("Failed to disconnect account");
      }
    },
    [currentService],
  );

  const logout = () => {
    if (signOut) signOut();
  };

  // Search functionality is now handled by the useDriveSearch hook

  const openFile = async (
    fileId: string,
    service: ServiceType,
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

  // Memoize the error dialog handler to prevent unnecessary re-renders
  const handleErrorDialogChange = useCallback(
    (open: boolean) => {
      console.log("Error dialog state changing to:", open);
      setErrorDialogOpen(open);

      // If closing the dialog and we were in an authentication process, reset the state
      if (!open && isAuthenticating) {
        setIsAuthenticating(false);
      }
    },
    [isAuthenticating],
  );

  return (
    <>
      <ErrorDialog
        open={errorDialogOpen}
        onOpenChange={handleErrorDialogChange}
        title={errorTitle}
        message={errorMessage}
      />
      <DriveContext.Provider
        value={{
          isAuthenticated,
          isClerkAuthenticated,
          authenticateService: (serviceId: ServiceType) => {
            void authenticateService(serviceId);
          },
          addNewAccount: (serviceId: ServiceType) => {
            void addNewAccount(serviceId);
          },
          disconnectService: (serviceId: ServiceType) => {
            void disconnectService(serviceId);
          },
          disconnectAccount: (serviceId: ServiceType, accountId: string) => {
            void disconnectAccount(serviceId, accountId);
          },
          logout,
          currentService,
          activeServices,
          serviceAccounts,
          isAuthenticating,
          searchQuery,
          setSearchQuery,
          isSearching,
          searchResults,
          performSearch: (query: string) => {
            void performSearch(query);
          },
          clearSearch,
          isRecursiveSearch,
          openFile: (
            fileId: string,
            service: ServiceType,
            accountId?: string,
          ) => {
            void openFile(fileId, service, accountId);
          },
        }}
      >
        {children}
      </DriveContext.Provider>
    </>
  );
}

export function useDrive() {
  return useContext(DriveContext);
}
