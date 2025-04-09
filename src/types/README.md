# Type Definitions

This directory contains TypeScript type definitions used throughout the application.

## Drive Item Types

The application uses discriminated unions to represent different types of items in cloud storage services.

### Legacy Types

The original types are defined in `drive.ts`:

- `DriveItem`: Represents any item (file or folder) in a cloud storage service
- `BreadcrumbItem`: Represents an item in the breadcrumb navigation path
- `SearchResult`: Represents a search result from any cloud storage service

These types are now marked as deprecated and should be replaced with the new discriminated union types.

### New Discriminated Union Types

The new types are defined in `items.ts`:

- `BaseItem`: Base interface with common properties for all item types
- `FileItem`: File-specific item interface with file-specific properties
- `FolderItem`: Folder-specific item interface with folder-specific properties
- `DriveItemUnion`: Union type representing any type of drive item (FileItem | FolderItem)

### Type Guards

Type guards are provided to safely check item types:

- `isFileItem(item)`: Checks if an item is a file
- `isFolderItem(item)`: Checks if an item is a folder

### Helper Functions

Helper functions are provided to create properly typed items:

- `createFileItem(data)`: Creates a file item with the correct type
- `createFolderItem(data)`: Creates a folder item with the correct type

## Utility Functions

Utility functions for working with these types are available in `src/lib/item-utils.ts`:

- `convertToUnionType(item)`: Converts a legacy DriveItem to the new DriveItemUnion type
- `convertToLegacyItem(item)`: Converts a DriveItemUnion to a legacy DriveItem
- `convertSearchResultToUnion(result)`: Converts a SearchResult to a DriveItemUnion
- `convertItemsToUnion(items)`: Batch converts an array of legacy DriveItems to DriveItemUnion types
- `convertItemsToLegacy(items)`: Batch converts an array of DriveItemUnion to legacy DriveItems

## Usage Example

```tsx
import { DriveItemUnion, isFileItem, isFolderItem } from "~/types/drive";

function renderItem(item: DriveItemUnion) {
  if (isFileItem(item)) {
    // TypeScript knows this is a FileItem
    return <FileComponent size={item.size} mimeType={item.mimeType} />;
  } else if (isFolderItem(item)) {
    // TypeScript knows this is a FolderItem
    return <FolderComponent childCount={item.childCount} />;
  }
  
  // This should never happen due to exhaustive type checking
  return null;
}
```

See `src/components/examples/ItemTypeExample.tsx` for a complete example of using the discriminated union types.
