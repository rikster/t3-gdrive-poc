import { clearTokens } from '~/lib/session';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const service = searchParams.get('service');
  
  if (service === 'google' || service === 'onedrive') {
    clearTokens(service);
  } else {
    // No specific service mentioned, clear all tokens
    clearTokens();
  }
  
  return Response.json({ success: true });
}
