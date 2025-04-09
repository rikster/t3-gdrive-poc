"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { FileIcon, FolderIcon, InfoIcon } from "lucide-react";
import type { DriveItemUnion } from "~/types/drive";
import { isFileItem, isFolderItem } from "~/types/items";

interface ItemTypeExampleProps {
  item: DriveItemUnion;
}

/**
 * Example component that demonstrates using the discriminated union types
 */
export function ItemTypeExample({ item }: ItemTypeExampleProps) {
  const [details, setDetails] = useState<string | null>(null);

  // This function demonstrates type narrowing with discriminated unions
  const showItemDetails = () => {
    if (isFileItem(item)) {
      // TypeScript knows this is a FileItem
      setDetails(
        `File: ${item.name}
Size: ${item.size || "Unknown"}
Modified: ${new Date(item.modifiedAt).toLocaleString()}
${item.mimeType ? `Type: ${item.mimeType}` : ""}
${item.webViewLink ? `View Link: ${item.webViewLink}` : ""}`
      );
    } else if (isFolderItem(item)) {
      // TypeScript knows this is a FolderItem
      setDetails(
        `Folder: ${item.name}
Modified: ${new Date(item.modifiedAt).toLocaleString()}
${item.childCount !== undefined ? `Contains: ${item.childCount} items` : ""}
${item.isShared ? "Shared: Yes" : ""}`
      );
    }
  };

  return (
    <div className="rounded-md border p-4">
      <div className="flex items-center gap-2">
        {isFileItem(item) ? (
          <FileIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <FolderIcon className="h-5 w-5 text-blue-500" />
        )}
        <span className="font-medium">{item.name}</span>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={showItemDetails}
        >
          <InfoIcon className="h-4 w-4" />
        </Button>
      </div>
      
      {details && (
        <div className="mt-2 rounded bg-gray-100 p-2 text-sm dark:bg-gray-800">
          <pre className="whitespace-pre-wrap">{details}</pre>
        </div>
      )}
      
      {/* Type-specific UI elements */}
      {isFileItem(item) && (
        <div className="mt-2 text-sm text-gray-500">
          {item.size && <span className="mr-2">{item.size}</span>}
          {item.downloadUrl && (
            <Button variant="outline" size="sm" className="ml-auto">
              Download
            </Button>
          )}
        </div>
      )}
      
      {isFolderItem(item) && (
        <div className="mt-2 text-sm text-gray-500">
          {item.childCount !== undefined && (
            <span>{item.childCount} items</span>
          )}
          {item.isShared && (
            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-100">
              Shared
            </span>
          )}
        </div>
      )}
    </div>
  );
}
