/**
 * Drive-related type definitions
 */

/**
 * Represents an item (file or folder) in a cloud storage service
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
