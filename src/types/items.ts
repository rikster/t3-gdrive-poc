/**
 * Item type definitions using discriminated unions
 */

/**
 * Base item interface with common properties for all item types
 */
export interface BaseItem {
  id: string;
  name: string;
  modifiedAt: string;
  parentId: string | null;
  service?: string;
  accountId?: string;
  accountName?: string;
  accountEmail?: string;
  path?: string; // Path to the item for context
}

/**
 * File-specific item interface
 */
export interface FileItem extends BaseItem {
  type: "file";
  size?: string;
  mimeType?: string;
  thumbnailUrl?: string;
  webViewLink?: string;
  downloadUrl?: string;
}

/**
 * Folder-specific item interface
 */
export interface FolderItem extends BaseItem {
  type: "folder";
  childCount?: number;
  isShared?: boolean;
}

/**
 * Union type representing any type of drive item
 */
export type DriveItemUnion = FileItem | FolderItem;

/**
 * Type guard to check if an item is a file
 * @param item The item to check
 * @returns True if the item is a file
 */
export function isFileItem(item: DriveItemUnion): item is FileItem {
  return item.type === "file";
}

/**
 * Type guard to check if an item is a folder
 * @param item The item to check
 * @returns True if the item is a folder
 */
export function isFolderItem(item: DriveItemUnion): item is FolderItem {
  return item.type === "folder";
}

/**
 * Helper function to create a file item
 * @param data Partial file item data
 * @returns A complete file item
 */
export function createFileItem(data: Partial<FileItem> & Pick<FileItem, "id" | "name">): FileItem {
  return {
    id: data.id,
    name: data.name,
    type: "file",
    modifiedAt: data.modifiedAt ?? new Date().toISOString(),
    parentId: data.parentId ?? null,
    service: data.service,
    accountId: data.accountId,
    accountName: data.accountName,
    accountEmail: data.accountEmail,
    path: data.path,
    size: data.size,
    mimeType: data.mimeType,
    thumbnailUrl: data.thumbnailUrl,
    webViewLink: data.webViewLink,
    downloadUrl: data.downloadUrl,
  };
}

/**
 * Helper function to create a folder item
 * @param data Partial folder item data
 * @returns A complete folder item
 */
export function createFolderItem(data: Partial<FolderItem> & Pick<FolderItem, "id" | "name">): FolderItem {
  return {
    id: data.id,
    name: data.name,
    type: "folder",
    modifiedAt: data.modifiedAt ?? new Date().toISOString(),
    parentId: data.parentId ?? null,
    service: data.service,
    accountId: data.accountId,
    accountName: data.accountName,
    accountEmail: data.accountEmail,
    path: data.path,
    childCount: data.childCount,
    isShared: data.isShared,
  };
}
