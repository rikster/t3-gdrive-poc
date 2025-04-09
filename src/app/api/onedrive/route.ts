import { type NextRequest } from "next/server";
import { env } from "~/env";
import {
  getStoredTokens,
  storeTokens,
  storeAccountMetadata,
  generateAccountId,
  findExistingAccountByEmail,
} from "~/lib/session";
import { Client } from "@microsoft/microsoft-graph-client";

// Microsoft Graph endpoint and auth URLs
const MICROSOFT_ENDPOINT = "https://graph.microsoft.com/v1.0";
const AUTH_ENDPOINT =
  "https://login.microsoftonline.com/common/oauth2/v2.0/authorize";
const TOKEN_ENDPOINT =
  "https://login.microsoftonline.com/common/oauth2/v2.0/token";

// The scopes required for accessing OneDrive files
const SCOPES = ["files.read", "offline_access", "User.Read"].join(" ");

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const accountId = searchParams.get("accountId") || "default";
  const storedTokens = await getStoredTokens("onedrive", accountId);
  const folderId = searchParams.get("folderId") || "root";
  const addAccount = searchParams.get("addAccount") === "true";

  // If we have stored tokens and not adding a new account, use them
  if (storedTokens && !code && !addAccount) {
    try {
      return await listFiles(storedTokens, folderId);
    } catch (error) {
      console.error("Error with stored tokens:", error);
      // If there's an error with stored tokens, clear them and proceed with new auth
    }
  }

  // If no code is provided, redirect to auth
  if (!code) {
    // When adding a new account, force a prompt to select account
    // Microsoft OAuth only supports single prompt value - select_account is sufficient to force account selection
    const promptParam = addAccount ? "&prompt=select_account" : "";

    // Generate a state parameter with the accountId to track this auth request
    const state = JSON.stringify({
      accountId: addAccount ? "new" : accountId,
      addAccount,
    });

    const authUrl = `${AUTH_ENDPOINT}?client_id=${env.ONEDRIVE_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(env.ONEDRIVE_REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}&state=${encodeURIComponent(state)}${promptParam}`;
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
    const tokenResponse = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: env.ONEDRIVE_CLIENT_ID,
        client_secret: env.ONEDRIVE_CLIENT_SECRET,
        code,
        redirect_uri: env.ONEDRIVE_REDIRECT_URI,
        grant_type: "authorization_code",
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(
        `Failed to get token: ${tokenData.error_description || "Unknown error"}`,
      );
    }

    // Format token data to match our TokenData interface
    const tokens = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      scope: tokenData.scope,
      token_type: tokenData.token_type,
      expiry_date: Date.now() + tokenData.expires_in * 1000,
    };

    // Get user info for this account
    const userInfo = await getUserInfo(tokens.access_token);

    // If this is a new account and we have an email, check if it already exists
    if (parsedState.addAccount && userInfo && userInfo.email) {
      const existingAccount = await findExistingAccountByEmail(
        "onedrive",
        userInfo.email,
      );

      if (existingAccount) {
        // Account with this email already exists, redirect to home with error message
        const errorUrl = new URL("/", request.url);
        errorUrl.searchParams.set("error", "duplicate_account");
        errorUrl.searchParams.set(
          "message",
          `An account for ${userInfo.email} already exists`,
        );
        return Response.redirect(errorUrl);
      }
    }

    // If this is a new account, generate a new accountId
    const finalAccountId = parsedState.addAccount
      ? generateAccountId("onedrive", userInfo?.email)
      : parsedState.accountId;

    // Store tokens for future use
    await storeTokens(tokens, "onedrive", finalAccountId);

    // Store account metadata
    if (userInfo) {
      await storeAccountMetadata(
        {
          id: finalAccountId,
          service: "onedrive",
          name: userInfo.name || "OneDrive Account",
          email: userInfo.email,
        },
        "onedrive",
        finalAccountId,
      );
    }

    // Redirect to main page after successful authentication
    return Response.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "Failed to fetch OneDrive files" },
      { status: 500 },
    );
  }
}

async function listFiles(tokens: any, folderId: string) {
  try {
    const client = Client.init({
      authProvider: (done) => {
        done(null, tokens.access_token);
      },
    });

    let endpoint = "";

    if (folderId === "root") {
      endpoint = `/me/drive/root/children`;
    } else {
      endpoint = `/me/drive/items/${folderId}/children`;
    }

    // The Microsoft Graph API requires a different orderby format than the one we were using
    const response = await client
      .api(endpoint)
      .select("id,name,folder,file,size,lastModifiedDateTime")
      .orderby("name asc") // Using a single value primitive type
      .get();

    // Ensure response.value exists, if not, return an empty array
    const items = response.value || [];

    // Sort folders first, then files (since we can't use folder in orderby)
    const sortedItems = items.sort((a: any, b: any) => {
      // If a is a folder and b is not, a comes first
      if (a.folder && !b.folder) return -1;
      // If b is a folder and a is not, b comes first
      if (!a.folder && b.folder) return 1;
      // Otherwise, sort by name
      return a.name.localeCompare(b.name);
    });

    const files = sortedItems.map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.folder ? "folder" : "file",
      size: item.size ? `${Math.round(item.size / 1024)} KB` : undefined,
      modifiedAt: new Date(item.lastModifiedDateTime).toLocaleDateString(),
      parentId: folderId === "root" ? null : folderId,
    }));

    return Response.json({ files });
  } catch (error) {
    console.error("Error listing OneDrive files:", error);
    // Even on error, return an empty files array rather than undefined
    return Response.json(
      { files: [], error: "Failed to list OneDrive files" },
      { status: 500 },
    );
  }
}

// Get user information from Microsoft Graph API
async function getUserInfo(accessToken: string) {
  try {
    const client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });

    const userInfo = await client
      .api("/me")
      .select("displayName,mail,userPrincipalName")
      .get();

    return {
      email: userInfo.mail || userInfo.userPrincipalName,
      name: userInfo.displayName,
    };
  } catch (error) {
    console.error("Error fetching OneDrive user info:", error);
    return null;
  }
}
