"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "~/components/ui/table";
import { Header } from "./Header";
import { DriveItemRow } from "./DriveItemRow";
import { useDrive } from "~/contexts/DriveContext";
import { LoadingSpinner } from "./ui/loading-spinner";
import { DriveBreadcrumb } from "./DriveBreadcrumb";
import { DriveErrorState } from "./DriveErrorState";
import { useRouter, useSearchParams } from "next/navigation";
import { useDriveNavigation } from "~/hooks/useDriveNavigation";

import type { DriveItem } from "~/types/drive";
import type { DriveUIProps } from "~/types/ui";

export function DriveUI({
  items: initialItems,
  loading: initialLoading,
  error: initialError,
}: DriveUIProps = {}) {
  const {
    isAuthenticated,
    authenticateService,
    addNewAccount,
    disconnectService,
    disconnectAccount,
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
  } = useDrive();

  const [items, setItems] = useState<DriveItem[]>(initialItems || []);
  const [filteredItems, setFilteredItems] = useState<DriveItem[]>([]);
  const [isLoading, setIsLoading] = useState(initialLoading ?? false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [serviceItems, setServiceItems] = useState<Record<string, DriveItem[]>>(
    {},
  );
  const [searchInputValue, setSearchInputValue] = useState("");

  // Add the hook
  const {
    currentFolder,
    currentFolderService,
    currentAccountId,
    breadcrumbPath,
    handleFolderClick,
    navigateToRoot,
    updateURL, // Make sure we're getting this from the hook
  } = useDriveNavigation();

  // Add a map to track service account numbers
  const [serviceAccountNumbers, setServiceAccountNumbers] = useState<
    Record<string, Record<string, number>>
  >({});

  const router = useRouter();
  const searchParams = useSearchParams();

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

        // Instead of directly setting these values, use the navigation hook
        const rootFolder: DriveItem = {
          id: "root",
          name: "Home",
          type: "folder",
          modifiedAt: "",
          parentId: null,
        };
        handleFolderClick(rootFolder);
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

      // Combine all files and sort them (folders first, then alphabetically)
      const sortedFiles = allFiles.sort((a, b) => {
        // First sort by type (folders first)
        if (a.type === "folder" && b.type !== "folder") return -1;
        if (a.type !== "folder" && b.type === "folder") return 1;

        // Then sort alphabetically by name
        return a.name.localeCompare(b.name);
      });

      setItems(sortedFiles);
    } catch (err) {
      console.error("Fetch files error:", err); // Add more detailed error logging
      setError(`Failed to fetch files from one or more services`);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleUpload = () => {
    alert("Upload functionality would go here!");
  };

  const handleServiceSelect = (serviceId: string) => {
    authenticateService(serviceId);
  };

  const handleAddAccount = (serviceId: string) => {
    addNewAccount(serviceId);
  };

  const handleDisconnectService = (serviceId: string) => {
    // If we're currently viewing a folder from this service, go back to root
    if (currentFolderService === serviceId) {
      setCurrentFolderService(null);
      setCurrentAccountId(null);
      setCurrentFolder("root");
    }

    disconnectService(serviceId);
  };

  const handleDisconnectAccount = (serviceId: string, accountId: string) => {
    // If we're currently viewing a folder from this account, go back to root
    if (currentFolderService === serviceId && currentAccountId === accountId) {
      setCurrentFolderService(null);
      setCurrentAccountId(null);
      setCurrentFolder("root");
    }

    disconnectAccount(serviceId, accountId);
  };

  const handleSwitchService = (serviceId: string) => {
    // No need to update actual authentication status, just switch the UI view
    if (activeServices.includes(serviceId)) {
      window.location.reload(); // Simple reload to ensure state is fresh
    }
  };

  // Display service name for files
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

  // Generate account numbers for each service when serviceAccounts changes
  useEffect(() => {
    if (serviceAccounts.length === 0) return;

    const accountNumbers: Record<string, Record<string, number>> = {};

    // Group accounts by service and assign sequential numbers for all accounts
    serviceAccounts.forEach((account) => {
      if (!accountNumbers[account.service]) {
        accountNumbers[account.service] = {};
      }

      // Always number accounts, even if there's only one for a service
      const accountsForService = serviceAccounts.filter(
        (a) => a.service === account.service,
      );

      // Find the position of this account in the filtered array (this preserves original order)
      const accountIndex = accountsForService.findIndex(
        (a) => a.id === account.id,
      );
      accountNumbers[account.service][account.id] = accountIndex + 1;
    });

    setServiceAccountNumbers(accountNumbers);
  }, [serviceAccounts]);

  // Handle search input changes
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target?.value || "";
    setSearchInputValue(value);

    // For instant filtering of current folder contents
    if (value.trim() === "") {
      clearSearch();
      setFilteredItems(items);
    } else {
      setSearchQuery(value);
    }
  };

  // Handle search submission (for recursive search)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInputValue?.trim()) {
      void performSearch(searchInputValue);
    }
  };

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

  // Clear search when navigating to a different folder
  useEffect(() => {
    if (searchQuery && !isRecursiveSearch) {
      clearSearch();
      setSearchInputValue("");
    }

    // If we're at root, use navigateToRoot
    if (currentFolder === "root") {
      navigateToRoot();
    }
  }, [currentFolder]);

  // Clear items and filteredItems when logging out
  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      setFilteredItems([]);
      setSearchInputValue("");
      clearSearch();
      navigateToRoot();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const folderId = searchParams.get("folderId");
    const service = searchParams.get("service");
    const accountId = searchParams.get("accountId");

    if (folderId && folderId !== currentFolder) {
      const folderItem: DriveItem = {
        id: folderId,
        name: "", // This will be updated when folder contents are fetched
        type: "folder",
        modifiedAt: "",
        parentId: null,
        service: service || undefined,
        accountId: accountId || undefined,
      };

      // Use existing logic but skip URL update
      if (folderItem.service) {
        setCurrentFolderService(folderItem.service);
        setCurrentAccountId(folderItem.accountId || null);
      }
      setCurrentFolder(folderItem.id);
    }
  }, [searchParams]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-black dark:bg-gray-950 dark:text-white">
      <div className="flex-none p-4 sm:p-6">
        {/* Header */}
        <Header
          isAuthenticated={isAuthenticated}
          activeServices={activeServices}
          serviceAccounts={serviceAccounts}
          searchInputValue={searchInputValue}
          onSearchInputChange={handleSearchInputChange}
          onSearchSubmit={handleSearchSubmit}
          onUpload={handleUpload}
          onDisconnectService={handleDisconnectService}
          onDisconnectAccount={handleDisconnectAccount}
          onServiceSelect={handleServiceSelect}
          onAddAccount={handleAddAccount}
        />

        <div className="mx-auto max-w-6xl">
          {/* Breadcrumb navigation */}
          <DriveBreadcrumb
            items={breadcrumbPath}
            currentFolder={currentFolder}
            onNavigate={(item) => {
              const folderItem: DriveItem = {
                id: item.id,
                name: item.name,
                type: "folder",
                modifiedAt: "",
                parentId: null,
                service: item.service,
                accountId: item.accountId,
              };
              handleFolderClick(folderItem);
            }}
            className="mb-4"
          />
          <div className="overflow-hidden rounded-lg border bg-white dark:border-gray-800 dark:bg-gray-950">
            {error && (
              <DriveErrorState
                error={error}
                onRetry={() => fetchFiles(currentFolder)}
              />
            )}
            <div className="relative">
              {isLoading || isAuthenticating || isSearching ? (
                <div className="py-16">
                  <LoadingSpinner />
                  <p className="text-muted-foreground text-center">
                    {isSearching ? "Searching..." : "Loading files..."}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-800">
                      <TableHead className="sticky top-0 w-[45%] bg-gray-50 dark:bg-gray-900">
                        Name
                      </TableHead>
                      <TableHead className="sticky top-0 w-[20%] bg-gray-50 text-right dark:bg-gray-900">
                        Modified
                      </TableHead>
                      <TableHead className="sticky top-0 w-[15%] bg-gray-50 text-right dark:bg-gray-900">
                        Size
                      </TableHead>
                      <TableHead className="sticky top-0 w-[20%] bg-gray-50 text-right dark:bg-gray-900">
                        Service & Account
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center">
                          {searchQuery
                            ? `No files match "${searchQuery}"`
                            : "No files found in this folder"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item) => (
                        <DriveItemRow
                          key={`${item.service}-${item.accountId ?? "default"}-${item.id}`}
                          item={item}
                          serviceAccounts={serviceAccounts}
                          isRecursiveSearch={isRecursiveSearch}
                          clearSearch={() => {
                            clearSearch();
                            setSearchInputValue("");
                          }}
                          handleFolderClick={handleFolderClick}
                          openFile={openFile}
                        />
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
