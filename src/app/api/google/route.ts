import { google } from 'googleapis';
import { type NextRequest } from 'next/server';
import { env } from '~/env';
import { getStoredTokens, storeTokens } from '~/lib/session';

const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.GOOGLE_REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const storedTokens = getStoredTokens();

  // If we have stored tokens, use them
  if (storedTokens && !code) {
    try {
      oauth2Client.setCredentials(storedTokens);
      return await listFiles(searchParams.get('folderId'));
    } catch (error) {
      console.error('Error with stored tokens:', error);
      // If there's an error with stored tokens, clear them and proceed with new auth
    }
  }

  // If no code is provided, redirect to auth
  if (!code) {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    return Response.json({ url: authUrl });
  }

  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Store tokens for future use
    storeTokens(tokens);

    return await listFiles(searchParams.get('folderId'));
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}

async function listFiles(folderId: string | null) {
  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  
  const response = await drive.files.list({
    q: `'${folderId || 'root'}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, modifiedTime, size)',
    orderBy: 'folder,name',
  });

  const files = response.data.files?.map(file => ({
    id: file.id,
    name: file.name,
    type: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
    size: file.size ? `${Math.round(parseInt(file.size) / 1024)} KB` : undefined,
    modifiedAt: new Date(file.modifiedTime!).toLocaleDateString(),
  })) || [];

  return Response.json({ files });
}
