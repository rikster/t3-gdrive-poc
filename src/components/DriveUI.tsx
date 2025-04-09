"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "~/components/ui/table";
import { Header } from "./Header";
import { DriveItemRow } from "./DriveItemRow";
import { useDrive } from "~/contexts/DriveContext";
import { LoadingSpinner } from "./ui/loading-spinner";
import { DriveBreadcrumb } from "./DriveBreadcrumb";
import { DriveErrorState } from "./DriveErrorState";
import { useDriveNavigation } from "~/hooks/useDriveNavigation";
import { useDriveItems } from "~/hooks/useDriveItems";

import type { DriveItem } from "~/types/drive";
import type { DriveUIProps } from "~/types/ui";

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

  // Clear search input and reset search when logging out
  useEffect(() => {
    if (!isAuthenticated) {
      setSearchInputValue("");
      clearSearch();
      navigateToRoot();
    }
  }, [isAuthenticated, clearSearch, navigateToRoot]);

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
            {error && typeof error === "string" && (
              <DriveErrorState
                error={error}
                onRetry={() => {
                  void fetchFiles(currentFolder);
                }}
              />
            )}
            <div className="relative">
              {isLoading || isAuthenticating || isSearching ? (
                <div className="py-16">
                  <LoadingSpinner />
                  <p className="text-muted-foreground text-center">
                    {isSearching ? "Searching..." : "Loading files..."}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-800">
                      <TableHead className="sticky top-0 w-[45%] bg-gray-50 dark:bg-gray-900">
                        Name
                      </TableHead>
                      <TableHead className="sticky top-0 w-[20%] bg-gray-50 text-right dark:bg-gray-900">
                        Modified
                      </TableHead>
                      <TableHead className="sticky top-0 w-[15%] bg-gray-50 text-right dark:bg-gray-900">
                        Size
                      </TableHead>
                      <TableHead className="sticky top-0 w-[20%] bg-gray-50 text-right dark:bg-gray-900">
                        Service & Account
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center">
                          {searchQuery
                            ? `No files match "${searchQuery}"`
                            : "No files found in this folder"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item) => (
                        <DriveItemRow
                          key={`${String(item.service ?? "")}-${String(item.accountId ?? "default")}-${String(item.id)}`}
                          item={item}
                          serviceAccounts={serviceAccounts}
                          isRecursiveSearch={isRecursiveSearch}
                          clearSearch={() => {
                            clearSearch();
                            setSearchInputValue("");
                          }}
                          handleFolderClick={handleFolderClick}
                          openFile={openFile}
                        />
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
