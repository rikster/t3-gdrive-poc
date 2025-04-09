"use client";

import React, { createContext, useContext, ReactNode } from "react";
import type { BreadcrumbItem } from "~/types/drive";

export interface DriveNavigationContextType {
  currentFolder: string;
  currentFolderService: string | null;
  currentAccountId: string | null;
  breadcrumbPath: BreadcrumbItem[];
  navigateToFolder: (folderId: string, service?: string, accountId?: string) => void;
  navigateUp: () => void;
  navigateHome: () => void;
}

export const DriveNavigationContext = createContext<DriveNavigationContextType>({
  currentFolder: "root",
  currentFolderService: null,
  currentAccountId: null,
  breadcrumbPath: [],
  navigateToFolder: () => undefined,
  navigateUp: () => undefined,
  navigateHome: () => undefined,
});

export function DriveNavigationProvider({ children }: { children: ReactNode }) {
  // This is just a mock provider for testing purposes
  // The actual implementation would use the useDriveNavigation hook
  return (
    <DriveNavigationContext.Provider
      value={{
        currentFolder: "root",
        currentFolderService: null,
        currentAccountId: null,
        breadcrumbPath: [],
        navigateToFolder: () => undefined,
        navigateUp: () => undefined,
        navigateHome: () => undefined,
      }}
    >
      {children}
    </DriveNavigationContext.Provider>
  );
}

export function useDriveNavigation() {
  return useContext(DriveNavigationContext);
}
