import { cookies } from 'next/headers';

export interface TokenData {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export type ServiceType = 'google' | 'onedrive';

export async function getStoredTokens(service: ServiceType = 'google'): Promise<TokenData | null> {
  const cookieStore = cookies();
  const tokenCookie = await cookieStore.get(`${service}_tokens`);
  if (!tokenCookie) return null;
  
  try {
    return JSON.parse(tokenCookie.value);
  } catch {
    return null;
  }
}

export async function storeTokens(tokens: TokenData, service: ServiceType = 'google'): Promise<void> {
  const cookieStore = cookies();
  await cookieStore.set(`${service}_tokens`, JSON.stringify(tokens), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function getActiveService(): Promise<ServiceType | null> {
  const cookieStore = cookies();
  
  // Check if any service tokens exist
  const googleTokens = await cookieStore.get('google_tokens');
  const onedriveTokens = await cookieStore.get('onedrive_tokens');
  
  if (googleTokens) return 'google';
  if (onedriveTokens) return 'onedrive';
  
  return null;
}

export async function clearTokens(service?: ServiceType): Promise<void> {
  const cookieStore = cookies();
  
  if (!service) {
    // Clear all service tokens
    await cookieStore.delete('google_tokens');
    await cookieStore.delete('onedrive_tokens');
  } else {
    // Clear only specified service token
    await cookieStore.delete(`${service}_tokens`);
  }
}
