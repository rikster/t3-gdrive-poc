'use client';

import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '~/components/ui/table';
import { Upload } from 'lucide-react';

interface DriveItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modifiedAt: string;
}

export function DriveUI() {
  const [currentFolder, setCurrentFolder] = useState<string>('root');
  const [items, setItems] = useState<DriveItem[]>([]);
  const [path, setPath] = useState<DriveItem[]>([{ id: 'root', name: 'My Drive', type: 'folder', modifiedAt: '' }]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFiles = async (folderId: string) => {
    try {
      const response = await fetch(`/api/google?folderId=${folderId}`);
      const data = await response.json();
      
      if (data.url) {
        // Need to authenticate
        window.location.href = data.url;
        return;
      }

      setItems(data.files);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching files:', error);
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

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-none p-6">
        {/* Header */}
        <div className="max-w-6xl mx-auto flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">StrataFusion</h1>
          <Button onClick={handleUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>

        {/* Breadcrumb */}
        <div className="max-w-6xl mx-auto flex items-center gap-2 mb-6 h-8">
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

      {/* File List */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        <div className="max-w-6xl mx-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%] bg-background sticky top-0">Name</TableHead>
                <TableHead className="w-[25%] bg-background sticky top-0">Modified</TableHead>
                <TableHead className="w-[25%] bg-background sticky top-0">Size</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.type === 'folder' ? (
                        <Button
                          variant="ghost"
                          className="p-0 h-auto"
                          onClick={() => handleFolderClick(item)}
                        >
                          <span className="text-lg mr-2">📁</span>
                          <span className="hover:underline">{item.name}</span>
                        </Button>
                      ) : (
                        <Button variant="ghost" className="p-0 h-auto" asChild>
                          <a href={`https://drive.google.com/file/d/${item.id}/view`} target="_blank" rel="noopener noreferrer">
                            <span className="text-lg mr-2">📄</span>
                            <span className="hover:underline">{item.name}</span>
                          </a>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.modifiedAt}</TableCell>
                  <TableCell className="text-muted-foreground">{item.size || '--'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
