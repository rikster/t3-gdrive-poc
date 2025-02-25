'use client';

import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '~/components/ui/table';
import { Upload, FileIcon, FolderIcon } from 'lucide-react';

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
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [items, setItems] = useState<DriveItem[]>(initialItems || []);
  const [path, setPath] = useState<DriveItem[]>([{
    id: 'root', name: 'My Drives', type: 'folder', modifiedAt: '',
    parentId: null
  }]);
  const [isLoading, setIsLoading] = useState(initialLoading ?? true);
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
    if (initialItems) return; // Don't fetch if we're using props

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
    fetchFiles(currentFolder);
  }, [currentFolder]);

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

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-none p-4 sm:p-6">
        {/* Header */}
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
          <h1 className="text-2xl font-bold">StrataFusion</h1>
          <Button onClick={handleUpload} className="w-full sm:w-auto">
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>

        {/* Breadcrumb */}
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
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto px-4 sm:px-6 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%] bg-background sticky top-0">Name</TableHead>
                  <TableHead className="w-[25%] bg-background sticky top-0 text-right">Modified</TableHead>
                  <TableHead className="w-[25%] bg-background sticky top-0 text-right">Size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="group">
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
                              <FileIcon className="h-5 w-5 mr-2 flex-shrink-0 text-gray-500 mt-1" />
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
      </div>
    </div>
  );
}
