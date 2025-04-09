/**
 * Authentication-related type definitions
 */

/**
 * Represents OAuth token data for a cloud storage service
 */
export interface TokenData {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}
