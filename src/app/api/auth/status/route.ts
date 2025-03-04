import { type NextRequest } from 'next/server';
import { getStoredTokens, getActiveService } from '~/lib/session';

export async function GET(request: NextRequest) {
  const activeService = await getActiveService();
  const tokens = activeService ? await getStoredTokens(activeService) : null;
  
  return Response.json({
    isAuthenticated: !!tokens,
    service: activeService
  });
}
