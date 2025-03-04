import { type NextRequest } from 'next/server';
import { env } from '~/env';
import { getStoredTokens, storeTokens } from '~/lib/session';
import { Client } from '@microsoft/microsoft-graph-client';

// Microsoft Graph endpoint and auth URLs
const MICROSOFT_ENDPOINT = 'https://graph.microsoft.com/v1.0';
const AUTH_ENDPOINT = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const TOKEN_ENDPOINT = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

// The scopes required for accessing OneDrive files
const SCOPES = [
  'files.read',
  'offline_access'
].join(' ');

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const storedTokens = getStoredTokens('onedrive');
  const folderId = searchParams.get('folderId') || 'root';

  // If we have stored tokens, use them
  if (storedTokens && !code) {
    try {
      return await listFiles(storedTokens, folderId);
    } catch (error) {
      console.error('Error with stored tokens:', error);
      // If there's an error with stored tokens, clear them and proceed with new auth
    }
  }

  // If no code is provided, redirect to auth
  if (!code) {
    const authUrl = `${AUTH_ENDPOINT}?client_id=${env.ONEDRIVE_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(env.ONEDRIVE_REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
    return Response.json({ url: authUrl });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: env.ONEDRIVE_CLIENT_ID,
        client_secret: env.ONEDRIVE_CLIENT_SECRET,
        code,
        redirect_uri: env.ONEDRIVE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }).toString(),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      throw new Error(`Failed to get token: ${tokenData.error_description || 'Unknown error'}`);
    }
    
    // Format token data to match our TokenData interface
    const tokens = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      scope: tokenData.scope,
      token_type: tokenData.token_type,
      expiry_date: Date.now() + (tokenData.expires_in * 1000),
    };
    
    // Store tokens for future use
    storeTokens(tokens, 'onedrive');

    // Redirect to main page after successful authentication
    return Response.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Failed to fetch OneDrive files' }, { status: 500 });
  }
}

async function listFiles(tokens: any, folderId: string) {
  try {
    const client = Client.init({
      authProvider: (done) => {
        done(null, tokens.access_token);
      }
    });

    let endpoint = '';
    
    if (folderId === 'root') {
      endpoint = `/me/drive/root/children`;
    } else {
      endpoint = `/me/drive/items/${folderId}/children`;
    }

    const response = await client.api(endpoint)
      .select('id,name,folder,file,size,lastModifiedDateTime')
      .orderby('folder desc,name')
      .get();

    const files = response.value.map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.folder ? 'folder' : 'file',
      size: item.size ? `${Math.round(item.size / 1024)} KB` : undefined,
      modifiedAt: new Date(item.lastModifiedDateTime).toLocaleDateString(),
      parentId: folderId === 'root' ? null : folderId,
    }));

    return Response.json({ files });
  } catch (error) {
    console.error('Error listing OneDrive files:', error);
    return Response.json({ error: 'Failed to list OneDrive files' }, { status: 500 });
  }
}
