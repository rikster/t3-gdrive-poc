"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "~/components/ui/table";

import type { DriveItem } from "~/types/drive";
import type { ServiceAccount, ServiceType } from "~/types/services";

import { DriveErrorState } from "./DriveErrorState";
import { DriveItemRow } from "./DriveItemRow";
import { LoadingSpinner } from "./ui/loading-spinner";

interface DriveTableProps {
  items: DriveItem[];
  isLoading: boolean;
  error?: string | null;
  onRetry: () => void;
  serviceAccounts: { [key: string]: ServiceAccount[] };
  isRecursiveSearch: boolean;
  clearSearch: () => void;
  handleFolderClick: (item: DriveItem) => void;
  openFile: (fileId: string, service: ServiceType, accountId?: string) => void;
  searchQuery?: string;
}

export function DriveTable({
  items,
  isLoading,
  error,
  onRetry,
  serviceAccounts,
  isRecursiveSearch,
  clearSearch,
  handleFolderClick,
  openFile,
  searchQuery,
}: DriveTableProps) {
  if (error) {
    return <DriveErrorState error={error} onRetry={onRetry} />;
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="py-16">
          <LoadingSpinner />
          <p className="text-muted-foreground text-center">
            {isRecursiveSearch ? "Searching..." : "Loading files..."}
          </p>
        </div>
      )}
      {!isLoading && (
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
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center">
                  {searchQuery
                    ? `No files match "${searchQuery}"`
                    : "No files found in this folder"}
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <DriveItemRow
                  key={`${String(item.service ?? "")}-${String(item.accountId ?? "default")}-${String(item.id)}`}
                  item={item}
                  serviceAccounts={serviceAccounts}
                  isRecursiveSearch={isRecursiveSearch}
                  clearSearch={clearSearch}
                  handleFolderClick={handleFolderClick}
                  openFile={(fileId, service, accountId) =>
                    openFile(fileId, service, accountId)
                  }
                />
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
