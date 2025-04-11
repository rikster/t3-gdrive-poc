"use client";

import { FileIcon, FolderIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { TableRow, TableCell } from "~/components/ui/table";

import type { DriveItem } from "~/types/drive";
import type { ServiceAccount, ServiceType } from "~/types/services";
import type { DriveItemRowProps } from "~/types/ui";

type ServiceAccounts = Record<ServiceType, ServiceAccount[]>;

export function DriveItemRow({
  item,
  serviceAccounts,
  isRecursiveSearch,
  clearSearch,
  handleFolderClick,
  openFile,
}: DriveItemRowProps) {
  // Display service name for files
  const getServiceName = (service?: string) => {
    if (!service) return "";

    switch (service) {
      case "google":
        return "Google Drive";
      case "onedrive":
        return "OneDrive";
      case "dropbox":
        return "Dropbox";
      case "box":
        return "Box";
      default:
        return service;
    }
  };

  // Function to get combined service and account display for table
  const getServiceAccountDisplay = (item: DriveItem) => {
    const serviceName = getServiceName(item.service);
    const service = item.service;

    const serviceAccounts_ = serviceAccounts as ServiceAccounts;
    if (!service || !serviceAccounts_[service]) {
      return serviceName;
    }

    // Get account from serviceAccounts
    const accounts = serviceAccounts_[service] ?? [];
    const account = accounts.find(
      (a: ServiceAccount) => a.id === item.accountId
    );

    // Find any account with an email
    const anyAccountWithEmail = accounts.find(
      (a: ServiceAccount) => a.email
    );

    if (account?.email) {
      return `${serviceName} - ${account.email}`;
    }

    // If no email found for this account but another account has one
    if (anyAccountWithEmail?.email) {
      return `${serviceName} - ${anyAccountWithEmail.email}`;
    }

    // If no email found at all
    return `${serviceName} - ${item.accountId ?? 'Unknown'}`;
  };



  return (
    <TableRow
      key={`${item.service}-${item.accountId ?? "default"}-${item.id}`}
      className="group hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <TableCell className="py-3">
        <div className="flex min-h-[32px] w-full items-start gap-2">
          {item.type === "folder" ? (
            <Button
              variant="ghost"
              className="flex h-auto w-full items-start justify-start p-0 text-left"
              onClick={() => {
                if (isRecursiveSearch) {
                  // Clear search when navigating to a folder from search results
                  clearSearch();
                }
                handleFolderClick(item);
              }}
            >
              <FolderIcon className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-blue-500" />
              <span className="whitespace-normal break-words hover:underline">
                {item.name}
              </span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="flex h-auto w-full items-start justify-start p-0 text-left"
              onClick={() => {
                if (item.service) {
                  openFile(item.id, item.service, item.accountId as string);
                }
              }}
            >
              <FileIcon className="mr-2 mt-1 h-5 w-5 flex-shrink-0 text-gray-500" />
              <span className="whitespace-normal break-words hover:underline">
                {item.name}
              </span>
            </Button>
          )}
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground text-right">
        {item.modifiedAt}
      </TableCell>
      <TableCell className="text-muted-foreground text-right">
        {item.size || "-"}
      </TableCell>
      <TableCell className="text-muted-foreground text-right">
        {getServiceAccountDisplay(item)}
      </TableCell>
    </TableRow>
  );
}
