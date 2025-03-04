import { cookies } from 'next/headers';

export interface TokenData {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export type ServiceType = 'google' | 'onedrive';

// Make sure to return the result directly without intermediate variables
export async function getStoredTokens(service: ServiceType = 'google'): Promise<TokenData | null> {
  const tokenCookie = await cookies().get(`${service}_tokens`);
  if (!tokenCookie) return null;

  try {
    return JSON.parse(tokenCookie.value);
  } catch {
    return null;
  }
}

export async function storeTokens(tokens: TokenData, service: ServiceType = 'google'): Promise<void> {
  await cookies().set(`${service}_tokens`, JSON.stringify(tokens), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export async function getActiveService(): Promise<ServiceType | null> {
  const googleTokens = await cookies().get('google_tokens');
  const onedriveTokens = await cookies().get('onedrive_tokens');

  if (googleTokens) return 'google';
  if (onedriveTokens) return 'onedrive';

  return null;
}

export async function clearTokens(service?: ServiceType): Promise<void> {
  if (!service) {
    // Clear all service tokens
    await cookies().delete('google_tokens');
    await cookies().delete('onedrive_tokens');
  } else {
    // Clear only specified service token
    await cookies().delete(`${service}_tokens`);
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
