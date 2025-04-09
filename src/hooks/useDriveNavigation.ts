"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDrive } from "~/contexts/DriveContext";

// Add explicit export
export interface DriveItem {
  id: string;
  name: string;
  type: "file" | "folder";
  modifiedAt: string;
  parentId: string | null;
  service?: string;
  accountId?: string;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
  service?: string;
  accountId?: string;
}

export function useDriveNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useDrive();

  // Navigation state
  const [currentFolder, setCurrentFolder] = useState<string>("root");
  const [currentFolderService, setCurrentFolderService] = useState<
    string | null
  >(null);
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState<BreadcrumbItem[]>([]);

  // Update URL with current folder state
  const updateURL = (folder: DriveItem) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("folderId", folder.id);
    if (folder.service) params.set("service", folder.service);
    if (folder.accountId) params.set("accountId", folder.accountId);
    router.push(`/?${params.toString()}`);
  };

  // Handle folder navigation
  const handleFolderClick = (folder: DriveItem) => {
    if (folder.service) {
      setCurrentFolderService(folder.service);
      setCurrentAccountId(folder.accountId || null);
    }

    setCurrentFolder(folder.id);
    updateURL(folder);

    // Update breadcrumb path
    if (folder.id === "root") {
      setBreadcrumbPath([]);
    } else if (folder.parentId === "root" || folder.parentId === null) {
      setBreadcrumbPath([
        {
          id: folder.id,
          name: folder.name,
          service: folder.service,
          accountId: folder.accountId,
        },
      ]);
    } else {
      const existingIndex = breadcrumbPath.findIndex(
        (item) => item.id === folder.id,
      );

      if (existingIndex >= 0) {
        setBreadcrumbPath(breadcrumbPath.slice(0, existingIndex + 1));
      } else {
        setBreadcrumbPath([
          ...breadcrumbPath,
          {
            id: folder.id,
            name: folder.name,
            service: folder.service,
            accountId: folder.accountId,
          },
        ]);
      }
    }
  };

  // Navigate to root
  const navigateToRoot = () => {
    const rootFolder: DriveItem = {
      id: "root",
      name: "Home",
      type: "folder",
      modifiedAt: "",
      parentId: null,
    };
    handleFolderClick(rootFolder);
  };

  // Handle URL-based navigation
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

      if (folderItem.service) {
        setCurrentFolderService(folderItem.service);
        setCurrentAccountId(folderItem.accountId || null);
      }
      setCurrentFolder(folderItem.id);
    }
  }, [searchParams]);

  // Reset navigation state on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentFolder("root");
      setCurrentFolderService(null);
      setCurrentAccountId(null);
      setBreadcrumbPath([]);
    }
  }, [isAuthenticated]);

  return {
    currentFolder,
    currentFolderService,
    currentAccountId,
    breadcrumbPath,
    handleFolderClick,
    navigateToRoot,
    updateURL,
  };
}
