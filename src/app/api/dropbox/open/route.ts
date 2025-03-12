import { type NextRequest } from 'next/server';
import { getStoredTokens, clearTokens } from '~/lib/session';
import { env } from '~/env';

// Dropbox API endpoints
const AUTH_ENDPOINT = 'https://www.dropbox.com/oauth2/authorize';
const TEMPORARY_LINK_ENDPOINT = 'https://api.dropboxapi.com/2/files/get_temporary_link';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fileId = searchParams.get('fileId');
  
  if (!fileId) {
    return Response.json({ error: 'File ID is required' }, { status: 400 });
  }

  const storedTokens = await getStoredTokens('dropbox');
  
  if (!storedTokens) {
    return Response.json({ error: 'Not authenticated with Dropbox' }, { status: 401 });
  }

  try {
    // Call Dropbox API to get a temporary link to the file
    const response = await fetch(TEMPORARY_LINK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${storedTokens.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: fileId
      }),
    });

    // Handle non-OK responses
    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Dropbox API error details:', errorData);
        
        // Check for invalid_access_token error which indicates we need to re-authenticate
        if (errorData?.error?.path?.['.tag'] === 'invalid_access_token') {
          console.log('Invalid access token, clearing tokens');
          await clearTokens('dropbox');
          return Response.json({ 
            error: 'Authentication expired, please reconnect to Dropbox',
            needsReauth: true
          }, { status: 401 });
        }
        
        errorMessage = JSON.stringify(errorData);
      } catch (e) {
        const errorText = await response.text();
        console.error('Dropbox API error text:', errorText);
        errorMessage = errorText;
      }
      return Response.json({ error: `Failed to get file link: ${errorMessage}` }, { status: 500 });
    }

    const data = await response.json();
    
    if (!data.link) {
      return Response.json({ error: 'No link returned from Dropbox' }, { status: 500 });
    }
    
    // Return the temporary link to the file
    return Response.json({ url: data.link });
  } catch (error) {
    console.error('Error opening Dropbox file:', error);
    return Response.json({ error: 'Failed to open file' }, { status: 500 });
  }
}
