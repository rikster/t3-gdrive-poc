import { type NextRequest } from 'next/server';
import { getStoredTokens } from '~/lib/session';
import { Client } from '@microsoft/microsoft-graph-client';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fileId = searchParams.get('fileId');
  
  if (!fileId) {
    return Response.json({ error: 'File ID is required' }, { status: 400 });
  }

  const storedTokens = await getStoredTokens('onedrive');
  
  if (!storedTokens) {
    return Response.json({ error: 'Not authenticated with OneDrive' }, { status: 401 });
  }

  try {
    const client = Client.init({
      authProvider: (done) => {
        done(null, storedTokens.access_token);
      }
    });
    
    // Get the file metadata to get the webUrl
    const file = await client.api(`/me/drive/items/${fileId}`)
      .select('id,name,webUrl')
      .get();
    
    if (!file || !file.webUrl) {
      return Response.json({ error: 'File not found or no web URL available' }, { status: 404 });
    }
    
    // Return the web URL for the file
    return Response.json({ url: file.webUrl });
  } catch (error) {
    console.error('Error opening OneDrive file:', error);
    return Response.json({ error: 'Failed to open file' }, { status: 500 });
  }
}
