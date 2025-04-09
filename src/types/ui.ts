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

// Import DriveItem to avoid circular dependencies
import type { DriveItem } from "./drive";

/**
 * Props for the DriveItemRow component
 */
export interface DriveItemRowProps {
  item: DriveItem;
  serviceAccounts: Array<{
    id: string;
    service: string;
    name?: string;
    email?: string;
  }>;
  isRecursiveSearch: boolean;
  clearSearch: () => void;
  handleFolderClick: (folder: DriveItem) => void;
  openFile: (fileId: string, service: string, accountId: string) => void;
}

/**
 * Props for the LoadingSpinner component
 */
export interface LoadingSpinnerProps {
  containerClassName?: string;
  spinnerSize?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}
