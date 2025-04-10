import { google } from "googleapis";
import { type NextRequest } from "next/server";
import { env } from "~/env";
import {
  getStoredTokens,
  storeTokens,
  storeAccountMetadata,
  generateAccountId,
  findExistingAccountByEmail,
  isTokenValid,
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
  const accountId = searchParams.get("accountId") ?? "default";
  const folderId = searchParams.get("folderId") ?? "root";
  const addAccount = searchParams.get("addAccount") === "true";

  // Create a new oauth client for this request
  const oauth2Client = createOAuth2Client();

  // If not adding a new account, try to use stored tokens
  if (!addAccount) {
    const storedTokens = await getStoredTokens("google", accountId);

    // If we have stored tokens and no code is provided, check if they're valid
    if (storedTokens && !code) {
      // First check if the token is valid
      const tokenValid = isTokenValid(storedTokens);
      try {
        // If token is not valid but we have a refresh token, try to refresh it
        if (!tokenValid && storedTokens.refresh_token) {
          console.log("Token expired, attempting to refresh...");
          try {
            // Try to refresh the token using a new OAuth2 client
            const refreshClient = createOAuth2Client();
            refreshClient.setCredentials({
              refresh_token: storedTokens.refresh_token,
            });

            // Use the refreshAccessToken method instead
            const response = await refreshClient.refreshAccessToken();
            const tokens = response.credentials;

            // Update stored tokens with new access token
            const updatedTokens = {
              ...storedTokens,
              access_token: tokens.access_token ?? storedTokens.access_token,
              expiry_date: tokens.expiry_date ?? Date.now() + 3600 * 1000,
            };

            await storeTokens(updatedTokens, "google", accountId);
            oauth2Client.setCredentials(updatedTokens);
            console.log("Token refreshed successfully");
          } catch (refreshError) {
            console.error("Error refreshing token:", refreshError);
            // If refresh fails, redirect to auth
            const authUrl = oauth2Client.generateAuthUrl({
              access_type: "offline",
              scope: SCOPES,
              state: JSON.stringify({ accountId, addAccount: false }),
              prompt: "consent",
            });
            return Response.json({
              url: authUrl,
              error: "Token expired and refresh failed",
            });
          }
        } else {
          // Token not expired, use it
          oauth2Client.setCredentials(storedTokens);
        }

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
        const parsed = JSON.parse(state) as {
          accountId: string;
          addAccount: boolean;
        };
        // Validate the parsed state has the expected properties
        if (
          typeof parsed.accountId === "string" &&
          typeof parsed.addAccount === "boolean"
        ) {
          parsedState = parsed;
        }
      } catch (e) {
        console.error("Error parsing state:", e);
      }
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info for this account
    const userInfo = await getUserInfo(oauth2Client);

    // If this is a new account and we have an email, check if it already exists
    if (parsedState.addAccount && userInfo?.email) {
      const existingAccount = await findExistingAccountByEmail(
        "google",
        userInfo.email,
      );

      if (existingAccount) {
        // Account with this email already exists, redirect to home with error message
        // Use NEXT_PUBLIC_SITE_URL for consistent URLs across environments
        const errorUrl = new URL("/", env.NEXT_PUBLIC_SITE_URL);

        // Add a timestamp to prevent browser caching issues
        const timestamp = Date.now();

        // Add error parameters
        errorUrl.searchParams.set("error", "duplicate_account");
        errorUrl.searchParams.set(
          "message",
          `An account for ${userInfo.email} already exists. Please use a different account.`,
        );
        errorUrl.searchParams.set("t", timestamp.toString());

        // Add a special flag to indicate this is a critical error that should not be ignored
        errorUrl.searchParams.set("critical", "true");

        console.log(`Redirecting to error URL: ${errorUrl.toString()}`);
        return Response.redirect(errorUrl, 303); // Use 303 status to ensure GET request
      }
    }

    // If this is a new account, generate a new accountId
    const finalAccountId = parsedState.addAccount
      ? generateAccountId("google", userInfo?.email)
      : parsedState.accountId;

    // Format tokens to match our TokenData interface
    const formattedTokens = {
      access_token: tokens.access_token ?? "",
      refresh_token: tokens.refresh_token ?? undefined,
      scope: tokens.scope ?? "",
      token_type: tokens.token_type ?? "Bearer",
      expiry_date: tokens.expiry_date ?? Date.now() + 3600 * 1000,
    };

    // Store tokens with the appropriate accountId
    await storeTokens(formattedTokens, "google", finalAccountId);

    // Store account metadata
    if (userInfo) {
      await storeAccountMetadata(
        {
          id: finalAccountId,
          service: "google",
          name: userInfo.name ?? "Google Drive Account",
          email: userInfo.email,
        },
        "google",
        finalAccountId,
      );
    }

    // Redirect to main page after successful authentication
    // Use NEXT_PUBLIC_SITE_URL for consistent URLs across environments
    return Response.redirect(`${env.NEXT_PUBLIC_SITE_URL}/`);
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ error: "Failed to authenticate" }, { status: 500 });
  }
}

