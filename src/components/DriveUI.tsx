'use client';

import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '~/components/ui/table';
import { Upload, FileIcon, FolderIcon, LogOut } from 'lucide-react';
import { ThemeToggle } from './theme/ThemeToggle';
import { AddServiceButton } from './AddServiceButton';
import { useDrive } from '~/contexts/DriveContext';

interface DriveItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modifiedAt: string;
  parentId: string | null;
}

interface DriveUIProps {
  items?: DriveItem[];
  loading?: boolean;
  error?: string | null;
}

export function DriveUI({ items: initialItems, loading: initialLoading, error: initialError }: DriveUIProps = {}) {
  const { isAuthenticated, authenticateService, logout, currentService, isAuthenticating } = useDrive();
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [items, setItems] = useState<DriveItem[]>(initialItems || []);
  const [path, setPath] = useState<DriveItem[]>([{
    id: 'root', name: 'My Drives', type: 'folder', modifiedAt: '',
    parentId: null
  }]);
  const [isLoading, setIsLoading] = useState(initialLoading ?? false);
  const [error, setError] = useState<string | null>(initialError ?? null);

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

  const fetchFiles = async (folderId: string) => {
    if (initialItems || !isAuthenticated) return; // Don't fetch if we're using props or not authenticated

    try {
      setIsLoading(true);
      const response = await fetch(`/api/google?folderId=${folderId}`);
      const data = await response.json();

      if (data.url) {
        // Need to authenticate
        window.location.href = data.url;
        return;
      }

      setItems(data.files);
      setError(null);
    } catch (err) {
      setError('Failed to fetch files');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFiles(currentFolder);
    }
  }, [currentFolder, isAuthenticated]);

  const handleFolderClick = async (item: DriveItem) => {
    setCurrentFolder(item.id);
    setPath(prev => [...prev, item]);
  };

  const handlePathClick = (item: DriveItem, index: number) => {
    setCurrentFolder(item.id);
    setPath(prev => prev.slice(0, index + 1));
  };

  const handleUpload = () => {
    alert('Upload functionality would go here!');
  };

  const handleServiceSelect = (serviceId: string) => {
    authenticateService(serviceId);
  };

  const renderSpinner = () => (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
    </div>
  );

  if (isLoading || isAuthenticating) {
    return renderSpinner();
  }

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
            {isAuthenticated ? (
              <>
                <Button onClick={handleUpload} className="w-full sm:w-auto">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
                <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8">
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Logout</span>
                </Button>
              </>
            ) : (
              <AddServiceButton 
                onServiceSelect={handleServiceSelect}
                availableServices={[
                  { id: 'google', name: 'Google Drive' },
                  { id: 'onedrive', name: 'OneDrive' },
                  { id: 'dropbox', name: 'Dropbox' },
                  { id: 'box', name: 'Box' },
                ]}
              />
            )}
          </div>
        </div>

        {/* Breadcrumb */}
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
                    {item.name}
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
            <div className="rounded-md border border-gray-200 dark:border-gray-800">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-800">
                    <TableHead className="w-[50%] bg-gray-50 dark:bg-gray-900 sticky top-0">Name</TableHead>
                    <TableHead className="w-[25%] bg-gray-50 dark:bg-gray-900 sticky top-0 text-right">Modified</TableHead>
                    <TableHead className="w-[25%] bg-gray-50 dark:bg-gray-900 sticky top-0 text-right">Size</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} className="group hover:bg-gray-100 dark:hover:bg-gray-800">
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
                            <Button variant="ghost" className="p-0 h-auto flex items-start justify-start text-left w-full" asChild>
                              <a href={`https://drive.google.com/file/d/${item.id}/view`} target="_blank" rel="noopener noreferrer" className="w-full">
                                <FileIcon className="h-5 w-5 mr-2 flex-shrink-0 text-gray-500 dark:text-gray-400 mt-1" />
                                <span className="hover:underline whitespace-normal break-words">{item.name}</span>
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-right align-top py-3">
                        {item.modifiedAt}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-right align-top py-3">
                        {item.size || '--'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center max-w-md">
              <h2 className="text-2xl font-bold mb-4">Connect to a Drive</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Get started by connecting to your favorite cloud storage service using the + button in the top right corner.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
