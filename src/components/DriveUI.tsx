'use client';

import { useState } from 'react';
import { type DriveItem, mockDriveData } from '~/lib/mock-data';
import { Button } from '~/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '~/components/ui/table';
import { Upload } from 'lucide-react';

export function DriveUI() {
  const [currentFolder, setCurrentFolder] = useState<string>('root');

  const getCurrentItems = () => {
    return mockDriveData.filter(item => item.parentId === currentFolder);
  };

  const getCurrentPath = () => {
    const path: DriveItem[] = [];
    let current = mockDriveData.find(item => item.id === currentFolder);
    while (current) {
      path.unshift(current);
      current = mockDriveData.find(item => item.id === current.parentId);
    }
    return path;
  };

  const handleUpload = () => {
    alert('Upload functionality would go here!');
  };

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
          {getCurrentPath().map((item, index) => (
            <div key={item.id} className="flex items-center">
              {index > 0 && <span className="mx-2 text-muted-foreground">/</span>}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => setCurrentFolder(item.id)}
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
              {getCurrentItems().map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.type === 'folder' ? (
                        <Button
                          variant="ghost"
                          className="p-0 h-auto"
                          onClick={() => setCurrentFolder(item.id)}
                        >
                          <span className="text-lg mr-2">📁</span>
                          <span className="hover:underline">{item.name}</span>
                        </Button>
                      ) : (
                        <Button variant="ghost" className="p-0 h-auto" asChild>
                          <a href="#">
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
