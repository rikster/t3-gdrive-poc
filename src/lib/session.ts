import { cookies } from 'next/headers';

export interface TokenData {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export type ServiceType = 'google' | 'onedrive' | 'dropbox';

// Make sure to return the result directly without intermediate variables
export async function getStoredTokens(service: ServiceType = 'google'): Promise<TokenData | null> {
  const cookieStore = await cookies();
  const tokenCookie = await cookieStore.get(`${service}_tokens`);
  if (!tokenCookie) return null;

  try {
    return JSON.parse(tokenCookie.value);
  } catch {
    return null;
  }
}

export async function storeTokens(tokens: TokenData, service: ServiceType = 'google'): Promise<void> {
  const cookieStore = await cookies();
  await cookieStore.set(`${service}_tokens`, JSON.stringify(tokens), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function getActiveServices(): Promise<ServiceType[]> {
  const activeServices: ServiceType[] = [];
  const cookieStore = await cookies();
  
  const googleTokens = await cookieStore.get('google_tokens');
  const onedriveTokens = await cookieStore.get('onedrive_tokens');
  const dropboxTokens = await cookieStore.get('dropbox_tokens');

  if (googleTokens) activeServices.push('google');
  if (onedriveTokens) activeServices.push('onedrive');
  if (dropboxTokens) activeServices.push('dropbox');

  return activeServices;
}

// Kept for backward compatibility
export async function getActiveService(): Promise<ServiceType | null> {
  const services = await getActiveServices();
  return services.length > 0 ? services[0] : null;
}

export async function clearTokens(service?: ServiceType): Promise<void> {
  const cookieStore = await cookies();
  if (!service) {
    // Clear all service tokens
    await cookieStore.delete('google_tokens');
    await cookieStore.delete('onedrive_tokens');
    await cookieStore.delete('dropbox_tokens');
  } else {
    // Clear only specified service token
    await cookieStore.delete(`${service}_tokens`);
  }
}

export async function updateExpiryDate(
  tokens: TokenData,
  service: ServiceType = 'google'
): Promise<void> {
  // Set expiry date to current time + token_expires_in
  const updatedTokens = {
    ...tokens,
    expiry_date: Date.now() + 3600 * 1000, // 1 hour from now
  };

  // Store updated tokens
  await storeTokens(updatedTokens, service);
}
