import { cookies } from 'next/headers';

export interface TokenData {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export type ServiceType = 'google' | 'onedrive';

export function getStoredTokens(service: ServiceType = 'google'): TokenData | null {
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get(`${service}_tokens`);
  if (!tokenCookie) return null;
  
  try {
    return JSON.parse(tokenCookie.value);
  } catch {
    return null;
  }
}

export function storeTokens(tokens: TokenData, service: ServiceType = 'google'): void {
  const cookieStore = cookies();
  cookieStore.set(`${service}_tokens`, JSON.stringify(tokens), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export function getActiveService(): ServiceType | null {
  const cookieStore = cookies();
  
  // Check if any service tokens exist
  if (cookieStore.get('google_tokens')) return 'google';
  if (cookieStore.get('onedrive_tokens')) return 'onedrive';
  
  return null;
}

export function clearTokens(service?: ServiceType): void {
  const cookieStore = cookies();
  
  if (!service) {
    // Clear all service tokens
    cookieStore.delete('google_tokens');
    cookieStore.delete('onedrive_tokens');
  } else {
    // Clear only specified service token
    cookieStore.delete(`${service}_tokens`);
  }
}
