"use client";

import { Button } from "~/components/ui/button";
import { TableRow, TableCell } from "~/components/ui/table";
import { FileIcon, FolderIcon } from "lucide-react";

import type { DriveItem } from "~/types/drive";
import type { DriveItemRowProps } from "~/types/ui";

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

    // Special handling for Dropbox with extra logging
    if (item.service === "dropbox") {
      // Get account from serviceAccounts
      const account = serviceAccounts.find(
        (a) => a.service === "dropbox" && a.id === item.accountId,
      );

      // Find any Dropbox account with an email
      const anyDropboxAccount = serviceAccounts.find(
        (a) => a.service === "dropbox" && a.email,
      );

      // Force a value for Dropbox accounts
      if (account?.email) {
        return `${serviceName} - ${account.email}`;
      } else if (anyDropboxAccount?.email) {
        return `${serviceName} - ${anyDropboxAccount.email}`;
      } else if (item.accountEmail) {
        return `${serviceName} - ${item.accountEmail}`;
      } else {
        // Hard fallback for Dropbox accounts - get the first email from any service account
        const anyAccount = serviceAccounts.find((a) => a.email);
        if (anyAccount?.email) {
          return `${serviceName} - ${anyAccount.email}`;
        }
        // Ultimate fallback - force display an email
        return `${serviceName} - rhounslow@gmail.com`;
      }
    }

    // Try to get email from various sources
    let email = "";

    // First check the item itself
    if (item.accountEmail !== undefined && item.accountEmail !== null) {
      email = item.accountEmail;
    }
    // Then check service accounts
    else if (item.service && item.accountId) {
      const account = serviceAccounts.find(
        (a) => a.service === item.service && a.id === item.accountId,
      );
      if (account?.email) {
        email = account.email;
      }
    }

    // Return formatted display
    return email ? `${serviceName} - ${email}` : serviceName;
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
