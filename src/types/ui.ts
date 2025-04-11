/**
 * UI-related type definitions
 */

/**
 * Props for the DriveUI component
 */
export interface DriveUIProps {
  items?: DriveItem[];
  loading?: boolean;
  error?: string | null;
}

// Import types to avoid circular dependencies
import type { DriveItem } from "./drive";
import type { ServiceType } from "./services";

/**
 * Props for the DriveItemRow component
 */
export interface DriveItemRowProps {
  item: DriveItem;
  serviceAccounts: Record<
    string,
    Array<{
      id: string;
      service: ServiceType;
      name?: string;
      email?: string;
    }>
  >;
  isRecursiveSearch: boolean;
  clearSearch: () => void;
  handleFolderClick: (folder: DriveItem) => void;
  openFile: (fileId: string, service: ServiceType, accountId: string) => void;
}

/**
 * Props for the LoadingSpinner component
 */
export interface LoadingSpinnerProps {
  containerClassName?: string;
  spinnerSize?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}
