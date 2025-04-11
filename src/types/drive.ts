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
import type { ServiceType } from "./services";

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
  service?: ServiceType;
  accountId?: string;
  accountName?: string;
  accountEmail?: string;
  path?: string; // Path to the file/folder for context
}

// Re-export the new item types for easier imports
export type { DriveItemUnion, FileItem, FolderItem };
export { isFileItem, isFolderItem };

/**
 * Represents an item in the breadcrumb navigation path
 */
export interface BreadcrumbItem {
  id: string;
  name: string;
  service?: ServiceType;
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
  service: ServiceType;
  accountId: string;
  accountName?: string;
  accountEmail?: string;
  path?: string; // Path to the file/folder for context
}
