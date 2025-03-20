import { google } from "googleapis";
import { type NextRequest } from "next/server";
import { env } from "~/env";
import {
  getStoredTokens,
  storeTokens,
  storeAccountMetadata,
  generateAccountId,
} from "~/lib/session";

// Helper function to create an OAuth2 client
function createOAuth2Client() {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI,
  );
}

// Constants for Google OAuth
const SCOPES = [
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const accountId = searchParams.get("accountId") || "default";
  const folderId = searchParams.get("folderId") || "root";
  const addAccount = searchParams.get("addAccount") === "true";

  // Create a new oauth client for this request
  const oauth2Client = createOAuth2Client();

  // If not adding a new account, try to use stored tokens
  if (!addAccount) {
    const storedTokens = await getStoredTokens("google", accountId);

    // If we have stored tokens and no code is provided, use the stored tokens
    if (storedTokens && !code) {
      try {
        oauth2Client.setCredentials(storedTokens);
        return await listFiles(oauth2Client, folderId, accountId);
      } catch (error) {
        console.error("Error with stored tokens:", error);
        // If there's an error with stored tokens, proceed with new auth
      }
    }
  }

  // If no code is provided, redirect to auth
  if (!code) {
    // Generate a state parameter with the accountId to track this auth request
    // We'll also include addAccount flag to know if this is for a new account
    const state = JSON.stringify({
      accountId: addAccount ? "new" : accountId,
      addAccount,
    });

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
      state,
      // Force approval prompt and account selection to ensure we get a refresh token for new accounts
      prompt: addAccount ? "consent select_account" : undefined,
    });

    return Response.json({ url: authUrl });
  }

  try {
    // Get the state parameter to identify the account this token is for
    const state = searchParams.get("state");
    let parsedState: { accountId: string; addAccount: boolean } = {
      accountId,
      addAccount: false,
    };

    if (state) {
      try {
        parsedState = JSON.parse(state);
      } catch (e) {
        console.error("Error parsing state:", e);
      }
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // If this is a new account, generate a new accountId
    const finalAccountId = parsedState.addAccount
      ? generateAccountId("google")
      : parsedState.accountId;

    // Format tokens to match our TokenData interface
    const formattedTokens: any = {
      access_token: tokens.access_token || "",
      refresh_token: tokens.refresh_token,
      scope: tokens.scope || "",
      token_type: tokens.token_type || "Bearer",
      expiry_date: tokens.expiry_date || Date.now() + 3600 * 1000,
    };

    // Store tokens with the appropriate accountId
    await storeTokens(formattedTokens, "google", finalAccountId);

    // Get user info for this account to store with tokens
    const userInfo = await getUserInfo(oauth2Client);
    if (userInfo) {
      await storeAccountMetadata(
        {
          id: finalAccountId,
          service: "google",
          name: userInfo.name || "Google Drive Account",
          email: userInfo.email,
        },
        "google",
        finalAccountId,
      );
    }

    // Redirect to main page after successful authentication
    return Response.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ error: "Failed to authenticate" }, { status: 500 });
  }
}

// Get user info from Google
async function getUserInfo(auth: any) {
  try {
    // Use the oauth2 API which works with our scopes
    const oauth2 = google.oauth2({
      auth,
      version: "v2",
    });

    try {
      const { data } = await oauth2.userinfo.get();
      return {
        email: data.email || "",
        name: data.name || "",
      };
    } catch (error) {
      console.error("Error fetching user info from userinfo API:", error);
      
      // If we can't get the email from userinfo, try to get it from token info
      if (auth && auth.credentials && auth.credentials.access_token) {
        try {
          const tokenInfo = await auth.getTokenInfo(auth.credentials.access_token);
          if (tokenInfo && tokenInfo.email) {
            return {
              email: tokenInfo.email,
              name: tokenInfo.email.split('@')[0],
            };
          }
        } catch (tokenError) {
          console.error("Error getting token info:", tokenError);
        }
      }
      
      // If all else fails, return empty values
      return {
        email: "",
        name: "",
      };
    }
  } catch (error) {
    console.error("Error in getUserInfo:", error);
    return {
      email: "",
      name: "",
    };
  }
}

// List files from Google Drive using the provided auth client
async function listFiles(auth: any, folderId: string, accountId: string = "default") {
  try {
    const drive = google.drive({ version: "v3", auth });
    const response = await drive.files.list({
      q: folderId === "root" ? "'root' in parents" : `'${folderId}' in parents`,
      pageSize: 100,
      fields: "files(id, name, mimeType, modifiedTime, size, parents)",
    });

    if (!response.data.files) {
      return Response.json({ files: [] });
    }

    // Get user info to include with files
    const userInfo = await getUserInfo(auth);
    const userEmail = userInfo?.email || undefined;
    
    // Transform the data to a format our UI expects
    const files = response.data.files.map((file) => ({
      id: file.id,
      name: file.name,
      modifiedAt: file.modifiedTime,
      parentId: file.parents?.[0] || null,
      size: file.size
        ? `${Math.round(parseInt(file.size) / 1024)} KB`
        : undefined,
      type:
        file.mimeType === "application/vnd.google-apps.folder"
          ? "folder"
          : "file",
      accountEmail: userEmail,
      accountId: accountId,
    }));

    return Response.json({ files });
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}
