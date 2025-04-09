"use client";

import { useState, useEffect } from "react";
import { useDrive } from "~/contexts/DriveContext";
import { useDriveNavigation } from "./useDriveNavigation";
import type { DriveItem } from "~/types/drive";

interface UseDriveItemsResult {
  items: DriveItem[];
  filteredItems: DriveItem[];
  isLoading: boolean;
  error: string | null;
  serviceItems: Record<string, DriveItem[]>;
  fetchFiles: (folderId: string) => Promise<void>;
}

export function useDriveItems(
  initialItems?: DriveItem[],
  initialLoading?: boolean,
  initialError?: string | null
): UseDriveItemsResult {
  const {
    isAuthenticated,
    serviceAccounts,
    searchQuery,
    isRecursiveSearch,
    searchResults,
  } = useDrive();

  const {
    currentFolder,
    currentFolderService,
    currentAccountId,
  } = useDriveNavigation();

  const [items, setItems] = useState<DriveItem[]>(initialItems || []);
  const [filteredItems, setFilteredItems] = useState<DriveItem[]>([]);
  const [isLoading, setIsLoading] = useState(initialLoading ?? false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [serviceItems, setServiceItems] = useState<Record<string, DriveItem[]>>({});

  // Update state when props change
  useEffect(() => {
    if (initialItems) {
      setItems(initialItems);
    }
  }, [initialItems]);

  useEffect(() => {
    if (initialLoading !== undefined) {
      setIsLoading(initialLoading);
    }
  }, [initialLoading]);

  useEffect(() => {
    if (initialError !== undefined) {
      setError(initialError);
    }
  }, [initialError]);

  // Helper function to get service display name
  const getServiceName = (service?: string) => {
    if (!service) return "";

    switch (service) {
      case "google":
        return "Google Drive";
      case "onedrive":
        return "OneDrive";
      case "dropbox":
        return "Dropbox";
      case "box":
        return "Box";
      default:
        return service;
    }
  };

  // Fetch files from a specific service
  const fetchFilesFromService = async (
    service: string,
    folderId: string,
    accountId: string = "default",
  ): Promise<DriveItem[]> => {
    try {
      console.log(
        `Fetching files from ${service} for folder ${folderId} and account ${accountId}`,
      );
      const response = await fetch(
        `/api/${service}?folderId=${folderId}&accountId=${accountId}`,
      );
      const data = await response.json();

      if (data.url) {
        // Need to authenticate
        window.location.href = data.url;
        return [];
      }

      if (data.error) {
        console.error(`Error fetching ${service} files:`, data.error);
        return [];
      }

      // Ensure data.files is always an array and add service and accountId properties
      const files = Array.isArray(data.files)
        ? data.files.map((file: DriveItem) => {
            console.log(
              `File from ${service}:`,
              file.name,
              "Email:",
              file.accountEmail,
            );
            return {
              ...file,
              service,
              accountId,
              // Don't set to undefined if it's falsy, as this can cause empty strings to be lost
              // Only set if it doesn't exist at all in the API response
              accountEmail:
                "accountEmail" in file ? file.accountEmail : undefined,
            };
          })
        : [];

      return files;
    } catch (err) {
      console.error(`Failed to fetch files from ${service}:`, err);
      return [];
    }
  };

  // Main function to fetch files
  const fetchFiles = async (folderId: string) => {
    if (initialItems || !isAuthenticated || serviceAccounts.length === 0) {
      return; // Don't fetch if we're using props or not authenticated
    }

    setIsLoading(true);
    setError(null);

    try {
      let allFiles: DriveItem[] = [];

      // If we're at root level or no specific service is set, fetch from all accounts
      if (folderId === "root" || (!currentFolderService && !currentAccountId)) {
        const serviceResults: Record<string, DriveItem[]> = {};

        // Create a promise for each account
        const allFilesPromises = serviceAccounts.map(async (account) => {
          const files = await fetchFilesFromService(
            account.service,
            "root",
            account.id,
          );

          // Group files by service for proper display
          if (!serviceResults[account.service]) {
            serviceResults[account.service] = [];
          }

          // Add account info to each file
          const filesWithAccount = files.map((file) => ({
            ...file,
            accountName: account.name ?? getServiceName(account.service),
            accountEmail: account.email,
          }));

          serviceResults[account.service] = [
            ...(serviceResults[account.service] ?? []),
            ...filesWithAccount,
          ];
          return filesWithAccount;
        });

        const results = await Promise.all(allFilesPromises);
        allFiles = results.flat();

        // Update state with all services' files
        setServiceItems(serviceResults);
      } else if (currentFolderService && currentAccountId) {
        // If we're in a specific folder with a specific account, only fetch from that account
        allFiles = await fetchFilesFromService(
          currentFolderService,
          folderId,
          currentAccountId,
        );

        // Add account info to files
        const account = serviceAccounts.find(
          (a) =>
            a.service === currentFolderService && a.id === currentAccountId,
        );
        if (account) {
          allFiles = allFiles.map((file) => ({
            ...file,
            accountName: account.name ?? getServiceName(account.service),
            accountEmail: account.email,
          }));
        }

        const serviceResults: Record<string, DriveItem[]> = {};
        serviceResults[currentFolderService] = allFiles;
        setServiceItems(serviceResults);
      }

      // Sort files (folders first, then alphabetically)
      const sortedFiles = sortItems(allFiles);
      setItems(sortedFiles);
    } catch (err) {
      console.error("Fetch files error:", err);
      setError(`Failed to fetch files from one or more services`);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Sort items (folders first, then alphabetically)
  const sortItems = (items: DriveItem[]): DriveItem[] => {
    return items.sort((a, b) => {
      // First sort by type (folders first)
      if (a.type === "folder" && b.type !== "folder") return -1;
      if (a.type !== "folder" && b.type === "folder") return 1;

      // Then sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
  };

  // Fetch files when dependencies change
  useEffect(() => {
    if (isAuthenticated) {
      let isMounted = true;

      const doFetch = async () => {
        if (isMounted) {
          await fetchFiles(currentFolder);
        }
      };

      doFetch();

      return () => {
        isMounted = false;
      };
    }
  }, [
    currentFolder,
    isAuthenticated,
    serviceAccounts,
    currentAccountId,
    currentFolderService,
  ]);

  // Effect for local filtering (non-recursive)
  useEffect(() => {
    if (!isRecursiveSearch) {
      if (searchQuery.trim() === "") {
        setFilteredItems(items);
        return;
      }

      const query = searchQuery.toLowerCase();
      const filtered = items.filter((item) =>
        item.name.toLowerCase().includes(query),
      );
      setFilteredItems(filtered);
    }
  }, [searchQuery, items, isRecursiveSearch]);

  // Effect for recursive search results
  useEffect(() => {
    if (isRecursiveSearch && searchResults.length > 0) {
      // Cast searchResults to DriveItem[] since they have compatible structure
      const typedResults = searchResults as unknown as DriveItem[];
      setFilteredItems(typedResults);
    }
  }, [searchResults, isRecursiveSearch]);

  // Initialize filteredItems when items change and no search is active
  useEffect(() => {
    if (!searchQuery) {
      setFilteredItems(items);
    }
  }, [items, searchQuery]);

  return {
    items,
    filteredItems,
    isLoading,
    error,
    serviceItems,
    fetchFiles,
  };
}
