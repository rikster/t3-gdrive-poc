/**
 * Service-related type definitions
 */

/**
 * Supported cloud storage service types
 */
export type ServiceType = "google" | "onedrive" | "dropbox";

/**
 * Represents a connected cloud storage service account
 */
export interface ServiceAccount {
  id: string; // Unique identifier for the account
  service: ServiceType;
  name?: string; // Display name for the account (e.g., "Work Google Drive")
  email?: string; // User's email for this account
}

/**
 * Represents a cloud storage service that can be added
 */
export interface Service {
  id: string;
  name: string;
  icon?: React.ReactNode;
}
