/**
 * Drive-related type definitions
 */

import {
  DriveItemUnion,
  FileItem,
  FolderItem,
  isFileItem,
  isFolderItem,
} from "./items";

/**
 * Represents an item (file or folder) in a cloud storage service
 * @deprecated Use DriveItemUnion from './items' instead
 */
export interface DriveItem {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: string;
  modifiedAt: string;
  parentId: string | null;
  service?: string;
  accountId?: string;
  accountName?: string;
  accountEmail?: string;
  path?: string; // Path to the file/folder for context
}

// Re-export the new item types for easier imports
export { DriveItemUnion, FileItem, FolderItem, isFileItem, isFolderItem };

/**
 * Represents an item in the breadcrumb navigation path
 */
export interface BreadcrumbItem {
  id: string;
  name: string;
  service?: string;
  accountId?: string;
}

/**
 * Represents a search result from any cloud storage service
 * @deprecated Use DriveItemUnion from './items' instead
 */
export interface SearchResult {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: string;
  modifiedAt: string;
  parentId: string | null;
  service: string;
  accountId: string;
  accountName?: string;
  accountEmail?: string;
  path?: string; // Path to the file/folder for context
}
