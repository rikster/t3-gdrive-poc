import { type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { type ServiceType } from '~/lib/session';

export async function GET(request: NextRequest) {
  // Directly check cookies here instead of using getActiveService
  const cookieStore = cookies();
  const googleTokens = cookieStore.get('google_tokens');
  const onedriveTokens = cookieStore.get('onedrive_tokens');
  
  let activeService: ServiceType | null = null;
  if (googleTokens) {
    activeService = 'google';
  } else if (onedriveTokens) {
    activeService = 'onedrive';
  }
  
  return Response.json({
    isAuthenticated: !!activeService,
    service: activeService
  });
}
