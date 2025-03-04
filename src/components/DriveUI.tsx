'use client';

import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '~/components/ui/table';
import { Upload, FileIcon, FolderIcon, LogOut } from 'lucide-react';
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
    authenticateService, 
    disconnectService, 
    logout, 
    currentService, 
    activeServices, 
    isAuthenticating 
  } = useDrive();
  
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [items, setItems] = useState<DriveItem[]>(initialItems || []);
  const [path, setPath] = useState<DriveItem[]>([{
    id: 'root', name: 'My Drives', type: 'folder', modifiedAt: '',
    parentId: null
  }]);
  const [isLoading, setIsLoading] = useState(initialLoading ?? false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [serviceItems, setServiceItems] = useState<Record<string, DriveItem[]>>({});
  // Track which service the current folder belongs to (null means 'root' or 'all services')
  const [currentFolderService, setCurrentFolderService] = useState<string | null>(null);

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

  if (isLoading || isAuthenticating) {
    return <LoadingSpinner />;
  }

  // Ensure items is always an array
  const safeItems = Array.isArray(items) ? items : [];
  
  // Display service name for files
  const getServiceName = (service?: string) => {
    if (!service) return '';
    
    switch(service) {
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
              <>
                <Button onClick={handleUpload} className="w-full sm:w-auto">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
                
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
                          className="flex justify-between items-center"
                        >
                          <span className="capitalize">{getServiceName(service)}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDisconnectService(service)}
                            className="ml-2 h-6 text-xs"
                          >
                            Disconnect
                          </Button>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                
                <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8">
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Logout</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Breadcrumb with service indicators */}
        {isAuthenticated && (
          <div className="max-w-6xl mx-auto overflow-x-auto">
            <div className="flex items-center gap-2 mb-6 h-8 min-w-max">
              {path.map((item, index) => (
                <div key={item.id} className="flex items-center">
                  {index > 0 && <span className="mx-2 text-muted-foreground">/</span>}
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => handlePathClick(item, index)}
                  >
                    {index === path.length - 1 ? getBreadcrumbTitle() : item.name}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* File List or Welcome Screen */}
      <div className="flex-1 overflow-auto px-4 sm:px-6 pb-6">
        {isAuthenticated ? (
          <div className="max-w-6xl mx-auto">
            {error && (
              <div className="mb-4 p-4 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            
            {/* Service indicator when viewing a specific service's folder */}
            {currentFolderService && currentFolder !== 'root' && (
              <div className="mb-4 p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center">
                <span>Viewing files from {getServiceName(currentFolderService)}</span>
              </div>
            )}
            
            <div className="rounded-md border border-gray-200 dark:border-gray-800">
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
                  {safeItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        No files found in this folder
                      </TableCell>
                    </TableRow>
                  ) : (
                    safeItems.map((item) => (
                      <TableRow key={`${item.service}-${item.id}`} className="group hover:bg-gray-100 dark:hover:bg-gray-800">
                        <TableCell className="py-3">
                          <div className="flex items-start gap-2 min-h-[32px] w-full">
                            {item.type === 'folder' ? (
                              <Button
                                variant="ghost"
                                className="p-0 h-auto flex items-start justify-start text-left w-full"
                                onClick={() => handleFolderClick(item)}
                              >
                                <FolderIcon className="h-5 w-5 mr-2 flex-shrink-0 text-blue-500 mt-1" />
                                <span className="hover:underline whitespace-normal break-words">{item.name}</span>
                              </Button>
                            ) : (
                              <div className="flex items-start w-full">
                                <FileIcon className="h-5 w-5 mr-2 flex-shrink-0 text-gray-500 mt-1" />
                                <span className="whitespace-normal break-words">{item.name}</span>
                              </div>
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
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center py-16">
            <h2 className="text-xl font-medium mb-4">Welcome to StrataFusion</h2>
            <p className="text-muted-foreground mb-8">
              Connect to your cloud storage to view and manage your files.
            </p>
            <AddServiceButton 
              onServiceSelect={handleServiceSelect}
              availableServices={[
                { id: 'google', name: 'Google Drive' },
                { id: 'onedrive', name: 'OneDrive' },
                { id: 'dropbox', name: 'Dropbox' },
                { id: 'box', name: 'Box' },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}
