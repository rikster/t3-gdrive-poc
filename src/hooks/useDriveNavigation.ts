"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useDrive } from "~/contexts/DriveContext";
import type { DriveItem, BreadcrumbItem } from "~/types/drive";
import type { ServiceType } from "~/types/services";

export function useDriveNavigation() {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useDrive();

  // Navigation state
  const [currentFolder, setCurrentFolder] = useState<string>("root");
  const [currentFolderService, setCurrentFolderService] =
    useState<ServiceType | null>(null);
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState<BreadcrumbItem[]>([]);

  // Update URL with current folder state
  const updateURL = (folder: DriveItem) => {
    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set("folderId", folder.id);
      if (folder.service) params.set("service", folder.service);
      if (folder.accountId) params.set("accountId", folder.accountId);

      // Use history API directly to avoid RSC navigation issues
      const newUrl = `/?${params.toString()}`;
      window.history.pushState({}, "", newUrl);
    } catch (error) {
      console.error("Failed to update URL:", error);
    }
  };

  // Handle folder navigation
  const handleFolderClick = (folder: DriveItem) => {
    // Skip if we're already on this folder
    if (folder.id === currentFolder) {
      return;
    }

    if (folder.service) {
      setCurrentFolderService(folder.service as ServiceType);
      setCurrentAccountId(folder.accountId ?? null);
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
          service: folder.service as ServiceType | undefined,
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
            service: folder.service as ServiceType | undefined,
            accountId: folder.accountId,
          },
        ]);
      }
    }
  };

  // Navigate to root
  const navigateToRoot = () => {
    // Skip if we're already at root to prevent infinite loops
    if (currentFolder === "root") {
      return;
    }

    // Update state directly without triggering additional effects
    setCurrentFolder("root");
    setCurrentFolderService(null);
    setCurrentAccountId(null);
    setBreadcrumbPath([]);

    // Update URL without using handleFolderClick to avoid potential circular dependencies
    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set("folderId", "root");
      params.delete("service");
      params.delete("accountId");

      const newUrl = `/?${params.toString()}`;
      window.history.pushState({}, "", newUrl);
    } catch (error) {
      console.error("Failed to update URL in navigateToRoot:", error);
    }
  };

  // Handle URL-based navigation - only run on initial mount and when searchParams changes
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    const folderId = searchParams.get("folderId");
    const service = searchParams.get("service");
    const accountId = searchParams.get("accountId");

    if (folderId && (isInitialMountRef.current || folderId !== currentFolder)) {
      // After first run, set isInitialMount to false
      isInitialMountRef.current = false;
      const folderItem: DriveItem = {
        id: folderId,
        name: "", // This will be updated when folder contents are fetched
        type: "folder",
        modifiedAt: "",
        parentId: null,
        service: (service as ServiceType) ?? undefined,
        accountId: accountId ?? undefined,
      };

      // Update state without calling updateURL to avoid infinite loop
      if (folderItem.service) {
        setCurrentFolderService(folderItem.service as ServiceType);
        setCurrentAccountId(folderItem.accountId ?? null);
      }
      setCurrentFolder(folderItem.id);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Use a ref to track previous authentication state
  const prevAuthRef = useRef(isAuthenticated);

  // Reset navigation state on logout
  useEffect(() => {
    // Only run this effect when authentication state changes from true to false
    const wasAuthenticated = prevAuthRef.current;
    const isNowAuthenticated = isAuthenticated;

    // Update the ref for next time
    prevAuthRef.current = isNowAuthenticated;

    // Only perform actions when transitioning from authenticated to not authenticated
    if (wasAuthenticated && !isNowAuthenticated) {
      // Use direct state updates instead of navigateToRoot to avoid circular dependencies
      setCurrentFolder("root");
      setCurrentFolderService(null);
      setCurrentAccountId(null);
      setBreadcrumbPath([]);

      // Update URL directly
      try {
        window.history.pushState({}, "", "/");
      } catch (error) {
        console.error("Failed to update URL during logout:", error);
      }
    }
  }, [isAuthenticated]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      // Get the current URL parameters
      const url = new URL(window.location.href);
      const folderId = url.searchParams.get("folderId") ?? "root";
      const service = url.searchParams.get("service");
      const accountId = url.searchParams.get("accountId");

      // Update state without calling updateURL
      if (folderId !== currentFolder) {
        if (service) {
          setCurrentFolderService(service as ServiceType);
          setCurrentAccountId(accountId ?? null);
        }
        setCurrentFolder(folderId);
      }
    };

    // Add event listener
    window.addEventListener("popstate", handlePopState);

    // Clean up
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
