/**
 * Utility functions for working with drive items
 */

import type { DriveItem, SearchResult } from "~/types/drive";
import {
  DriveItemUnion,
  FileItem,
  FolderItem,
  createFileItem,
  createFolderItem,
} from "~/types/items";

/**
 * Converts a legacy DriveItem to the new DriveItemUnion type
 * @param item The legacy DriveItem to convert
 * @returns A properly typed DriveItemUnion
 */
export function convertToUnionType(item: DriveItem): DriveItemUnion {
  if (item.type === "file") {
    return createFileItem({
      id: item.id,
      name: item.name,
      modifiedAt: item.modifiedAt,
      parentId: item.parentId,
      service: item.service,
      accountId: item.accountId,
      accountName: item.accountName,
      accountEmail: item.accountEmail,
      path: item.path,
      size: item.size,
    });
  } else {
    return createFolderItem({
      id: item.id,
      name: item.name,
      modifiedAt: item.modifiedAt,
      parentId: item.parentId,
      service: item.service,
      accountId: item.accountId,
      accountName: item.accountName,
      accountEmail: item.accountEmail,
      path: item.path,
    });
  }
}

/**
 * Converts a DriveItemUnion to a legacy DriveItem
 * @param item The DriveItemUnion to convert
 * @returns A legacy DriveItem
 */
export function convertToLegacyItem(item: DriveItemUnion): DriveItem {
  return {
    id: item.id,
    name: item.name,
    type: item.type,
    modifiedAt: item.modifiedAt,
    parentId: item.parentId,
    service: item.service,
    accountId: item.accountId,
    accountName: item.accountName,
    accountEmail: item.accountEmail,
    path: item.path,
    size: "size" in item ? item.size : undefined,
  };
}

/**
 * Converts a SearchResult to a DriveItemUnion
 * @param result The SearchResult to convert
 * @returns A properly typed DriveItemUnion
 */
export function convertSearchResultToUnion(result: SearchResult): DriveItemUnion {
  if (result.type === "file") {
    return createFileItem({
      id: result.id,
      name: result.name,
      modifiedAt: result.modifiedAt,
      parentId: result.parentId,
      service: result.service,
      accountId: result.accountId,
      accountName: result.accountName,
      accountEmail: result.accountEmail,
      path: result.path,
      size: result.size,
    });
  } else {
    return createFolderItem({
      id: result.id,
      name: result.name,
      modifiedAt: result.modifiedAt,
      parentId: result.parentId,
      service: result.service,
      accountId: result.accountId,
      accountName: result.accountName,
      accountEmail: result.accountEmail,
      path: result.path,
    });
  }
}

/**
 * Batch converts an array of legacy DriveItems to DriveItemUnion types
 * @param items Array of legacy DriveItems
 * @returns Array of properly typed DriveItemUnion objects
 */
export function convertItemsToUnion(items: DriveItem[]): DriveItemUnion[] {
  return items.map(convertToUnionType);
}

/**
 * Batch converts an array of DriveItemUnion to legacy DriveItems
 * @param items Array of DriveItemUnion objects
 * @returns Array of legacy DriveItem objects
 */
export function convertItemsToLegacy(items: DriveItemUnion[]): DriveItem[] {
  return items.map(convertToLegacyItem);
}
