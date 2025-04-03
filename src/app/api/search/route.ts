import { NextResponse } from "next/server";
import { getActiveServiceAccounts, getStoredTokens } from "~/lib/session";

// Interface for search results
interface SearchResult {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: string;
  modifiedAt: string;
  parentId: string | null;
  service: string;
  accountId: string;
  accountName?: string;
  accountEmail?: string;
  path?: string; // Path to the file/folder for context
}

// Function to search Google Drive recursively
async function searchGoogleDrive(
  query: string,
  token: any,
  accountId: string,
  accountName?: string,
  accountEmail?: string,
): Promise<SearchResult[]> {
  try {
    // Use Google Drive API's search functionality with q parameter
    // This searches across all folders without having to traverse the folder structure
    const searchQuery = `name contains '${query}' and trashed = false`;
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQuery)}&fields=files(id,name,mimeType,size,modifiedTime,parents)`,
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Google Drive search failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Map Google Drive results to our SearchResult interface
    return data.files.map((file: any) => ({
      id: file.id,
      name: file.name,
      type:
        file.mimeType === "application/vnd.google-apps.folder"
          ? "folder"
          : "file",
      size: file.size
        ? `${Math.round(parseInt(file.size) / 1024)} KB`
        : undefined,
      modifiedAt: new Date(file.modifiedTime).toLocaleString(),
      parentId: file.parents?.[0] || null,
      service: "google",
      accountId,
      accountName,
      accountEmail,
    }));
  } catch (error) {
    console.error("Error searching Google Drive:", error);
    return [];
  }
}

// Function to search OneDrive recursively
async function searchOneDrive(
  query: string,
  token: any,
  accountId: string,
  accountName?: string,
  accountEmail?: string,
): Promise<SearchResult[]> {
  try {
    // Use OneDrive API's search functionality
    // This searches across all folders without having to traverse the folder structure
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/search(q='${encodeURIComponent(query)}')`,
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`OneDrive search failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Map OneDrive results to our SearchResult interface
    return data.value.map((file: any) => ({
      id: file.id,
      name: file.name,
      type: file.folder ? "folder" : "file",
      size: file.size ? `${Math.round(file.size / 1024)} KB` : undefined,
      modifiedAt: new Date(file.lastModifiedDateTime).toLocaleString(),
      parentId: file.parentReference?.id || null,
      service: "onedrive",
      accountId,
      accountName,
      accountEmail,
    }));
  } catch (error) {
    console.error("Error searching OneDrive:", error);
    return [];
  }
}

// Function to search Dropbox recursively
async function searchDropbox(
  query: string,
  token: any,
  accountId: string,
  accountName?: string,
  accountEmail?: string,
): Promise<SearchResult[]> {
  try {
    console.log("Searching Dropbox for:", query);
    // Use Dropbox API's search functionality
    const response = await fetch(
      "https://api.dropboxapi.com/2/files/search_v2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          include_highlights: false,
          options: {
            filename_only: true,
            file_extensions: [],
            file_categories: [],
          },
        }),
      },
    );

    console.log("Dropbox search response status:", response.status);

    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}`;
      try {
        const errorData = await response.json();
        console.error("Dropbox search API error details:", errorData);
        errorMessage = JSON.stringify(errorData);
      } catch (e) {
        const errorText = await response.text();
        console.error("Dropbox search API error text:", errorText);
        errorMessage = errorText;
      }
      throw new Error(`Dropbox search failed: ${errorMessage}`);
    }

    const data = await response.json();
    console.log("Dropbox search results count:", data.matches?.length || 0);

    // Map Dropbox results to our SearchResult interface
    return (data.matches || []).map((match: any) => {
      const metadata = match.metadata.metadata;
      return {
        id: metadata.path_lower || metadata.id,
        name: metadata.name,
        type: metadata[".tag"] === "folder" ? "folder" : "file",
        size: metadata.size
          ? `${Math.round(metadata.size / 1024)} KB`
          : undefined,
        modifiedAt: metadata.server_modified
          ? new Date(metadata.server_modified).toLocaleString()
          : "",
        parentId: metadata.path_lower.split("/").slice(0, -1).join("/") || null,
        service: "dropbox",
        accountId,
        accountName,
        accountEmail,
        path: metadata.path_display,
      };
    });
  } catch (error) {
    console.error("Error searching Dropbox:", error);
    return [];
  }
}

export async function GET(request: Request) {
  // Get query parameter
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Search query is required" },
      { status: 400 },
    );
  }

  try {
    // Get all active service accounts
    const serviceAccounts = await getActiveServiceAccounts();

    if (!serviceAccounts || serviceAccounts.length === 0) {
      return NextResponse.json(
        { error: "No active services" },
        { status: 401 },
      );
    }

    // Collect search results from all active service accounts
    const searchPromises: Promise<SearchResult[]>[] = [];

    for (const account of serviceAccounts) {
      const token = await getStoredTokens(account.service, account.id);
      if (!token) continue;

      if (account.service === "google") {
        searchPromises.push(
          searchGoogleDrive(
            query,
            token,
            account.id,
            account.name,
            account.email,
          ),
        );
      } else if (account.service === "onedrive") {
        searchPromises.push(
          searchOneDrive(query, token, account.id, account.name, account.email),
        );
      } else if (account.service === "dropbox") {
        searchPromises.push(
          searchDropbox(query, token, account.id, account.name, account.email),
        );
      }
      // Add more services here as they are implemented
    }

    // Wait for all search operations to complete
    const searchResults = await Promise.all(searchPromises);

    // Combine and sort results (folders first, then alphabetically)
    const combinedResults = searchResults.flat().sort((a, b) => {
      // First sort by type (folders first)
      if (a.type === "folder" && b.type !== "folder") return -1;
      if (a.type !== "folder" && b.type === "folder") return 1;

      // Then sort alphabetically by name
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({ files: combinedResults });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search files" },
      { status: 500 },
    );
  }
}
