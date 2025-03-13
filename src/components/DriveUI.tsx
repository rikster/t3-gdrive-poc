'use client';

import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '~/components/ui/table';
import { Upload, FileIcon, FolderIcon, LogOut, Search } from 'lucide-react';
import { ThemeToggle } from './theme/ThemeToggle';
import { AddServiceButton } from './AddServiceButton';
import { useDrive } from '~/contexts/DriveContext';
import { LoadingSpinner } from './ui/loading-spinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DriveItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modifiedAt: string;
  parentId: string | null;
  service?: string; // Added to track which service the item comes from
}

interface DriveUIProps {
  items?: DriveItem[];
  loading?: boolean;
  error?: string | null;
}

export function DriveUI({ items: initialItems, loading: initialLoading, error: initialError }: DriveUIProps = {}) {
  const {
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
  } = useDrive();

  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [items, setItems] = useState<DriveItem[]>(initialItems || []);
  const [filteredItems, setFilteredItems] = useState<DriveItem[]>([]);
  const [path, setPath] = useState<DriveItem[]>([{
    id: 'root', name: 'My Drives', type: 'folder', modifiedAt: '',
    parentId: null
  }]);
  const [isLoading, setIsLoading] = useState(initialLoading ?? false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [serviceItems, setServiceItems] = useState<Record<string, DriveItem[]>>({});
  const [currentFolderService, setCurrentFolderService] = useState<string | null>(null);
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

  const fetchFilesFromService = async (service: string, folderId: string): Promise<DriveItem[]> => {
    try {
      const response = await fetch(`/api/${service}?folderId=${folderId}`);
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

      // Ensure data.files is always an array and add service property
      const files = Array.isArray(data.files)
        ? data.files.map((file: DriveItem) => ({ ...file, service }))
        : [];

      return files;
    } catch (err) {
      console.error(`Failed to fetch files from ${service}:`, err);
      return [];
    }
  };

  const fetchFiles = async (folderId: string) => {
    if (initialItems || !isAuthenticated || activeServices.length === 0) {
      return; // Don't fetch if we're using props or not authenticated
    }

    setIsLoading(true);
    setError(null);

    try {
      let allFiles: DriveItem[] = [];

      // If we're at root level or no specific service is set, fetch from all services
      if (folderId === 'root' || !currentFolderService) {
        const serviceResults: Record<string, DriveItem[]> = {};
        const allFilesPromises = activeServices.map(async (service) => {
          const files = await fetchFilesFromService(service, 'root');
          serviceResults[service] = files;
          return files;
        });

        const results = await Promise.all(allFilesPromises);
        allFiles = results.flat();

        // Update state with all services' files
        setServiceItems(serviceResults);
        setCurrentFolderService(null); // At root, no specific service
      } else {
        // If we're in a specific folder, only fetch from that service
        allFiles = await fetchFilesFromService(currentFolderService, folderId);
        const serviceResults: Record<string, DriveItem[]> = {};
        serviceResults[currentFolderService] = allFiles;
        setServiceItems(serviceResults);
      }

      // Combine all files and sort them (folders first, then alphabetically)
      const sortedFiles = allFiles.sort((a, b) => {
        // First sort by type (folders first)
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;

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
  }, [currentFolder, isAuthenticated, activeServices]);

  const handleFolderClick = async (item: DriveItem) => {
    // Update the current folder service when navigating into a folder
    if (item.service) {
      setCurrentFolderService(item.service);
    }

    setCurrentFolder(item.id);
    setPath(prev => [...prev, item]);
  };

  const handlePathClick = (item: DriveItem, index: number) => {
    // Reset service context if navigating to root
    if (index === 0) {
      setCurrentFolderService(null);
    } else if (item.service) {
      setCurrentFolderService(item.service);
    }

    setCurrentFolder(item.id);
    setPath(prev => prev.slice(0, index + 1));
  };

  const handleUpload = () => {
    alert('Upload functionality would go here!');
  };

  const handleServiceSelect = (serviceId: string) => {
    authenticateService(serviceId);
  };

  const handleDisconnectService = (serviceId: string) => {
    // If we're currently viewing a folder from this service, go back to root
    if (currentFolderService === serviceId) {
      setCurrentFolderService(null);
      setCurrentFolder('root');
      setPath([{
        id: 'root', name: 'My Drives', type: 'folder', modifiedAt: '',
        parentId: null
      }]);
    }

    disconnectService(serviceId);
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
    if (!service) return '';

    switch (service) {
      case 'google': return 'Google Drive';
      case 'onedrive': return 'OneDrive';
      case 'dropbox': return 'Dropbox';
      case 'box': return 'Box';
      default: return service;
    }
  };

  // Get the current breadcrumb path with service indicators
  const getBreadcrumbTitle = () => {
    if (currentFolderService && path.length > 1) {
      return (
        <span className="flex items-center">
          <span className="text-xs mr-2 px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
            {getServiceName(currentFolderService)}
          </span>
          {path[path.length - 1].name}
        </span>
      );
    }
    return path[path.length - 1].name;
  };

  // Handle search input changes
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target?.value || '';
    setSearchInputValue(value);

    // For instant filtering of current folder contents
    if (value.trim() === '') {
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
      if (searchQuery.trim() === '') {
        setFilteredItems(items);
        return;
      }

      const query = searchQuery.toLowerCase();
      const filtered = items.filter(item =>
        item.name.toLowerCase().includes(query)
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
      setCurrentFolder('root');
      setPath([{
        id: 'root', name: 'My Drives', type: 'folder', modifiedAt: '',
        parentId: null
      }]);
      setCurrentFolderService(null);
    }
  }, [isAuthenticated]);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950 text-black dark:text-white">
      <div className="flex-none p-4 sm:p-6">
        {/* Header */}
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <h1 className="text-2xl font-bold">StrataFusion</h1>
            <div className="sm:hidden">
              <ThemeToggle />
            </div>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* Search input with form for submission */}
            <form onSubmit={handleSearchSubmit} className="relative flex-grow max-w-xs">
              <input
                type="text"
                placeholder="Search onscreen..."
                value={searchInputValue}
                onChange={handleSearchInputChange}
                className="pl-8 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
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
              availableServices={[
                { id: 'google', name: 'Google Drive' },
                { id: 'onedrive', name: 'OneDrive' },
                { id: 'dropbox', name: 'Dropbox' },
                { id: 'box', name: 'Box' },
              ]}
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
                    <span className="capitalize mr-1">
                      {activeServices.map(service => getServiceName(service)).join(', ')}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {activeServices.map(service => (
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
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center text-sm mb-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 py-1">
            {isRecursiveSearch ? (
              <div className="flex items-center">
                <button
                  onClick={() => {
                    clearSearch();
                    setSearchInputValue("");
                    // Return to root folder
                    setCurrentFolder('root');
                    setPath([{
                      id: 'root', name: 'My Drives', type: 'folder', modifiedAt: '',
                      parentId: null
                    }]);
                    setCurrentFolderService(null);
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
                <div key={item.id} className="flex items-center min-w-fit">
                  {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                  <button
                    onClick={() => handlePathClick(item, index)}
                    className={`hover:underline ${index === path.length - 1
                      ? 'font-medium'
                      : 'text-muted-foreground'
                      }`}
                  >
                    {item.name}
                    {item.service && index === path.length - 1 && (
                      <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
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
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-950 rounded-lg border dark:border-gray-800 overflow-hidden">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400">
                <p>{error}</p>
              </div>
            )}

            <div className="relative">
              {(isLoading || isAuthenticating || isSearching) ? (
                <div className="py-16">
                  <LoadingSpinner />
                  <p className="text-center text-muted-foreground">
                    {isSearching ? 'Searching...' : 'Loading files...'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-800">
                      <TableHead className="w-[45%] bg-gray-50 dark:bg-gray-900 sticky top-0">Name</TableHead>
                      <TableHead className="w-[20%] bg-gray-50 dark:bg-gray-900 sticky top-0 text-right">Modified</TableHead>
                      <TableHead className="w-[15%] bg-gray-50 dark:bg-gray-900 sticky top-0 text-right">Size</TableHead>
                      <TableHead className="w-[20%] bg-gray-50 dark:bg-gray-900 sticky top-0 text-right">Service</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          {searchQuery
                            ? `No files match "${searchQuery}"`
                            : 'No files found in this folder'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item) => (
                        <TableRow key={`${item.service}-${item.id}`} className="group hover:bg-gray-100 dark:hover:bg-gray-800">
                          <TableCell className="py-3">
                            <div className="flex items-start gap-2 min-h-[32px] w-full">
                              {item.type === 'folder' ? (
                                <Button
                                  variant="ghost"
                                  className="p-0 h-auto flex items-start justify-start text-left w-full"
                                  onClick={() => {
                                    if (isRecursiveSearch) {
                                      // Clear search when navigating to a folder from search results
                                      clearSearch();
                                      setSearchInputValue("");
                                    }
                                    handleFolderClick(item);
                                  }}
                                >
                                  <FolderIcon className="h-5 w-5 mr-2 flex-shrink-0 text-blue-500 mt-1" />
                                  <span className="hover:underline whitespace-normal break-words">{item.name}</span>
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  className="p-0 h-auto flex items-start justify-start text-left w-full"
                                  onClick={() => {
                                    if (item.service) {
                                      openFile(item.id, item.service);
                                    }
                                  }}
                                >
                                  <FileIcon className="h-5 w-5 mr-2 flex-shrink-0 text-gray-500 mt-1" />
                                  <span className="hover:underline whitespace-normal break-words">{item.name}</span>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {item.modifiedAt}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {item.size || '-'}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {getServiceName(item.service)}
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