// Get user info from Google
async function getUserInfo(auth: ReturnType<typeof createOAuth2Client>) {
  try {
    // Use the oauth2 API which works with our scopes
    const oauth2 = google.oauth2({
      auth,
      version: "v2",
    });

    try {
      const { data } = await oauth2.userinfo.get();
      return {
        email: data.email ?? "",
        name: data.name ?? "",
      };
    } catch (error) {
      console.error("Error fetching user info from userinfo API:", error);

      // If we can't get the email from userinfo, try to get it from token info
      if (auth?.credentials?.access_token) {
        try {
          const tokenInfo = await auth.getTokenInfo(
            auth.credentials?.access_token,
          );
          if (tokenInfo?.email) {
            return {
              email: tokenInfo.email,
              name: tokenInfo.email.split("@")[0],
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
async function listFiles(
  auth: ReturnType<typeof createOAuth2Client>,
  folderId: string,
  accountId = "default",
) {
  try {
    // Validate auth object
    if (!auth?.credentials?.access_token) {
      console.error("Invalid auth object or missing credentials");
      return Response.json(
        { error: "Invalid authentication credentials", files: [] },
        { status: 401 },
      );
    }

    const drive = google.drive({ version: "v3", auth });

    try {
      const response = await drive.files.list({
        q:
          folderId === "root"
            ? "'root' in parents"
            : `'${folderId}' in parents`,
        pageSize: 100,
        fields: "files(id, name, mimeType, modifiedTime, size, parents)",
      });

      if (!response.data.files) {
        return Response.json({ files: [] });
      }

      // Get user info to include with files
      const userInfo = await getUserInfo(auth);
      const userEmail = userInfo?.email ?? undefined;

      // Transform the data to a format our UI expects
      const files = response.data.files.map((file) => ({
        id: file.id,
        name: file.name,
        modifiedAt: file.modifiedTime,
        parentId: file.parents?.[0] ?? null,
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
    } catch (apiError: unknown) {
      // Handle specific Google API errors
      console.error("Google Drive API error:", apiError);

      // Check if it's an auth error
      const typedError = apiError as {
        code?: number;
        response?: { status?: number };
      };
      if (
        typedError.code === 401 ||
        typedError.code === 403 ||
        typedError.response?.status === 401 ||
        typedError.response?.status === 403
      ) {
        // Auth error - token might be invalid or expired
        return Response.json(
          { error: "Authentication error. Please sign in again.", files: [] },
          { status: 401 },
        );
      }

      // Other API errors
      const errorMessage =
        (apiError as Error).message ??
        "Failed to fetch files from Google Drive";
      return Response.json({ error: errorMessage, files: [] }, { status: 500 });
    }
  } catch (error) {
    console.error("Unexpected error in listFiles:", error);
    return Response.json(
      { error: "An unexpected error occurred while fetching files", files: [] },
      { status: 500 },
    );
  }
}
