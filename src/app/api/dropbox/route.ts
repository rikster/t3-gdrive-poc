import { type NextRequest } from 'next/server';
import { env } from '~/env';
import { getStoredTokens, storeTokens, clearTokens } from '~/lib/session';

// Dropbox API endpoints
const AUTH_ENDPOINT = 'https://www.dropbox.com/oauth2/authorize';
const TOKEN_ENDPOINT = 'https://api.dropboxapi.com/oauth2/token';
const FILES_LIST_ENDPOINT = 'https://api.dropboxapi.com/2/files/list_folder';

// The scopes required for accessing Dropbox files - Dropbox uses space-separated scopes
const SCOPES = 'files.metadata.read files.content.read';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const storedTokens = await getStoredTokens('dropbox');
  const folderId = searchParams.get('folderId') || '';

  // If we have stored tokens, use them
  if (storedTokens && !code) {
    try {
      return await listFiles(storedTokens, folderId);
    } catch (error) {
      console.error('Error with stored tokens:', error);
      // If there's an error with stored tokens, clear them and proceed with new auth
      await clearTokens('dropbox');
    }
  }

  // If no code is provided, redirect to auth
  if (!code) {
    // Dropbox OAuth URL
    const authUrl = `${AUTH_ENDPOINT}?client_id=${env.DROPBOX_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(env.DROPBOX_REDIRECT_URI)}&token_access_type=offline`;
    console.log('Redirecting to Dropbox auth URL:', authUrl);
    return Response.json({ url: authUrl });
  }

  try {
    console.log('Received code from Dropbox, exchanging for token...');
    // Exchange code for tokens
    const tokenResponse = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: env.DROPBOX_CLIENT_ID,
        client_secret: env.DROPBOX_CLIENT_SECRET,
        code,
        redirect_uri: env.DROPBOX_REDIRECT_URI,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token error response:', errorText);
      throw new Error(`Failed to get token: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Received token data from Dropbox');
    
    // Format token data to match our TokenData interface
    const tokens = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || '', // Dropbox might not always return a refresh token
      scope: tokenData.scope || SCOPES,
      token_type: tokenData.token_type,
      expiry_date: Date.now() + ((tokenData.expires_in || 14400) * 1000), // Default to 4 hours if not provided
    };
    
    // Store tokens for future use
    await storeTokens(tokens, 'dropbox');
    console.log('Stored Dropbox tokens');

    // Redirect to main page after successful authentication
    return Response.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Error in Dropbox authentication:', error);
    return Response.json({ error: 'Failed to authenticate with Dropbox' }, { status: 500 });
  }
}

async function listFiles(tokens: any, folderId: string) {
  try {
    // For Dropbox API, the root folder must be specified as "" (empty string)
    // Any other folder must be specified with its full path
    let path = '';
    if (folderId && folderId !== 'root') {
      path = folderId;
    }
    
    console.log('Listing Dropbox files for path:', path);
    
    // Call Dropbox API to list files
    const response = await fetch(FILES_LIST_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path,
        recursive: false,
        include_media_info: false,
        include_deleted: false,
        include_has_explicit_shared_members: false,
        include_mounted_folders: true,
      }),
    });

    // For debugging
    console.log('Dropbox API response status:', response.status);
    
    // Handle non-OK responses
    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Dropbox API error details:', errorData);
        
        // Check for invalid_access_token error which indicates we need to re-authenticate
        if (errorData?.error?.path?.['.tag'] === 'invalid_access_token') {
          console.log('Invalid access token, clearing tokens and redirecting to auth');
          await clearTokens('dropbox');
          return Response.json({ url: `${AUTH_ENDPOINT}?client_id=${env.DROPBOX_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(env.DROPBOX_REDIRECT_URI)}&token_access_type=offline` });
        }
        
        errorMessage = JSON.stringify(errorData);
      } catch (e) {
        const errorText = await response.text();
        console.error('Dropbox API error text:', errorText);
        errorMessage = errorText;
      }
      throw new Error(`Dropbox API error: ${errorMessage}`);
    }

    const data = await response.json();
    console.log('Dropbox entries count:', data.entries?.length || 0);
    
    // Transform Dropbox entries to match our unified format
    const files = (data.entries || []).map((entry: any) => {
      return {
        id: entry.path_lower || entry.id,
        name: entry.name,
        type: entry['.tag'] === 'folder' ? 'folder' : 'file',
        size: entry.size ? `${Math.round(entry.size / 1024)} KB` : undefined,
        modifiedAt: entry.server_modified ? new Date(entry.server_modified).toLocaleDateString() : '',
        parentId: path === '' ? null : path,
        service: 'dropbox',
      };
    });

    // Sort files (folders first, then alphabetically)
    const sortedFiles = files.sort((a: any, b: any) => {
      // First sort by type (folders first)
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      
      // Then sort alphabetically by name
      return a.name.localeCompare(b.name);
    });

    return Response.json({ files: sortedFiles });
  } catch (error) {
    console.error('Error listing Dropbox files:', error);
    // Even on error, return an empty files array rather than undefined
    return Response.json({ files: [], error: 'Failed to list Dropbox files' }, { status: 500 });
  }
}
