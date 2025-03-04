import { type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { type ServiceType } from '~/lib/session';

export async function GET(request: NextRequest) {
  // Check cookies for all active services
  const cookieStore = cookies();
  const googleTokens = await cookieStore.get('google_tokens');
  const onedriveTokens = await cookieStore.get('onedrive_tokens');
  
  const activeServices: ServiceType[] = [];
  
  if (googleTokens) {
    activeServices.push('google');
  }
  
  if (onedriveTokens) {
    activeServices.push('onedrive');
  }
  
  // For backward compatibility
  const primaryService = activeServices.length > 0 ? activeServices[0] : null;
  
  return Response.json({
    isAuthenticated: activeServices.length > 0,
    service: primaryService,
    activeServices: activeServices
  });
}
