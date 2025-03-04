import { type NextRequest } from 'next/server';
import { getStoredTokens, getActiveService } from '~/lib/session';

export async function GET(request: NextRequest) {
  const activeService = getActiveService();
  const tokens = activeService ? getStoredTokens(activeService) : null;
  
  return Response.json({
    isAuthenticated: !!tokens,
    service: activeService
  });
}
