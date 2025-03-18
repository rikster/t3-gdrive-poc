"use client";

import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "~/components/ui/table";
import { Upload, FileIcon, FolderIcon, LogOut, Search } from "lucide-react";
import { ThemeToggle } from "./theme/ThemeToggle";
import { AddServiceButton } from "./AddServiceButton";
import { useDrive } from "~/contexts/DriveContext";
import { LoadingSpinner } from "./ui/loading-spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DriveItem {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: string;
  modifiedAt: string;
  parentId: string | null;
  service?: string; // Added to track which service the item comes from
  accountId?: string;
  accountName?: string;
  accountEmail?: string;
}

interface DriveUIProps {
  items?: DriveItem[];
  loading?: boolean;
  error?: string | null;
}

export function DriveUI({
  items: initialItems,
  loading: initialLoading,
  error: initialError,
}: DriveUIProps = {}) {
  const {
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
  } = useDrive();

  const [currentFolder, setCurrentFolder] = useState<string>("root");
  const [items, setItems] = useState<DriveItem[]>(initialItems || []);
  const [filteredItems, setFilteredItems] = useState<DriveItem[]>([]);
  const [path, setPath] = useState<DriveItem[]>([
    {
      id: "root",
      name: "My Drives",
      type: "folder",
      modifiedAt: "",
      parentId: null,
    },
  ]);
  const [isLoading, setIsLoading] = useState(initialLoading ?? false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [serviceItems, setServiceItems] = useState<Record<string, DriveItem[]>>(
    {},
  );
  const [currentFolderService, setCurrentFolderService] = useState<
    string | null
  >(null);
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(null);
  const [searchInputValue, setSearchInputValue] = useState("");

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
        ? data.files.map((file: DriveItem) => ({
            ...file,
            service,
            accountId,
          }))
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
            accountName:
              account.name || `${getServiceName(account.service)} Account`,
            accountEmail: account.email,
          }));

          serviceResults[account.service] = [
            ...serviceResults[account.service],
            ...filesWithAccount,
          ];
          return filesWithAccount;
        });

        const results = await Promise.all(allFilesPromises);
        allFiles = results.flat();

        // Update state with all services' files
        setServiceItems(serviceResults);
        setCurrentFolderService(null);
        setCurrentAccountId(null);
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
            accountName:
              account.name || `${getServiceName(account.service)} Account`,
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
      setError(`Failed to fetch files from one or more services`);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFiles(currentFolder);
    }
  }, [currentFolder, isAuthenticated, serviceAccounts, currentAccountId]);

  const handleFolderClick = async (item: DriveItem) => {
    // Update the current folder service when navigating into a folder
    if (item.service) {
      setCurrentFolderService(item.service);
    }

    // Update the current account ID when navigating
    if ("accountId" in item) {
      setCurrentAccountId(item.accountId as string);
    }

    setCurrentFolder(item.id);
    setPath((prev) => [...prev, item]);
  };

  const handlePathClick = (item: DriveItem, index: number) => {
    // Reset service context if navigating to root
    if (index === 0) {
      setCurrentFolderService(null);
      setCurrentAccountId(null);
    } else if (item.service) {
      setCurrentFolderService(item.service);

      // Set account ID if available
      if ("accountId" in item) {
        setCurrentAccountId(item.accountId as string);
      }
    }

    setCurrentFolder(item.id);
    setPath((prev) => prev.slice(0, index + 1));
  };

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
      setPath([
        {
          id: "root",
          name: "My Drives",
          type: "folder",
          modifiedAt: "",
          parentId: null,
        },
      ]);
    }

    disconnectService(serviceId);
  };

  const handleDisconnectAccount = (serviceId: string, accountId: string) => {
    // If we're currently viewing a folder from this account, go back to root
    if (currentFolderService === serviceId && currentAccountId === accountId) {
      setCurrentFolderService(null);
      setCurrentAccountId(null);
      setCurrentFolder("root");
      setPath([
        {
          id: "root",
          name: "My Drives",
          type: "folder",
          modifiedAt: "",
          parentId: null,
        },
      ]);
    }

    disconnectAccount(serviceId, accountId);
  };

  const handleSwitchService = (serviceId: string) => {
    // No need to update actual authentication status, just switch the UI view
    if (activeServices.includes(serviceId)) {
      window.location.reload(); // Simple reload to ensure state is fresh
    }
  };

  // Ensure items is always an array
  const safeItems = Array.isArray(items) ? items : [];

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

  // Get account display name
  const getAccountDisplayName = (item: DriveItem) => {
    if ("accountName" in item && item.accountName) {
      return item.accountName;
    }

    if ("accountEmail" in item && item.accountEmail) {
      return item.accountEmail;
    }

    return getServiceName(item.service);
  };

  // Get the current breadcrumb path with service indicators
  const getBreadcrumbTitle = () => {
    if (currentFolderService && path.length > 1) {
      const currentItem = path[path.length - 1];
      const accountName =
        "accountName" in currentItem ? currentItem.accountName : null;
      const accountEmail =
        "accountEmail" in currentItem ? currentItem.accountEmail : null;

      return (
        <span className="flex items-center">
          <span className="mr-2 rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">
            {accountName ||
              accountEmail ||
              getServiceName(currentFolderService)}
          </span>
          {currentItem.name}
        </span>
      );
    }

    return path[path.length - 1]?.name || "My Drives";
  };

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
      performSearch(searchInputValue);
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
      setFilteredItems(searchResults);
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
  }, [currentFolder]);

  // Clear items and filteredItems when logging out
  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      setFilteredItems([]);
      setSearchInputValue("");
      clearSearch();
      setCurrentFolder("root");
      setPath([
        {
          id: "root",
          name: "My Drives",
          type: "folder",
          modifiedAt: "",
          parentId: null,
        },
      ]);
      setCurrentFolderService(null);
      setCurrentAccountId(null);
    }
  }, [isAuthenticated]);

  return (
    <div className="flex h-screen flex-col bg-white text-black dark:bg-gray-950 dark:text-white">
      <div className="flex-none p-4 sm:p-6">
        {/* Header */}
        <div className="mx-auto mb-6 flex max-w-6xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:gap-0">
          <div className="flex w-full items-center justify-between sm:w-auto">
            <h1 className="text-2xl font-bold">StrataFusion</h1>
            <div className="sm:hidden">
              <ThemeToggle />
            </div>
          </div>
          <div className="flex w-full items-center gap-4 sm:w-auto">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* Search input with form for submission */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative max-w-xs flex-grow"
            >
              <input
                type="text"
                placeholder="Search onscreen..."
                value={searchInputValue}
                onChange={handleSearchInputChange}
                className="w-full rounded-md border py-2 pl-8 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
              />
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <button
                type="submit"
                className="absolute right-2 top-2 text-xs text-blue-500 hover:text-blue-700"
              >
                Search All
              </button>
            </form>

            {/* Always show Add Service button */}
            <AddServiceButton
              onServiceSelect={handleServiceSelect}
              onAddAccount={handleAddAccount}
              activeServices={activeServices}
            />

            {isAuthenticated && (
              <Button onClick={handleUpload} className="w-full sm:w-auto">
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            )}

            {/* Service selector for multiple services */}
            {activeServices.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <span className="mr-1 capitalize">
                      {activeServices
                        .map((service) => getServiceName(service))
                        .join(", ")}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {activeServices.map((service) => (
                    <DropdownMenuItem
                      key={service}
                      onClick={() => handleDisconnectService(service)}
                      className="cursor-pointer text-red-500 hover:text-red-700"
                    >
                      Disconnect {getServiceName(service)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Always show logout button when authenticated with Clerk */}
            {isClerkAuthenticated && (
              <Button variant="outline" onClick={logout} size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            )}
          </div>
        </div>

        {/* Path navigation */}
        <div className="mx-auto max-w-6xl">
          <div className="scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 mb-4 flex items-center overflow-x-auto py-1 text-sm">
            {isRecursiveSearch ? (
              <div className="flex items-center">
                <button
                  onClick={() => {
                    clearSearch();
                    setSearchInputValue("");
                    // Return to root folder
                    setCurrentFolder("root");
                    setPath([
                      {
                        id: "root",
                        name: "My Drives",
                        type: "folder",
                        modifiedAt: "",
                        parentId: null,
                      },
                    ]);
                    setCurrentFolderService(null);
                    setCurrentAccountId(null);
                  }}
                  className="text-blue-500 hover:underline"
                >
                  My Drives
                </button>
                <span className="mx-2 text-gray-400">/</span>
                <span className="font-medium">
                  Search results for "{searchQuery}"
                </span>
              </div>
            ) : (
              path.map((item, index) => (
                <div key={item.id} className="flex min-w-fit items-center">
                  {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                  <button
                    onClick={() => handlePathClick(item, index)}
                    className={`hover:underline ${
                      index === path.length - 1
                        ? "font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.name}
                    {item.service && index === path.length - 1 && (
                      <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">
                        {getServiceName(item.service)}
                      </span>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-auto">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-lg border bg-white dark:border-gray-800 dark:bg-gray-950">
            {error && (
              <div className="border-b border-red-100 bg-red-50 p-4 text-red-600 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400">
                <p>{error}</p>
              </div>
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
                        Service
                      </TableHead>
                      <TableHead className="sticky top-0 w-[20%] bg-gray-50 text-right dark:bg-gray-900">
                        Account
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
                        <TableRow
                          key={`${item.service}-${item.id}`}
                          className="group hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <TableCell className="py-3">
                            <div className="flex min-h-[32px] w-full items-start gap-2">
                              {item.type === "folder" ? (
                                <Button
                                  variant="ghost"
                                  className="flex h-auto w-full items-start justify-start p-0 text-left"
                                  onClick={() => {
                                    if (isRecursiveSearch) {
                                      // Clear search when navigating to a folder from search results
                                      clearSearch();
                                      setSearchInputValue("");
                                    }
                                    handleFolderClick(item);
                                  }}
                                >
                                  <FolderIcon className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-blue-500" />
                                  <span className="whitespace-normal break-words hover:underline">
                                    {item.name}
                                  </span>
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  className="flex h-auto w-full items-start justify-start p-0 text-left"
                                  onClick={() => {
                                    if (item.service) {
                                      openFile(
                                        item.id,
                                        item.service,
                                        item.accountId as string,
                                      );
                                    }
                                  }}
                                >
                                  <FileIcon className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-gray-500" />
                                  <span className="whitespace-normal break-words hover:underline">
                                    {item.name}
                                  </span>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-right">
                            {item.modifiedAt}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-right">
                            {item.size || "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-right">
                            {getServiceName(item.service)}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-right">
                            {item.accountName ||
                              item.accountEmail ||
                              getServiceName(item.service)}
                          </TableCell>
                        </TableRow>
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
