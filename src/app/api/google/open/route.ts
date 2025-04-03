import { google } from "googleapis";
import { type NextRequest } from "next/server";
import { env } from "~/env";
import { getStoredTokens } from "~/lib/session";

// Helper function to create an OAuth2 client
function createOAuth2Client() {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI,
  );
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fileId = searchParams.get("fileId");
  const accountId = searchParams.get("accountId") ?? "default";

  if (!fileId) {
    return Response.json({ error: "File ID is required" }, { status: 400 });
  }

  const storedTokens = await getStoredTokens("google", accountId);

  if (!storedTokens) {
    return Response.json(
      { error: "Not authenticated with Google Drive" },
      { status: 401 },
    );
  }

  try {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials(storedTokens);
    const drive = google.drive({ version: "v3", auth: oauth2Client });

    // Get the file metadata to determine if it's a Google Workspace file
    const file = await drive.files.get({
      fileId,
      fields: "id,name,mimeType,webViewLink",
    });

    if (!file.data?.webViewLink) {
      return Response.json(
        { error: "File not found or no view link available" },
        { status: 404 },
      );
    }

    // Return the web view link for the file
    return Response.json({ url: file.data.webViewLink });
  } catch (error) {
    console.error("Error opening Google Drive file:", error);
    return Response.json({ error: "Failed to open file" }, { status: 500 });
  }
}
