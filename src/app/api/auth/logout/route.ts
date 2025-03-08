import { clearTokens } from '~/lib/session';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const service = searchParams.get('service');
  
  if (service === 'google' || service === 'onedrive' || service === 'dropbox') {
    await clearTokens(service);
  } else {
    // No specific service mentioned, clear all tokens
    await clearTokens();
  }
  
  return Response.json({ success: true });
}
