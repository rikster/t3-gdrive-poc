import { type NextRequest } from "next/server";
import { env } from "~/env";
import { getStoredTokens, storeTokens, clearTokens, storeAccountMetadata, generateAccountId } from "~/lib/session";

// Dropbox API endpoints
const AUTH_URL = "https://www.dropbox.com/oauth2/authorize";
const TOKEN_URL = "https://api.dropboxapi.com/oauth2/token";
const USER_INFO_ENDPOINT = "https://api.dropboxapi.com/2/users/get_current_account";
const LIST_FOLDER_URL = "https://api.dropboxapi.com/2/files/list_folder";
const LIST_FOLDER_CONTINUE_URL = "https://api.dropboxapi.com/2/files/list_folder/continue";
const DOWNLOAD_URL = "https://content.dropboxapi.com/2/files/download";

// Dropbox OAuth scopes
const SCOPES = "account_info.read files.metadata.read files.content.read";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const accountId = searchParams.get("accountId") || "default";
  const storedTokens = await getStoredTokens("dropbox", accountId);
  const folderId = searchParams.get("folderId") || "";
  const addAccount = searchParams.get("addAccount") === "true";

  // If we have stored tokens and not adding a new account, use them
  if (storedTokens && !code && !addAccount) {
    try {
      return await listFiles(storedTokens, folderId, accountId);
    } catch (error) {
      console.error("Error with stored tokens:", error);
      // If there's an error with stored tokens, clear them and proceed with new auth
      await clearTokens("dropbox", accountId);
    }
  }

  // If no code is provided, redirect to auth
  if (!code) {
    // When adding a new account, force select account prompt
    const forceReauth = addAccount ? "&force_reauth=true" : "";

    // Create a state parameter to track if we're adding a new account
    const state = JSON.stringify({
      addAccount,
      accountId,
    });

    // Dropbox OAuth URL
    const authUrl = `${AUTH_URL}?client_id=${env.DROPBOX_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(env.DROPBOX_REDIRECT_URI)}&token_access_type=offline&scope=${encodeURIComponent(SCOPES)}&state=${encodeURIComponent(state)}${forceReauth}`;
    console.log("Redirecting to Dropbox auth URL:", authUrl);
    return Response.json({ url: authUrl });
  }

  try {
    console.log("Received code from Dropbox, exchanging for token...");
    
    // Parse state parameter if available
    const state = searchParams.get("state");
    let parsedState = { addAccount: false, accountId: "default" };
    
    if (state) {
      try {
        parsedState = JSON.parse(state);
      } catch (e) {
        console.error("Error parsing state:", e);
      }
    }
    
    // If this is a new account, generate a new accountId
    const finalAccountId = parsedState.addAccount
      ? generateAccountId("dropbox")
      : parsedState.accountId;
    
    // Exchange code for tokens
    const tokenResponse = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: env.DROPBOX_CLIENT_ID,
        client_secret: env.DROPBOX_CLIENT_SECRET,
        code,
        redirect_uri: env.DROPBOX_REDIRECT_URI,
        grant_type: "authorization_code",
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token error response:", errorText);
      throw new Error(`Failed to get token: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log("Received token data from Dropbox");

    // Format token data to match our TokenData interface
    const tokens = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || "", // Dropbox might not always return a refresh token
      scope: tokenData.scope || SCOPES,
      token_type: tokenData.token_type,
      expiry_date: Date.now() + (tokenData.expires_in || 14400) * 1000, // Default to 4 hours if not provided
    };

    // Store tokens for future use
    await storeTokens(tokens, "dropbox", finalAccountId);
    console.log("Stored Dropbox tokens");

    // Get user info to store with account
    const userInfo = await getUserInfo(tokens.access_token);
    console.log("User info for account metadata:", userInfo);
    if (userInfo) {
      await storeAccountMetadata(
        {
          id: finalAccountId,
          service: "dropbox",
          name: userInfo.name || "Dropbox Account",
          email: userInfo.email || "",
        },
        "dropbox",
        finalAccountId,
      );
      console.log("Stored account metadata with email:", userInfo.email);
    }

    // Redirect to main page after successful authentication
    return Response.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Error in Dropbox authentication:", error);
    return Response.json(
      { error: "Failed to authenticate with Dropbox" },
      { status: 500 },
    );
  }
}

// Function to get user info from Dropbox
async function getUserInfo(accessToken: string) {
  try {
    console.log("Fetching Dropbox user info...");
    const response = await fetch(USER_INFO_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      // Dropbox API requires an empty JSON object in the request body
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      console.error(`Error fetching user info: ${response.status} ${response.statusText}`);
      
      // Log more details about the error
      try {
        const errorData = await response.json();
        console.error("Dropbox API error details:", errorData);
      } catch (jsonError) {
        console.error("Could not parse error response as JSON");
      }
      
      return null;
    }

    const userData = await response.json();
    console.log("Raw Dropbox user data:", userData);
    
    // Extract email and name from the response
    let email = "";
    let name = "";
    
    if (userData) {
      // Try to get email directly
      if (userData.email) {
        email = userData.email;
      }
      
      // Try to get display name
      if (userData.name && userData.name.display_name) {
        name = userData.name.display_name;
      }
    }
    
    console.log("Extracted user info - Email:", email, "Name:", name);
    
    return {
      name: name,
      email: email,
    };
  } catch (error) {
    console.error("Error getting user info:", error);
    return null;
  }
}

async function listFiles(tokens: any, folderId: string, accountId: string = "default") {
  try {
    // For Dropbox API, the root folder must be specified as "" (empty string)
    // Any other folder must be specified with its full path
    let path = "";
    if (folderId && folderId !== "root") {
      path = folderId;
    }

    console.log("Listing Dropbox files for path:", path);

    // First, get user info to include with files
    const userInfo = await getUserInfo(tokens.access_token);
    console.log("Retrieved Dropbox user info:", userInfo);
    const accountEmail = userInfo?.email || "";

    // Call Dropbox API to list files
    const response = await fetch(LIST_FOLDER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: path === "root" ? "" : path,
        recursive: false,
        include_media_info: false,
        include_deleted: false,
        include_has_explicit_shared_members: false,
        include_mounted_folders: true,
      }),
    });

    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        console.error("Dropbox API error:", errorData);
        const errorText = errorData.error_summary || errorData.error?.toString() || errorMessage;
        errorMessage = errorText;
      } catch (e) {
        console.error("Error parsing error response:", e);
      }
      throw new Error(`Dropbox API error: ${errorMessage}`);
    }

    const data = await response.json();
    console.log("Dropbox entries count:", data.entries?.length || 0);

    // Transform Dropbox entries to match our unified format
    const files = (data.entries || []).map((entry: any) => {
      return {
        id: entry.path_lower || entry.id,
        name: entry.name,
        type: entry[".tag"] === "folder" ? "folder" : "file",
        size: entry.size ? `${Math.round(entry.size / 1024)} KB` : undefined,
        modifiedAt: entry.server_modified
          ? new Date(entry.server_modified).toLocaleDateString()
          : "",
        parentId: path === "" ? null : path,
        service: "dropbox",
        accountId: accountId,
        accountEmail: accountEmail, // Ensure email is included
      };
    });

    // Sort files (folders first, then alphabetically)
    const sortedFiles = [...files].sort((a, b) => {
      if (a.type === "folder" && b.type !== "folder") return -1;
      if (a.type !== "folder" && b.type === "folder") return 1;
      return a.name.localeCompare(b.name);
    });

    // Log some files to verify email is included
    if (sortedFiles.length > 0) {
      console.log("Sample Dropbox file with email:", JSON.stringify({
        name: sortedFiles[0].name,
        service: sortedFiles[0].service,
        accountEmail: sortedFiles[0].accountEmail
      }));
    }

    // If there's a cursor for pagination, use the continue endpoint
    if (data.cursor) {
      console.log("Using cursor for pagination:", data.cursor);
      const continueResponse = await fetch(LIST_FOLDER_CONTINUE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cursor: data.cursor,
        }),
      });

      if (!continueResponse.ok) {
        console.error("Error fetching continued files:", continueResponse.statusText);
        return Response.json({ error: "Failed to fetch continued files" });
      }

      const continueData = await continueResponse.json();
      return Response.json({
        files: sortedFiles,
        hasMore: continueData.has_more,
        cursor: continueData.cursor,
      });
    }

    return Response.json({ files: sortedFiles });
  } catch (error) {
    console.error("Error listing Dropbox files:", error);
    return Response.json({ error: "Failed to list files" });
  }
}
