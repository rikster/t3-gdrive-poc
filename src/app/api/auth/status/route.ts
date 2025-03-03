import { type NextRequest } from 'next/server';
import { getStoredTokens } from '~/lib/session';

export async function GET(request: NextRequest) {
  const tokens = getStoredTokens();
  
  return Response.json({
    isAuthenticated: !!tokens,
    service: tokens ? 'google' : null
  });
}
