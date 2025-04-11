"use client";

import { useEffect, useState, useRef } from "react";

import { useDrive } from "~/contexts/DriveContext";
import { useDriveItems } from "~/hooks/useDriveItems";
import { useDriveNavigation } from "~/hooks/useDriveNavigation";

import type { DriveItem } from "~/types/drive";
import type { ServiceAccount } from "~/types/services";
import type { DriveUIProps } from "~/types/ui";

import { DriveBreadcrumb } from "./DriveBreadcrumb";
import { DriveTable } from "./DriveTable";
import { Header } from "./Header";

export function DriveUI({
  items: initialItems,
  loading: initialLoading,
  error: initialError,
}: DriveUIProps = {}) {
  const {
    isAuthenticated,
    authenticateService,
    addNewAccount,
    disconnectService,
    disconnectAccount,
    activeServices,
    serviceAccounts,
    isAuthenticating,
    searchQuery,
    setSearchQuery,
    isSearching,
    performSearch,
    clearSearch,
    isRecursiveSearch,
    openFile,
  } = useDrive();

  // Use the new hook for drive items
  const { filteredItems, isLoading, error, fetchFiles } = useDriveItems(
    initialItems,
    initialLoading,
    initialError,
  );

  const [searchInputValue, setSearchInputValue] = useState("");

  // Add the navigation hook
  const {
    currentFolder,
    currentFolderService,
    currentAccountId,
    breadcrumbPath,
    handleFolderClick,
    navigateToRoot,
  } = useDriveNavigation();

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
      navigateToRoot();
    }

    disconnectService(serviceId);
  };

  const handleDisconnectAccount = (serviceId: string, accountId: string) => {
    // If we're currently viewing a folder from this account, go back to root
    if (currentFolderService === serviceId && currentAccountId === accountId) {
      navigateToRoot();
    }

    disconnectAccount(serviceId, accountId);
  };

  // Handle search input changes
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target?.value || "";
    setSearchInputValue(value);

    // For instant filtering of current folder contents
    if (value.trim() === "") {
      clearSearch();
    } else {
      setSearchQuery(value);
    }
  };

  // Handle search submission (for recursive search)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInputValue?.trim()) {
      void performSearch(searchInputValue);
    }
  };

  // Clear search when navigating to a different folder
  useEffect(() => {
    if (searchQuery && !isRecursiveSearch) {
      clearSearch();
      setSearchInputValue("");
    }
    // Note: We removed the navigateToRoot call here as it was causing an infinite loop
  }, [currentFolder, searchQuery, isRecursiveSearch, clearSearch]);

  // Use a ref to track previous authentication state
  const prevAuthRef = useRef(isAuthenticated);

  // Clear search input and reset search when logging out
  useEffect(() => {
    // Only run this effect when authentication state changes from true to false
    const wasAuthenticated = prevAuthRef.current;
    const isNowAuthenticated = isAuthenticated;

    // Update the ref for next time
    prevAuthRef.current = isNowAuthenticated;

    // Only perform actions when transitioning from authenticated to not authenticated
    if (wasAuthenticated && !isNowAuthenticated) {
      setSearchInputValue("");
      clearSearch();

      // Only navigate to root if we're not already there
      if (currentFolder !== "root") {
        // Use setTimeout to break the potential render cycle
        setTimeout(() => {
          navigateToRoot();
        }, 0);
      }
    }
  }, [isAuthenticated, clearSearch, navigateToRoot, currentFolder]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-black dark:bg-gray-950 dark:text-white">
      <div className="flex-none p-4 sm:p-6">
        {/* Header */}
        <Header
          isAuthenticated={isAuthenticated}
          activeServices={activeServices}
          serviceAccounts={serviceAccounts}
          searchInputValue={searchInputValue}
          onSearchInputChange={handleSearchInputChange}
          onSearchSubmit={handleSearchSubmit}
          onUpload={handleUpload}
          onDisconnectService={handleDisconnectService}
          onDisconnectAccount={handleDisconnectAccount}
          onServiceSelect={handleServiceSelect}
          onAddAccount={handleAddAccount}
          isAuthenticating={isAuthenticating}
        />

        <div className="mx-auto max-w-6xl">
          {/* Breadcrumb navigation */}
          <DriveBreadcrumb
            items={breadcrumbPath}
            currentFolder={currentFolder}
            onNavigate={(item) => {
              const folderItem: DriveItem = {
                id: item.id,
                name: item.name,
                type: "folder",
                modifiedAt: "",
                parentId: null,
                service: item.service,
                accountId: item.accountId,
              };
              handleFolderClick(folderItem);
            }}
            className="mb-4"
          />
          <div className="overflow-hidden rounded-lg border bg-white dark:border-gray-800 dark:bg-gray-950">
            <DriveTable
              items={filteredItems}
              isLoading={isLoading || isAuthenticating || isSearching}
              error={error}
              onRetry={() => void fetchFiles(currentFolder)}
              serviceAccounts={(serviceAccounts as unknown) as { [key: string]: ServiceAccount[] } ?? {}}
              isRecursiveSearch={isRecursiveSearch}
              clearSearch={() => {
                clearSearch();
                setSearchInputValue("");
              }}
              handleFolderClick={handleFolderClick}
              openFile={openFile}
              searchQuery={searchQuery}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
