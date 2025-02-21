import { cookies } from 'next/headers';

export interface TokenData {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date: number;
}

export function getStoredTokens(): TokenData | null {
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get('google_tokens');
  if (!tokenCookie) return null;
  
  try {
    return JSON.parse(tokenCookie.value);
  } catch {
    return null;
  }
}

export function storeTokens(tokens: TokenData): void {
  const cookieStore = cookies();
  cookieStore.set('google_tokens', JSON.stringify(tokens), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}
